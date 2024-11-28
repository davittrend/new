import { Handler } from '@netlify/functions';
import { addMinutes, isBefore } from 'date-fns';

interface ScheduledPin {
  id: string;
  title: string;
  description: string;
  link?: string;
  imageUrl: string;
  boardId: string;
  scheduledTime: string;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const scheduledPins = JSON.parse(process.env.SCHEDULED_PINS || '[]') as ScheduledPin[];

    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ pins: scheduledPins })
      };
    }

    if (event.httpMethod === 'POST') {
      const pin = JSON.parse(event.body || '{}');
      
      // Validate scheduling time
      const scheduledTime = new Date(pin.scheduledTime);
      const minScheduleTime = addMinutes(new Date(), 5);
      
      if (isBefore(scheduledTime, minScheduleTime)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Scheduled time must be at least 5 minutes in the future'
          })
        };
      }

      // Add pin to scheduled list
      const updatedPins = [...scheduledPins, { ...pin, status: 'scheduled' }];
      process.env.SCHEDULED_PINS = JSON.stringify(updatedPins);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Pin scheduled successfully',
          pin: { ...pin, status: 'scheduled' }
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Scheduler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    };
  }
};
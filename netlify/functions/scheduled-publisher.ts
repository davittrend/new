import { Handler, schedule } from '@netlify/functions';
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

// Run every 5 minutes
const handler: Handler = schedule('*/5 * * * *', async () => {
  console.log('Checking for pins to publish...');

  try {
    // Get all scheduled pins
    const response = await fetch('/.netlify/functions/pin-scheduler', {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch scheduled pins');
    }

    const { pins } = await response.json() as { pins: ScheduledPin[] };
    const now = new Date();

    // Filter pins that need to be published
    const pinsToPublish = pins.filter(pin => {
      const scheduledTime = new Date(pin.scheduledTime);
      return pin.status === 'scheduled' && isBefore(scheduledTime, now);
    });

    if (pinsToPublish.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No pins to publish at this time' })
      };
    }

    // Process each pin
    const results = await Promise.allSettled(
      pinsToPublish.map(async (pin) => {
        try {
          // Convert data URL to actual image URL if needed
          let imageUrl = pin.imageUrl;
          if (imageUrl.startsWith('data:')) {
            // Upload to a temporary storage service
            // For demo, we'll use a placeholder
            imageUrl = 'https://picsum.photos/800/600';
          }

          const pinData = {
            title: pin.title,
            description: pin.description,
            board_id: pin.boardId,
            media_source: {
              source_type: 'image_url',
              url: imageUrl
            },
            ...(pin.link && { link: pin.link })
          };

          // Publish to Pinterest
          const publishResponse = await fetch('/.netlify/functions/pinterest-pin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pin: pinData })
          });

          if (!publishResponse.ok) {
            throw new Error('Failed to publish pin');
          }

          const publishData = await publishResponse.json();
          return { pin, success: true, pinterestId: publishData.id };
        } catch (error) {
          return { 
            pin, 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to publish pin'
          };
        }
      })
    );

    // Update pin statuses
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { pin, success, pinterestId, error } = result.value;
        
        const updateResponse = await fetch('/.netlify/functions/pin-scheduler', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: pin.id,
            status: success ? 'published' : 'failed',
            ...(success && { pinterestId }),
            ...(error && { error })
          })
        });

        if (!updateResponse.ok) {
          console.error(`Failed to update pin status: ${pin.id}`);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Published ${results.filter(r => r.status === 'fulfilled' && r.value.success).length} pins`,
        results
      })
    };
  } catch (error) {
    console.error('Scheduler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    };
  }
});

export { handler };
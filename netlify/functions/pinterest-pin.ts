import { Handler } from '@netlify/functions';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';

interface PinData {
  title: string;
  description: string;
  link?: string;
  media_source: {
    source_type: 'image_url';
    url: string;
  };
  board_id: string;
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const authorization = event.headers.authorization;
    if (!authorization) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No authorization token provided' })
      };
    }

    const { pin } = JSON.parse(event.body || '{}');
    if (!pin) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Pin data is required' })
      };
    }

    // Handle data URLs and blob URLs by converting to a placeholder
    let imageUrl = pin.media_source.url;
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      // In production, you would upload the image to a storage service
      imageUrl = 'https://picsum.photos/800/600';
    }

    // Prepare pin data for Pinterest API
    const pinData: PinData = {
      title: pin.title,
      description: pin.description,
      board_id: pin.boardId || pin.board_id, // Handle both formats
      media_source: {
        source_type: 'image_url',
        url: imageUrl
      }
    };

    if (pin.link) {
      pinData.link = pin.link;
    }

    // Create pin using Pinterest API
    const response = await fetch(`${PINTEREST_API_URL}/pins`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pinData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create pin');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Pinterest Pin Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create pin'
      })
    };
  }
};
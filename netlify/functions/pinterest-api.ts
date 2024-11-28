import { Handler } from '@netlify/functions';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const path = event.queryStringParameters?.path;
  const authorization = event.headers.authorization;

  if (!authorization) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Authorization required' })
    };
  }

  try {
    // Handle file uploads by converting data URLs to actual image URLs
    let body = event.body;
    if (body && path === '/pins') {
      const data = JSON.parse(body);
      if (data.media_source?.url?.startsWith('data:')) {
        // For demo purposes, we'll use a placeholder image
        // In production, you would upload the image to a storage service
        data.media_source.url = 'https://picsum.photos/800/600';
        body = JSON.stringify(data);
      }
    }

    const response = await fetch(`${PINTEREST_API_URL}${path}`, {
      method: event.httpMethod,
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      ...(body && { body })
    });

    const data = await response.json();

    // If token is expired, return 401 so client can refresh
    if (response.status === 401) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token expired' })
      };
    }

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Pinterest API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      })
    };
  }
};
import { Tweet } from "./types"
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const X_API_BASE = 'https://api.twitter.com/2';

interface XResponse {
  data: Tweet[];
  includes?: {
    users: Array<{
      id: string;
      name: string;
      username: string;
      profile_image_url: string;
    }>;
    media?: Array<{
      media_key: string;
      type: string;
      url: string;
    }>;
  };
  meta: {
    result_count: number;
    newest_id?: string;
    oldest_id?: string;
    next_token?: string;
  };
}

const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_API_KEY!,
    secret: process.env.TWITTER_API_SECRET!
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto
      .createHmac('sha1', key)
      .update(base_string)
      .digest('base64');
  },
});

export async function searchTweets(query: string): Promise<XResponse> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    throw new Error("X API Bearer Token is not configured");
  }

  const params = new URLSearchParams({
    query,
    'tweet.fields': 'created_at,author_id,public_metrics,attachments',
    'max_results': '10',
    'expansions': 'author_id,attachments.media_keys',
    'user.fields': 'name,username,profile_image_url',
    'media.fields': 'url,preview_image_url,type'
  });

  try {
    const response = await fetch(
      `${X_API_BASE}/tweets/search/recent?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `X API Error: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`
      );
    }

    const data: XResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch tweets: ${error.message}`);
    }
    throw error;
  }
}

// Add this function if you need to make authenticated requests
async function makeAuthenticatedRequest(endpoint: string, method: string = 'GET', data?: any) {
  const oauth = {
    consumer_key: process.env.TWITTER_API_KEY!,
    consumer_secret: process.env.TWITTER_API_SECRET!,
    token: process.env.TWITTER_ACCESS_TOKEN!,
    token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
  };

  // You'll need to implement OAuth 1.0a signing here
  // Consider using a library like 'oauth-1.0a'
  
  const response = await fetch(`${X_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': 'OAuth ' + createOAuthHeader(oauth, method, endpoint, data),
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `X API Error: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`
    );
  }

  return response.json();
}

// Helper function to create OAuth header (you'll need to implement this)
function createOAuthHeader(method: string, url: string, data?: any): string {
  const token = {
    key: process.env.TWITTER_ACCESS_TOKEN!,
    secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
  };

  const authData = oauth.authorize({
    url,
    method,
    data
  }, token);

  return oauth.toHeader(authData)['Authorization'];
}
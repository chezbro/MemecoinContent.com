import { Tweet } from "./types"
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import redis from './redis';

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

const CACHE_KEY_PREFIX = 'twitter:search:';
const CACHE_DURATION = 60 * 5; // 5 minutes in seconds

// In-memory fallback cache for when Redis is unavailable
const memoryCache = new Map<string, { data: XResponse; timestamp: number }>();
const MEMORY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const RATE_LIMIT = {
  REQUESTS_PER_WINDOW: 60,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes in milliseconds
};

// Track rate limiting
let requestCount = 0;
let windowStart = Date.now();

export async function searchTweets(query: string): Promise<XResponse> {
  const cacheKey = `${CACHE_KEY_PREFIX}${query}`;
  
  // Check rate limits first
  const now = Date.now();
  if (now - windowStart >= RATE_LIMIT.WINDOW_MS) {
    // Reset window if 15 minutes have passed
    requestCount = 0;
    windowStart = now;
  }

  if (requestCount >= RATE_LIMIT.REQUESTS_PER_WINDOW) {
    const windowReset = windowStart + RATE_LIMIT.WINDOW_MS;
    const waitTime = Math.ceil((windowReset - now) / 1000);
    throw new Error(`Rate limit exceeded. Try again in ${waitTime} seconds.`);
  }

  try {
    // Try cache first
    if (redis) {
      try {
        const cachedData = await redis.get<XResponse>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      } catch (redisError) {
        console.warn('Redis error:', redisError);
      }
    }

    // Check memory cache
    const memoryCached = memoryCache.get(cacheKey);
    if (memoryCached && Date.now() - memoryCached.timestamp < MEMORY_CACHE_DURATION) {
      return memoryCached.data;
    }

    // Make API request if no cache hit
    requestCount++;
    const data = await fetchTwitterData(query);
    
    // Cache the response
    if (redis) {
      try {
        await redis.set(cacheKey, data, {
          ex: CACHE_DURATION
        });
      } catch (redisError) {
        console.warn('Failed to cache in Redis:', redisError);
      }
    }

    memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      // Try to return stale data if available
      const memoryCached = memoryCache.get(cacheKey);
      if (memoryCached) {
        return memoryCached.data;
      }
    }
    throw error;
  }
}

async function fetchTwitterData(query: string): Promise<XResponse> {
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

  const response = await fetch(
    `${X_API_BASE}/tweets/search/recent?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Handle rate limit headers
  const rateLimitRemaining = parseInt(response.headers.get('x-rate-limit-remaining') || '0');
  const rateLimitReset = parseInt(response.headers.get('x-rate-limit-reset') || '0') * 1000;
  const currentTime = Date.now();

  // Update our rate limit tracking based on headers
  if (rateLimitRemaining === 0) {
    requestCount = RATE_LIMIT.REQUESTS_PER_WINDOW;
    windowStart = currentTime - RATE_LIMIT.WINDOW_MS + (rateLimitReset - currentTime);
  }

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('retry-after') || '60');
    throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `X API Error: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`
    );
  }

  return response.json();
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

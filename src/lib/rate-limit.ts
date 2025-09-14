import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  maxRequestsPerInterval?: number;
};

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500, // Max 500 unique users per interval
    ttl: options?.interval || 60000, // 1 minute by default
  });

  return {
    check: (req: NextRequest, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        
        tokenCount[0] += 1;
        
        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;
        
        // Add rate limit headers
        const headers = new Headers();
        headers.set('X-RateLimit-Limit', limit.toString());
        headers.set('X-RateLimit-Remaining', isRateLimited ? '0' : (limit - currentUsage).toString());
        
        if (isRateLimited) {
          const rateLimitedResponse = new NextResponse(
            JSON.stringify({
              success: false,
              error: 'Too many requests',
              message: 'Rate limit exceeded',
            }),
            {
              status: 429,
              headers: {
                ...Object.fromEntries(headers.entries()),
                'Content-Type': 'application/json',
              },
            }
          );
          
          reject(rateLimitedResponse);
        } else {
          headers.forEach((value, key) => {
            req.headers.set(key, value);
          });
          resolve();
        }
      }),
  };
}

// Create a default rate limiter (100 requests per minute per IP)
export const defaultRateLimiter = rateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60000, // 1 minute
  maxRequestsPerInterval: 100,
});

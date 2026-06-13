import type { Request, RequestHandler } from 'express';

type RateLimitOptions = {
  key: (req: Request) => string;
  max: number;
  windowMs: number;
  message: string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export function createRateLimit({ key, max, message, windowMs }: RateLimitOptions): RequestHandler {
  const buckets = new Map<string, Bucket>();

  return (req, res, next) => {
    const now = Date.now();
    const bucketKey = key(req);
    const current = buckets.get(bucketKey);
    const bucket = current && current.resetAt > now ? current : { count: 0, resetAt: now + windowMs };
    bucket.count += 1;
    buckets.set(bucketKey, bucket);

    if (bucket.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        error: 'RateLimitExceeded',
        message,
      });
      return;
    }

    if (buckets.size > 1000) {
      for (const [candidateKey, candidate] of buckets.entries()) {
        if (candidate.resetAt <= now) buckets.delete(candidateKey);
      }
    }

    next();
  };
}

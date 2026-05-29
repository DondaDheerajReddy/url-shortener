import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD ?? undefined,
  // Retry connection up to 3 times if it fails
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('❌ Redis connection failed after 3 attempts');
      return null;
    }
    return Math.min(times * 200, 1000);
  },
});

redis.on('connect', () => console.log('✅ Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err.message));

export default redis;
import { NextResponse } from 'next/server';
import Redis from 'ioredis';

const KEY = 'imgflow:processed';

function getRedis() {
  if (!process.env.REDIS_URL) throw new Error('REDIS_URL not set');
  return new Redis(process.env.REDIS_URL, { lazyConnect: true, connectTimeout: 5000 });
}

// GET — return current count
export async function GET() {
  const redis = getRedis();
  try {
    await redis.connect();
    const val = await redis.get(KEY);
    return NextResponse.json({ count: parseInt(val ?? '0', 10) });
  } catch (e) {
    console.error('Redis GET error:', e);
    return NextResponse.json({ count: 0 });
  } finally {
    redis.disconnect();
  }
}

// POST — increment by n, return new total
export async function POST(req: Request) {
  const redis = getRedis();
  try {
    await redis.connect();
    const { n } = await req.json();
    const count = await redis.incrby(KEY, Math.max(1, parseInt(n, 10) || 1));
    return NextResponse.json({ count });
  } catch (e) {
    console.error('Redis POST error:', e);
    return NextResponse.json({ count: 0 });
  } finally {
    redis.disconnect();
  }
}
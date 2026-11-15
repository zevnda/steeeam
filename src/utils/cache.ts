import { createClient } from 'redis'

export const CACHE_TTL = 24 * 60 * 60 // 24 hours

type RedisClient = ReturnType<typeof createClient>

let clientPromise: Promise<RedisClient | null> | null = null

// Lazily connect to Redis. If REDIS_URL is unset or the connection fails,
// caching is skipped instead of crashing the route.
function getClient(): Promise<RedisClient | null> {
  if (!clientPromise) {
    const url = process.env.REDIS_URL
    if (!url) {
      clientPromise = Promise.resolve(null)
    } else {
      const client = createClient({ url })
      client.on('error', err => console.error('Redis error:', err))
      clientPromise = client
        .connect()
        .then(() => client as RedisClient)
        .catch(err => {
          console.error('Redis connection failed, caching disabled:', err)
          clientPromise = null
          return null
        })
    }
  }
  return clientPromise
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const client = await getClient()
    return client ? await client.get(key) : null
  } catch (err) {
    console.error(`Redis get failed for ${key}:`, err)
    return null
  }
}

export async function cacheSet(key: string, value: string, ttl = CACHE_TTL): Promise<void> {
  try {
    const client = await getClient()
    if (client) await client.set(key, value, { EX: ttl })
  } catch (err) {
    console.error(`Redis set failed for ${key}:`, err)
  }
}

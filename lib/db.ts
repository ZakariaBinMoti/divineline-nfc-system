import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.warn(
    '⚠️  MONGODB_URI is not set. Configure it in .env.local before connecting.'
  )
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Use global cache to prevent multiple connections in dev (hot reload)
const globalForMongoose = globalThis as unknown as {
  mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
}

if (!globalForMongoose.mongooseCache) {
  globalForMongoose.mongooseCache = cached
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

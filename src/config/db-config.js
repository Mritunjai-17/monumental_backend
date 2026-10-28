import mongoose from 'mongoose';
import { ServerConfig } from './server-config.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(ServerConfig.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    }).then((conn) => {
      console.log(`[Database] ✅ MongoDB Atlas Connected: "${conn.connection.name}" on host "${conn.connection.host}"`);
      return conn;
    }).catch((error) => {
      cached.promise = null;
      console.warn(`[Database] ⚠️ MongoDB connection skipped: ${error.message}. Running in fallback mode.`);
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
  }

  return cached.conn;
}

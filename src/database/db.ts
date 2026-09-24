import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | undefined;

/**
 * Reuses the MongoDB connection across API requests.
 * Call this function before all api routes
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri === "{mongo-uri-here}" || uri.includes("<ATLAS_PASSWORD>")) {
    throw new Error("MONGO_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) return mongoose;

  connectionPromise ??= mongoose.connect(uri).catch((error) => {
    connectionPromise = undefined;
    throw error;
  });

  return connectionPromise;
};

export default connectDB;

import mongoose from "mongoose";

// Route bundles share the default Mongoose connection. Cache only an in-flight
// connect, never a resolved promise pointing at a disconnected serverless client.
const connection = mongoose.connection as typeof mongoose.connection & { pendingConnect?: Promise<typeof mongoose> };

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri === "{mongo-uri-here}" || uri.includes("<ATLAS_PASSWORD>"))
    throw new Error("MONGO_URI is not configured");
  if (connection.readyState === 1) return mongoose;
  connection.pendingConnect ??= mongoose
    .connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 10000,
    })
    .finally(() => {
      connection.pendingConnect = undefined;
    });
  return connection.pendingConnect;
};
export default connectDB;

import mongoose, { Schema } from "mongoose";
const schema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 254 },
    topic: { type: String, required: true, enum: ["memberships", "classes", "locations", "other"] },
    message: { type: String, required: true, maxlength: 3000 },
  },
  { timestamps: true, bufferCommands: false },
);
export default mongoose.models.ContactMessage || mongoose.model("ContactMessage", schema);

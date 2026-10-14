import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    specialties: { type: String, required: true, trim: true },
    bio: { type: String, required: true, trim: true },
    headshot: { type: String, default: null },
    order: { type: Number, default: 0 },
  },
  { bufferCommands: false, autoCreate: false, autoIndex: false },
);

export default mongoose.models.Coach || mongoose.model("Coach", schema);

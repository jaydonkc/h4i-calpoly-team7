import mongoose, { Schema } from "mongoose";
const schema = new Schema(
  {
    classId: { type: String, required: true },
    date: { type: String, required: true },
    capacity: { type: Number, required: true, min: 0 },
    reservedCount: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true, bufferCommands: false, autoCreate: false, autoIndex: false },
);
schema.index({ classId: 1, date: 1 }, { unique: true });
export default mongoose.models.ClassOccurrence || mongoose.model("ClassOccurrence", schema);

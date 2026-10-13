import mongoose, { Schema } from "mongoose";
const schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    classId: { type: String, required: true },
    date: { type: String, required: true },
    fitnessClass: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, bufferCommands: false, autoCreate: false, autoIndex: false },
);
schema.index({ userId: 1, classId: 1, date: 1 }, { unique: true });
export default mongoose.models.Reservation || mongoose.model("Reservation", schema);

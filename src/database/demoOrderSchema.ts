import mongoose, { Schema } from "mongoose";
const schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    idempotencyKey: { type: String, required: true },
    plan: { type: String, required: true, enum: ["Student", "Standard", "Premium"] },
    amountCents: { type: Number, required: true },
    status: { type: String, enum: ["simulated"], default: "simulated", required: true },
  },
  { timestamps: true },
);
schema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
export default mongoose.models.DemoOrder || mongoose.model("DemoOrder", schema);

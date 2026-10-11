import mongoose, { Schema } from "mongoose";

const membershipSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    plan: { type: String, required: true, enum: ["Student", "Standard", "Premium"] },
    memberId: { type: String, required: true, unique: true },
    status: { type: String, required: true, enum: ["active", "expired"], default: "active" },
    source: { type: String, required: true, enum: ["manual_demo"] },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.Membership || mongoose.model("Membership", membershipSchema);

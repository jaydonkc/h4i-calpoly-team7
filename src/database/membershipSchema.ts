import mongoose, { Schema } from "mongoose";

const membershipSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    plan: { type: String, required: true, enum: ["Basic", "Student", "Standard", "Premium"] },
    memberId: { type: String, required: true, unique: true },
    status: { type: String, required: true, enum: ["active", "expired"], default: "active" },
    source: { type: String, required: true, enum: ["manual_demo", "demo_checkout", "default_demo"] },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, bufferCommands: false, autoCreate: false, autoIndex: false },
);

export default mongoose.models.Membership || mongoose.model("Membership", membershipSchema);

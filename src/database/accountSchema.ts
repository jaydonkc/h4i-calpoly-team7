import mongoose, { Schema } from "mongoose";
import { classCategories } from "@/types/fitness-class";
const schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true, maxlength: 80 },
    lastName: { type: String, default: "", maxlength: 80 },
    phone: { type: String, default: "", maxlength: 30 },
    preferences: {
      timeFormat: { type: String, enum: ["12h", "24h"], default: "12h" },
      defaultClassCategory: { type: String, enum: ["All", ...classCategories], default: "All" },
    },
  },
  { timestamps: true },
);
export default mongoose.models.AccountProfile || mongoose.model("AccountProfile", schema, "profiles");

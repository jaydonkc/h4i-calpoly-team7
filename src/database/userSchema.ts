import mongoose, { Schema } from "mongoose";
import { isValidClassDate } from "@/lib/classes/class-dates";
import { classCategories } from "@/types/fitness-class";

const fitnessClassSchema = new Schema(
  {
    date: { type: String, required: true, validate: isValidClassDate },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: classCategories },
    time: { type: String, required: true, match: /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/ },
    end: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
      validate: function (this: { get(path: string): unknown }, end: string) {
        const minutes = (time: string) => Number(time.split(":")[0]) * 60 + Number(time.split(":")[1]);
        // Documents and update queries both expose get(), but only documents have this.time.
        const time = this.get("time");
        return typeof time === "string" && minutes(end) > minutes(time);
      },
    },
    coach: { type: String, required: true, trim: true },
    room: { type: String, required: true, trim: true },
    level: { type: String, required: true, enum: ["All levels", "Beginner", "Intermediate", "Advanced"] },
    duration: { type: String, required: true, trim: true },
    spots: { type: Number, required: true, min: 0, validate: Number.isInteger },
    description: { type: String, required: true, trim: true },
  },
  { bufferCommands: false, autoCreate: false, autoIndex: false },
);

const FitnessClasses = mongoose.models.FitnessClass || mongoose.model("FitnessClass", fitnessClassSchema);

export default FitnessClasses;

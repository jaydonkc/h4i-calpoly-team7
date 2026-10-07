import mongoose, { Schema } from "mongoose";
import { classCategories } from "@/types/fitness-class";

//! Example user schema. Not guaranteed to work

const fitnessClassSchema = new Schema({
  date: { type: String, required: true, match: /^202[0-9]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/ },
  title: { type: String, required: true },
  category: { type: String, required: true, enum: classCategories },
  time: { type: String, required: true, match: /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/ },
  end: { type: String, required: true, match: /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/ },
  coach: { type: String, required: true },
  room: { type: String, required: true },
  level: { type: String, required: true, enum: ["All levels", "Beginner", "Intermediate", "Advanced"] },
  duration: { type: String, required: true },
  spots: { type: Number, required: true, min: 0, validate: Number.isInteger },
  description: { type: String, required: true },
});

const FitnessClasses = mongoose.models.FitnessClass || mongoose.model("FitnessClass", fitnessClassSchema);

export default FitnessClasses;

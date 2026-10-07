import mongoose, { Schema } from "mongoose";
import { classCategories } from "@/types/fitness-class";

//! Example user schema. Not guaranteed to work

const fitnessClassSchema = new Schema({
  date: String,
  title: String,
  category: { type: String, required: true, enum: classCategories },
  time: { type: String, required: true },
  end: String,
  coach: String,
  room: String,
  level: String,
  duration: String,
  spots: Number,
  description: String,
});

const FitnessClasses = mongoose.models.FitnessClass || mongoose.model("FitnessClass", fitnessClassSchema);

export default FitnessClasses;

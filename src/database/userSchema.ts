import mongoose, { Schema } from "mongoose";
import { ClassCategory, FitnessClass, ClassQuery, ClassSchedule, classCategories } from "@/types/fitness-class";

//! Example user schema. Not guaranteed to work

const fitnessClassSchema = new Schema({
  id: Number,
  date: String,
  title: String,
  category: classCategories,
  time: String,
  end: String,
  coach: String,
  room: String,
  level: String,
  duration: String,
  spots: Number,
  color: String,
  description: String,
});

export default mongoose.models.FitnessClass || mongoose.model("FitnessClass", fitnessClassSchema);

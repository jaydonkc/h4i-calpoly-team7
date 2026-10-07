import mongoose, { Schema } from "mongoose";
import { ClassCategory, FitnessClass, ClassQuery, ClassSchedule, classCategories } from "@/types/fitness-class";

//! Example user schema. Not guaranteed to work

const fitnessClassSchema = new Schema({
  _id: Number,
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
  description: String,
});

const FitnessClasses = mongoose.models.FitnessClass || mongoose.model("FitnessClass", fitnessClassSchema);

export default FitnessClasses;

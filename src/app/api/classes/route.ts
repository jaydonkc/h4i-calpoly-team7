import connectDB from "@/database/db";
import FitnessClass from "@/database/userSchema";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const classes = await FitnessClass.find();
  return Response.json(classes);
}

import type { User } from "@supabase/supabase-js";
import connectDB from "@/database/db";
import ProfileModel from "@/database/accountSchema";
import { defaultPreferences, type Profile, type Preferences } from "@/types/account";

export async function loadProfile(user: User): Promise<Profile> {
  await connectDB();
  await ProfileModel.init();
  const metadata = user.user_metadata;
  const text = (key: string, fallback: string, max: number) =>
    typeof metadata?.[key] === "string" ? metadata[key].trim().slice(0, max) || fallback : fallback;
  // Import metadata once. Subsequent reads never overwrite MongoDB profile edits.
  try {
    await ProfileModel.updateOne(
      { userId: user.id },
      {
        $set: { email: user.email ?? "" },
        $setOnInsert: {
          firstName: text("first_name", "Member", 80),
          lastName: text("last_name", "", 80),
          phone: text("phone", "", 30),
          preferences: defaultPreferences,
        },
      },
      { upsert: true, runValidators: true },
    );
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    // Two simultaneous first requests may race; the unique identity index wins.
    await ProfileModel.updateOne({ userId: user.id }, { $set: { email: user.email ?? "" } });
  }
  const record = await ProfileModel.findOne({ userId: user.id }).lean<Profile>();
  if (!record) throw new Error("Missing profile");
  return {
    userId: record.userId,
    email: record.email,
    firstName: record.firstName,
    lastName: record.lastName,
    phone: record.phone,
    preferences: { ...defaultPreferences, ...record.preferences },
  };
}
export async function saveProfile(user: User, values: { firstName: string; lastName: string; phone: string }) {
  await loadProfile(user);
  await ProfileModel.updateOne({ userId: user.id }, { $set: values }, { runValidators: true });
  return loadProfile(user);
}
export async function savePreferences(user: User, preferences: Preferences) {
  await loadProfile(user);
  await ProfileModel.updateOne({ userId: user.id }, { $set: { preferences } }, { runValidators: true });
  return loadProfile(user);
}

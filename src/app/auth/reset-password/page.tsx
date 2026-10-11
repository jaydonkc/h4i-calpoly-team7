import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PasswordResetForm from "./PasswordResetForm";

export const dynamic = "force-dynamic";

export default async function ResetPassword() {
  let signedIn = false;
  try {
    const {
      data: { user },
      error,
    } = await createClient().auth.getUser();
    signedIn = Boolean(user && !error);
  } catch {
    // Invalid/expired recovery sessions return to the login flow.
  }
  if (!signedIn) redirect("/profile?authError=recovery");
  return <PasswordResetForm />;
}

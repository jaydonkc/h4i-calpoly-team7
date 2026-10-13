import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import SessionUnavailable from "./SessionUnavailable";
import { pageIdentity } from "@/lib/auth/page-identity";
import { loginPath } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { next?: string | string[]; authError?: string | string[] };
}) {
  const identity = await pageIdentity();
  if (identity.unavailable) return <SessionUnavailable />;
  if (!identity.user) {
    const next = typeof searchParams.next === "string" ? searchParams.next : "/profile";
    const authError = typeof searchParams.authError === "string" ? searchParams.authError : undefined;
    redirect(loginPath(next, authError));
  }
  return <ProfileClient />;
}

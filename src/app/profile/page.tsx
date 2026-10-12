import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import SessionUnavailable from "./SessionUnavailable";
import { pageIdentity } from "@/lib/auth/page-identity";
import { loginPath } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";
export default async function ProfilePage({ searchParams }: { searchParams: { next?: string; authError?: string } }) {
  const identity = await pageIdentity();
  if (identity.unavailable) return <SessionUnavailable />;
  if (!identity.user) redirect(loginPath(searchParams.next ?? "/profile", searchParams.authError));
  return <ProfileClient />;
}

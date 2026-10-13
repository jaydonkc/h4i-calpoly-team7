import { redirect } from "next/navigation";
import { adminAccess } from "@/lib/admin/access";
import { loginPath } from "@/lib/auth/redirect";
import CreateClassForm from "./CreateClassForm";

export const dynamic = "force-dynamic";
export default async function NewClassPage() {
  const access = await adminAccess();
  if (access.status === 401) redirect(loginPath("/classes/new"));
  if (access.status !== 200)
    return (
      <section className="schedule shell">
        <h2>Class management</h2>
        <p role="alert">{access.message}</p>
      </section>
    );
  return (
    <section className="schedule shell">
      <h2>Create a class</h2>
      <p>Write the next chapter of someone’s training arc.</p>
      <CreateClassForm />
    </section>
  );
}

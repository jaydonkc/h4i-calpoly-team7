import Link from "next/link";
import { redirect } from "next/navigation";
import { adminAccess } from "@/lib/admin/access";
import { loginPath } from "@/lib/auth/redirect";
import connectDB from "@/database/db";
import ContactMessage from "@/database/contactMessageSchema";
export const dynamic = "force-dynamic";
export default async function MessageInbox() {
  const access = await adminAccess();
  if (access.status === 401) redirect(loginPath("/admin/messages"));
  if (access.status !== 200)
    return (
      <section className="admin-inbox">
        <h1>Gym inbox</h1>
        <p role="alert">{access.message}</p>
      </section>
    );
  type MessageRecord = {
    _id: { toString(): string };
    name: string;
    email: string;
    topic: string;
    message: string;
    createdAt: Date;
  };
  let messages: MessageRecord[];
  try {
    await connectDB();
    messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100).lean<MessageRecord[]>();
  } catch {
    return (
      <section className="admin-inbox">
        <h1>Gym inbox</h1>
        <p role="alert">The inbox is temporarily unavailable. Please refresh to retry.</p>
      </section>
    );
  }
  return (
    <section className="admin-inbox">
      <h1>Gym inbox</h1>
      <p>The latest 100 messages from signed-in visitors.</p>
      <Link href="/classes/new">Create a class →</Link>
      {messages.length ? (
        messages.map((message) => (
          <article key={message._id.toString()}>
            <h2>
              {message.topic} · {message.name}
            </h2>
            <p>
              {message.email} ·{" "}
              {new Date(message.createdAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{message.message}</p>
          </article>
        ))
      ) : (
        <p>The inbox is empty. Even legendary coaches appreciate a quiet afternoon.</p>
      )}
    </section>
  );
}

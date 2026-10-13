"use client";
import { useRouter } from "next/navigation";
export default function SessionUnavailable() {
  const router = useRouter();
  return (
    <section>
      <h1>Unable to check your session</h1>
      <p role="alert">Sign-in is temporarily unavailable. Please try again.</p>
      <button onClick={() => router.refresh()}>Retry session check</button>
    </section>
  );
}

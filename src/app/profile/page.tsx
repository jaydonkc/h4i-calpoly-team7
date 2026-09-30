import Link from "next/link";

export default function Profile() {
  return (
    <>
      <h1>Profile</h1>
      <p>Member profile details are pending partner review.</p>
      <Link href="/profile/barcode">Open Barcode</Link>
    </>
  );
}

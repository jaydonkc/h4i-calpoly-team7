import Image from "next/image";
import Link from "next/link";

export default function BarcodePage() {
  return (
    <main>
      <p>
        <Link href="/profile">back</Link>
      </p>
      <Image src="/barcodeExample.png" alt="Member barcode 123456789012345" width={447} height={447} priority />
    </main>
  );
}

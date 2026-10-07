import type { Metadata } from "next";
import { DemoAuthProvider } from "@/components/DemoAuthProvider";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gym Website",
  description: "Gym website details pending partner review.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DemoAuthProvider>
          <header>
            <Navbar />
          </header>
          <main>{children}</main>
          <Footer />
        </DemoAuthProvider>
      </body>
    </html>
  );
}

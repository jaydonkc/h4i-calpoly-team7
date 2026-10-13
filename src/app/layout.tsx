import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fitness Maxxing",
  description: "Explore gym classes, meet our coaches, and try the Fitness Maxxing demo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header className="site-header">
            <Navbar />
          </header>
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

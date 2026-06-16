import type { Metadata } from "next";
import { SearchProvider } from "./search-context";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Hub",
  description: "All my content in one place — videos, audio, and posts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SearchProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </SearchProvider>
      </body>
    </html>
  );
}

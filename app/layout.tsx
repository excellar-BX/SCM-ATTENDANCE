import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SCM Attendance", template: "%s · SCM Attendance" },
  description: "Scan in at service, track attendance, and keep up with members.",
};

export const viewport: Viewport = { themeColor: "#1e328a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}

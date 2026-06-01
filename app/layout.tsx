import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brewde",
  description: "Point of Sale for Small Cafes",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/svg+xml" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}

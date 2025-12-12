import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elijah Project School of Ministry",
  description: "A comprehensive ministry training program with 16 modules",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

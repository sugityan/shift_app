import React from "react";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata = {
  title: "Shift Tracker",
  description: "Track your work shifts and calculate your salary with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <body
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
        suppressHydrationWarning
      >
        <div className="flex flex-col min-h-screen items-center">
          <main className="flex-grow w-full flex items-center justify-center">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

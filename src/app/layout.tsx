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
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
        suppressHydrationWarning
      >
        <div className="flex flex-col min-h-screen w-full">
          <main className="flex-grow w-full flex items-center justify-center">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

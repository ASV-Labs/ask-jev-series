import type { Metadata } from "next";
import { Bree_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const bree = Bree_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-wordmark",
});

export const metadata: Metadata = {
  title: "Ask Jevs — Series",
  description:
    "Ask for the night you want, in plain English. TypeSafe Jev weighs every flagship series on Netflix, Prime Video, Disney+, Max, Apple TV+, Hulu, Paramount+, Peacock, and Crunchyroll.",
  openGraph: {
    title: "Ask Jevs — Series",
    description: "Every flagship series on the big streamers. Ask, then keep narrowing.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable} ${bree.variable}`}>
      <body>{children}</body>
    </html>
  );
}

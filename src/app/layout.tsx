import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DarkPaw Chronicles — Audiobook Progress Tracker",
  description:
    "Where fantasy comes to life through audio. Track your novel audiobook journey from reading sites to YouTube uploads.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "DarkPaw Chronicles",
    description: "Novel Audiobook Progress Tracker",
    url: "https://darkpaw-chronicles.vercel.app",
    siteName: "DarkPaw Chronicles",
    images: [
      {
        url: "https://yt3.googleusercontent.com/O9Rsx4gIWK2YeWmbRfka1Gko0Oi5BHBlUIheyEmez9wWSXA_fQOzwXZHYRRiwfk5H0yGT4GN62g=s900-c-k-c0x00ffffff-no-rj",
        width: 900,
        height: 900,
        alt: "DarkPaw Chronicles",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DarkPaw Chronicles",
    description: "Novel Audiobook Progress Tracker",
    images: [
      "https://yt3.googleusercontent.com/O9Rsx4gIWK2YeWmbRfka1Gko0Oi5BHBlUIheyEmez9wWSXA_fQOzwXZHYRRiwfk5H0yGT4GN62g=s900-c-k-c0x00ffffff-no-rj",
    ],
  },
  metadataBase: new URL("https://darkpaw-chronicles.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

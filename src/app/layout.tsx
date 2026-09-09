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
  title: "DarkPaw Chronicles",
  description: "Novel audiobook progress tracker",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "16x16" },
    ],
  },
  openGraph: {
    title: "DarkPaw Chronicles",
    description: "Novel audiobook progress tracker",
    url: "https://darkpaw-chronicles.vercel.app",
    siteName: "DarkPaw Chronicles",
    type: "website",
  },
  metadataBase: new URL("https://darkpaw-chronicles.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

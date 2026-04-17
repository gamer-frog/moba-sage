import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOBA SAGE — Analytics con IA",
  description: "Análisis de meta, tier lists y insights con IA para League of Legends.",
  keywords: ["MOBA", "League of Legends", "Tier List", "Meta", "Analytics", "IA"],
  authors: [{ name: "MOBA Sage Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0a0e1a', color: '#f0e6d2' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

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
  title: "MOBA SAGE — League of Legends Analytics con IA",
  description: "Tier lists, meta analysis, builds y combos rotos para League of Legends y Wild Rift. Datos actualizados al meta actual.",
  keywords: ["MOBA", "League of Legends", "Wild Rift", "Tier List", "Builds", "Meta", "Analytics", "IA", "Combos Rotos"],
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

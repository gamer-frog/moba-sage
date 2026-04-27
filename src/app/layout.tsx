import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { MobaThemeProvider } from "@/components/moba/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "MOBA SAGE — League of Legends Analytics",
    template: "%s | MOBA SAGE",
  },
  description: "Tier lists, meta analysis, builds y combos rotos para League of Legends y Wild Rift. Datos actualizados al meta actual.",
  keywords: ["MOBA", "League of Legends", "Wild Rift", "Tier List", "Builds", "Meta", "Analytics", "Combos Rotos", "Champion Guide", "LoL Pro Builds"],
  authors: [{ name: "MOBA Sage Team", url: "https://github.com/gamer-frog/moba-sage" }],
  creator: "MOBA Sage",
  publisher: "MOBA Sage",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔮</text></svg>",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "MOBA SAGE",
    title: "MOBA SAGE — League of Legends Analytics",
    description: "Tier lists, builds, combos rotos y meta analysis para LoL y Wild Rift.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOBA SAGE — LoL & WR Analytics",
    description: "Tu herramienta de análisis para League of Legends y Wild Rift.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark theme-blue-essence" suppressHydrationWarning>
      <body
        className={`${geistSans.variable + " " + cinzel.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0a0e1a', color: '#f0e6d2' }}
      >
        <MobaThemeProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </MobaThemeProvider>
        <Toaster richColors position="bottom-right" theme="dark" toastOptions={{ style: { background: '#1e2328', border: '1px solid rgba(200,170,110,0.2)', color: '#f0e6d2' } }} />
      </body>
    </html>
  );
}

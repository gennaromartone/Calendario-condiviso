import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
import { InstallPrompt } from "@/components/install-prompt";
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
  title: "Calendario Condiviso",
  description: "Shared calendar for teams and families",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Calendario",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-w-0 overflow-x-hidden`}
      >
        <a
          href="#main-content"
          className="skip-link"
        >
          Salta al contenuto principale
        </a>
        <AuthProvider>
          <Providers>
            <PwaRegister />
            {children}
            <InstallPrompt />
            <Toaster richColors position="top-center" />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}

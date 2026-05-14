import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Great_Vibes } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CSPostHogProvider } from "@/components/providers/PostHogProvider";
import ClientLayout from "@/components/layout/ClientLayout";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-signature",
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Recruit AI | Transform Your Hiring Process",
  description: "The modern recruitment platform powered by AI to help you find the best talent effortlessly.",
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${plusJakarta.variable} ${outfit.variable} ${greatVibes.variable} font-sans antialiased bg-white text-zinc-900 dark:bg-black dark:text-zinc-50`}>
        <CSPostHogProvider>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}

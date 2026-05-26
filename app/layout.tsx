import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "MotoMart — India's 2-Wheeler Spare Parts Store",
  description:
    "Find genuine spare parts for Honda, Hero, Bajaj, TVS, Yamaha, Suzuki and more. Fast pan-India delivery, best prices.",
  applicationName: "MotoMart",
  keywords: ["spare parts", "2-wheeler", "bike parts", "Honda", "Hero", "Bajaj", "TVS", "Yamaha"],
  authors: [{ name: "MotoMart" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MotoMart",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.svg",  sizes: "32x32",  type: "image/svg+xml" },
      { url: "/icons/icon-16x16.svg",  sizes: "16x16",  type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-152x152.svg", sizes: "152x152", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    other: [
      { rel: "mask-icon", url: "/favicon.svg" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "MotoMart",
    title: "MotoMart — India's 2-Wheeler Spare Parts Store",
    description: "Genuine spare parts for Honda, Hero, Bajaj, TVS, Yamaha & more. Fast pan-India delivery.",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e40af" },
    { media: "(prefers-color-scheme: dark)",  color: "#1e3a5f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

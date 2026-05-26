import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "MotoMart — India's 2-Wheeler Spare Parts Store",
  description:
    "Find genuine spare parts for Honda, Hero, Bajaj, TVS, Yamaha, Suzuki and more. Fast pan-India delivery, best prices.",
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

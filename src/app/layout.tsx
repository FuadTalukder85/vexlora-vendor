import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Vexlora Merchant Portal | Vendor Dashboard",
  description: "Manage products, sub-orders, sales analytics, payouts, and store profile for Vexlora marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

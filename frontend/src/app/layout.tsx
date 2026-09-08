import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { AppStoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Signal Desktop",
  description: "Signal Messenger Desktop Clone — SDE Fullstack Assignment",
  icons: {
    icon: "/signal-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] h-screen w-screen overflow-hidden">
        <AuthProvider>
          <AppStoreProvider>{children}</AppStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


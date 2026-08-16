import type { Metadata } from "next";
import { Crimson_Pro, Geist_Mono } from "next/font/google";
import { UtilityBar } from "@/features/auth/components/utility-bar";
import { SessionProvider } from "@/features/auth/session-context";
import "./globals.css";

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kapitan Kidd", // Captain Kidd from one piece is a pirate, not a Marine!
  description: "Marine Work Order Management System",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${crimsonPro.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <UtilityBar />
          <main className="flex-1">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/useAuth";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "900"] });

export const metadata: Metadata = {
  title: "CivicPath AI | Your 2026 Election Guide",
  description: "Secure, AI-powered assistant for the May 2026 State Assembly Elections in West Bengal, Tamil Nadu, Kerala, and Assam. View dates, registration guides, and mock ballots.",
  keywords: ["Election 2026", "Voter Registration", "India Elections", "CivicPath AI", "Gemini AI"],
  openGraph: {
    title: "CivicPath AI | 2026 Election Guide",
    description: "Get ready for the May 2026 polls with our AI assistant.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} text-slate-800 antialiased`} suppressHydrationWarning>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-black text-white px-4 py-2 rounded-md shadow-xl"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <main id="main-content">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

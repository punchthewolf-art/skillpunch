import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillPunch - Scan your CV. Discover your super-powers.",
  description:
    "AI-powered CV skill analysis. Discover your strengths, skill gaps, and market value in seconds. Get personalized career insights with SkillPunch.",
  keywords: [
    "CV analysis",
    "skill punch",
    "career analysis",
    "AI CV scanner",
    "employability score",
    "skill gap analysis",
  ],
  openGraph: {
    title: "SkillPunch - Scan your CV. Discover your super-powers.",
    description:
      "AI-powered CV skill analysis. Discover your strengths, skill gaps, and market value in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

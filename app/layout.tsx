import React from "react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pharmacie Provinciale Essaouira",
  description: "Système de gestion de pharmacie",
};

const isMockMode = process.env.USE_MOCK_DATA === "true";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const htmlContent = (
    <html lang="fr">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );

  if (isMockMode) {
    return htmlContent;
  }

  // Dynamically import Clerk only in non-mock mode so the publishable key
  // is never validated when running with USE_MOCK_DATA=true.
  const { ClerkProvider } = await import("@clerk/nextjs");
  const { frFR } = await import("@clerk/localizations");

  return <ClerkProvider localization={frFR}>{htmlContent}</ClerkProvider>;
}


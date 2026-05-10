import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./app.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Voicemagic",
    template: "%s | Voicemagic"
  },
  description: "AI-powered text-to-speech and voice cloning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "#0a0613",
          colorInputBackground: "#120a22",
          colorInputText: "#f5f0ff",
          colorText: "#f5f0ff",
          colorTextSecondary: "#b0a8c5",
          colorPrimary: "oklch(0.65 0.22 350)",
          colorNeutral: "#f5f0ff",
          borderRadius: "10px",
        },
        elements: {
          card: "bg-[#1a1230] border border-white/12 shadow-2xl",
          rootBox: "text-[#f5f0ff]",
          headerTitle: "text-[#f5f0ff]",
          headerSubtitle: "text-[#b0a8c5]",
          socialButtonsBlockButton:
            "bg-white/10 border-white/15 text-[#f5f0ff] hover:bg-white/15",
          formFieldInput: "bg-[#221834] border-white/15 text-[#f5f0ff]",
          formButtonPrimary:
            "bg-gradient-to-b from-[oklch(0.72_0.22_350)] to-[oklch(0.58_0.24_350)]",
          footerActionLink: "text-[oklch(0.75_0.2_350)]",
        },
      }}
    >
      <TRPCReactProvider>
        <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
          <body
            className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} ${geistMono.variable} antialiased`}
          >
            <NuqsAdapter>
              {children}
            </NuqsAdapter>
            <Toaster />
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}

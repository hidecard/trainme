import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrainMe - Interactive Learning Platform",
  description: "Master web development through interactive lessons, challenging quizzes, and gamified learning experience.",
  keywords: ["TrainMe", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "interactive learning", "quiz platform", "web development"],
  authors: [{ name: "TrainMe Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "TrainMe - Interactive Learning Platform",
    description: "Master web development through interactive lessons and gamified learning",
    url: "https://trainme.example.com",
    siteName: "TrainMe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrainMe - Interactive Learning Platform",
    description: "Master web development through interactive lessons and gamified learning",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { AuthProvider } from "@/features/auth/AuthProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reimbursement Management App",
  description: "Multi-tenant Reimbursement Platform for Indian SMEs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TRPCProvider>
          <AuthProvider>{children}</AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}

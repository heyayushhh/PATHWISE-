import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { TanStackProvider } from "@/providers/TanStackProvider";

export const metadata: Metadata = {
  title: "PathWise",
  description: "AI Career Intelligence Platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TanStackProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}

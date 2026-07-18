import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { TanStackProvider } from "@/providers/TanStackProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "PathWise - Career Guidance & personalized roadmaps",
  description: "PathWise helps school students explore interests, discover career possibilities, and build personalized roadmaps."
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <TanStackProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}

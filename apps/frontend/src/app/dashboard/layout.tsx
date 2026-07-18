"use client";

import MainLayout from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDistractionFree = pathname.includes("/assessment") || pathname.includes("/onboarding");

  return (
    <ProtectedRoute>
      {isDistractionFree ? (
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      ) : (
        <MainLayout>{children}</MainLayout>
      )}
    </ProtectedRoute>
  );
}

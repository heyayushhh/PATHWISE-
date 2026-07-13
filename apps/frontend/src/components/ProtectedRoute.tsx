"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push("/login");
    } else if (!state.isLoading && state.isAuthenticated && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
      router.push("/dashboard");
    }
  }, [state.isLoading, state.isAuthenticated, router, pathname]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!state.isAuthenticated && pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
    return null;
  }

  return <>{children}</>;
}

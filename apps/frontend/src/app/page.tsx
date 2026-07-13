"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!state.isLoading) {
      if (state.isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [state.isLoading, state.isAuthenticated, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    </ProtectedRoute>
  );
}

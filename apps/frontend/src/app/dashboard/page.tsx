"use client";

import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/services/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { state, logout: clearAuth } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">PathWise</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">
            Hello, {state.user?.firstName} {state.user?.lastName}!
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to PathWise!</h2>
          <p className="text-gray-600 mb-2">
            Your current stage: <span className="font-medium">{state.profile?.currentStage}</span>
          </p>
          <p className="text-gray-600">
            Assessment status: <span className="font-medium">{state.profile?.assessmentStatus}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

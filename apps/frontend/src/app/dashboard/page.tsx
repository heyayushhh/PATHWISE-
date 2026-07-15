"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { logout, testAiConnection } from "@/services/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { state, logout: clearAuth } = useAuth();
  const router = useRouter();
  const [connectionMessage, setConnectionMessage] = useState("");
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  const handleConnectionTest = async () => {
    try {
      setIsCheckingConnection(true);
      setConnectionMessage("");
      const response = await testAiConnection();
      setConnectionMessage(response.data?.message ?? "AI Engine Connected");
    } catch {
      setConnectionMessage("Connection test failed");
    } finally {
      setIsCheckingConnection(false);
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
          <p className="text-gray-600 mb-6">
            Assessment status: <span className="font-medium">{state.profile?.assessmentStatus}</span>
          </p>
          <button
            onClick={handleConnectionTest}
            disabled={isCheckingConnection}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isCheckingConnection ? "Checking..." : "Test MS1 -> MS2 Connection"}
          </button>
          {connectionMessage ? (
            <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4 text-green-800 font-medium">
              {connectionMessage}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

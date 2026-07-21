import api from "@/lib/axios";
import type { ApiResponse, AuthResponse, GetMeResponse } from "@/types";

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}) {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
  return res.data;
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
  return res.data;
}

export async function googleAuth(credential: string) {
  const res = await api.post<ApiResponse<AuthResponse & { isNewUser: boolean }>>(
    "/auth/google",
    { credential },
  );
  return res.data;
}

export async function getMe() {
  const res = await api.get<ApiResponse<GetMeResponse>>("/auth/me");
  return res.data;
}

export async function logout() {
  const res = await api.post<ApiResponse>("/auth/logout");
  return res.data;
}

export async function updateStage(stage: string) {
  const res = await api.patch<ApiResponse<{ profile: any }>>("/auth/update-stage", { stage });
  return res.data;
}

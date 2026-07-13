import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().regex(/^\+\d{1,15}$/, "Phone number must be in E.164 format (e.g. +1234567890)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  stage: z.enum(["Class 10", "Class 11", "Class 12"]),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

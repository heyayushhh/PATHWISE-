"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { register as registerUser } from "@/services/auth";
import { useAuth } from "@/providers/AuthProvider";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Please enter a valid email address"),
    phoneNumber: z.string().regex(/^\+\d{1,15}$/, "Phone number must be in E.164 format (e.g. +1234567890)"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    stage: z.enum(["Class 10", "Class 11", "Class 12"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      stage: "Class 10",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { login } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      const res = await registerUser(data);
      if (res.success && res.data) {
        await login(res.data.user, res.data.accessToken, res.data.refreshToken);
        router.push("/dashboard");
      } else {
        setApiError(res.message || "Unable to create your account right now.");
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your academic journey with a guided, professional onboarding experience."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-sky-700 transition hover:text-sky-800">
            Sign in
          </Link>
        </>
      }
    >
      {apiError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </div>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">First name</label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                    errors.firstName ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-sky-200"
                  }`}
                />
              )}
            />
            {errors.firstName ? <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p> : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Last name</label>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                    errors.lastName ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-sky-200"
                  }`}
                />
              )}
            />
            {errors.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p> : null}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                autoComplete="email"
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                  errors.email ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-sky-200"
                }`}
              />
            )}
          />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone number</label>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                placeholder="+1234567890"
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                  errors.phoneNumber ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-sky-200"
                }`}
              />
            )}
          />
          {errors.phoneNumber ? <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p> : null}
        </div>

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              label="Password"
              autoComplete="new-password"
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              label="Confirm password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Current stage</label>
          <Controller
            name="stage"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-sky-200"
              >
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            )}
          />
          {errors.stage ? <p className="mt-1 text-xs text-red-600">{errors.stage.message}</p> : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register as registerUser, googleAuth } from "@/services/auth";
import { useAuth } from "@/providers/AuthProvider";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import Logo from "@/components/ui/Logo";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      const res = await registerUser(data);
      if (res.success && res.data) {
        login(res.data.user, res.data.profile, res.data.accessToken, res.data.refreshToken);
        router.push("/dashboard/onboarding");
      } else {
        setApiError(res.message?.trim() || "Unable to create your account right now.");
      }
    } catch (err: unknown) {
      setApiError("Unable to create your account. Please check your inputs and try again.");
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setApiError(null);
    setGoogleLoading(true);
    try {
      const res = await googleAuth(credential);
      if (res.success && res.data) {
        login(res.data.user, res.data.profile, res.data.accessToken, res.data.refreshToken);
        // New Google users start onboarding; existing users (who happened to click "register") go to dashboard
        if (res.data.isNewUser) {
          router.push("/dashboard/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        setApiError(res.message || "Google sign-in failed. Please try again.");
      }
    } catch (err: unknown) {
      setApiError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden py-12">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

      <div className="w-full max-w-[480px] relative z-10 animate-slide-up">
        <div className="flex flex-col items-center mb-6">
          <Logo />
          <h1 className="mt-4 text-3xl font-extrabold font-display tracking-tight text-foreground">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            Get started on PathWise. No billing details required.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/85 backdrop-blur-md p-6 sm:p-7 shadow-soft">
          {apiError && (
            <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive flex items-start gap-2">
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  First Name
                </label>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="John"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-background/50 text-foreground outline-none transition-all placeholder:text-muted-foreground ${
                        errors.firstName
                          ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                          : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                  )}
                />
                {errors.firstName && <p className="mt-2 text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Last Name
                </label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Doe"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-background/50 text-foreground outline-none transition-all placeholder:text-muted-foreground ${
                        errors.lastName
                          ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                          : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                  )}
                />
                {errors.lastName && <p className="mt-2 text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email Address
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="john.doe@example.com"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-background/50 text-foreground outline-none transition-all placeholder:text-muted-foreground ${
                      errors.email
                        ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                        : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                )}
              />
              {errors.email && <p className="mt-2 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    placeholder="+91 9876543210"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-background/50 text-foreground outline-none transition-all placeholder:text-muted-foreground ${
                      errors.phoneNumber
                        ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                        : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                )}
              />
              {errors.phoneNumber && <p className="mt-2 text-xs text-destructive">{errors.phoneNumber.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      className={`w-full rounded-xl border pl-4 pr-11 py-2.5 text-sm bg-background/50 text-foreground outline-none transition-all placeholder:text-muted-foreground ${
                        errors.password
                          ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                          : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      className={`w-full rounded-xl border pl-4 pr-11 py-2.5 text-sm bg-background/50 text-foreground outline-none transition-all placeholder:text-muted-foreground ${
                        errors.confirmPassword
                          ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                          : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || googleLoading}
              className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </form>

          {/* OR divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google Sign-Up */}
          <GoogleSignInButton
            onCredential={handleGoogleCredential}
            disabled={isSubmitting || googleLoading}
          />
          {googleLoading && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Verifying with Google…
            </p>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login as loginUser } from "@/services/auth";
import { useAuth } from "@/providers/AuthProvider";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import Logo from "@/components/ui/Logo";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const res = await loginUser(data);
      if (res.success && res.data) {
        login(res.data.user, res.data.profile, res.data.accessToken, res.data.refreshToken);
        router.push("/dashboard");
      } else {
        setApiError(res.message || "Unable to log in. Please check your credentials.");
      }
    } catch (err: unknown) {
      setApiError("Unable to log in. Please check your credentials and try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

      <div className="w-full max-w-[400px] relative z-10 animate-slide-up">
        <div className="flex flex-col items-center mb-6">
          <Logo />
          <h1 className="mt-4 text-3xl font-extrabold font-display tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            Enter your details to access your PathWise account.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/85 backdrop-blur-md p-6 sm:p-7 shadow-soft">
          {apiError && (
            <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive flex items-start gap-2">
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="you@example.com"
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
                      placeholder="••••••••"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                "Signing In..."
              ) : (
                <>
                  Sign In
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

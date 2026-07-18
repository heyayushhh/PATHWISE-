import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, User, LogOut, ChevronDown, ClipboardList, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/services/auth";
import { useTheme } from "next-themes";

export default function TopNavbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout: clearAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  const sectionTitleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/assessment": "Career Assessment",
    "/dashboard/results": "Results",
    "/dashboard/roadmap": "Career Roadmap",
    "/dashboard/career-lab": "Career Lab",
    "/dashboard/profile": "Profile",
  };

  const sectionTitle = sectionTitleMap[pathname] ?? "Workspace";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
          <ClipboardList size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">PathWise</p>
          <h2 className="truncate text-xl font-bold font-display text-foreground">{sectionTitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all"
          title="Toggle theme"
        >
          {!mounted ? (
            <div className="h-5 w-5 rounded-full bg-muted/20 animate-pulse" />
          ) : resolvedTheme === "dark" ? (
            <Moon size={18} className="text-muted-foreground hover:text-foreground" />
          ) : (
            <Sun size={18} className="text-amber-500" />
          )}
        </button>



        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-accent transition-all duration-300"
            title="User menu"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <User size={16} className="text-muted-foreground" />
            </div>
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-xl z-50"
              >
                <div className="p-2">
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <Link
                    href="/dashboard/profile"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-foreground hover:bg-accent transition-all duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={18} />
                    Profile
                  </Link>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

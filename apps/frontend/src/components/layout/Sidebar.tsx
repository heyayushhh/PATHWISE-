import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/services/auth";
import { AnimatePresence, motion } from "framer-motion";
import {
    Briefcase,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Home,
    LogOut,
    Map,
    Route,
    User,
    X,
    Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SidebarItem from "./SidebarItem";

interface SidebarProps {
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({
  isMobileOpen,
  onToggleMobile,
  onCloseMobile,
}: Omit<SidebarProps, "onCollapsedChange">) {
  const router = useRouter();
  const { logout: clearAuth } = useAuth();

  const navItems = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <ClipboardList size={20} />, label: "Assessment", href: "/dashboard/assessment" },
    { icon: <Map size={20} />, label: "Results", href: "/dashboard/results" },
    { icon: <Route size={20} />, label: "Career Roadmap", href: "/dashboard/roadmap" },
    { icon: <User size={20} />, label: "Profile", href: "/dashboard/profile" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              collapsed={false}
            />
          ))}
        </nav>
      </div>

      <div className="px-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button (only visible on mobile) */}
      <button
        onClick={onToggleMobile}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-lg md:hidden text-foreground"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop (fixed) */}
      <aside
        className="fixed left-0 top-0 hidden h-full w-[280px] border-r border-border bg-sidebar md:block z-20"
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile (drawer) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 h-full w-72 border-r border-border bg-sidebar shadow-xl md:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

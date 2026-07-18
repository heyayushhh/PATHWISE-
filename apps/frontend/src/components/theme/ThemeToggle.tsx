"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import clsx from "clsx";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg border border-border bg-card animate-pulse" />
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Moon size={18} className="text-blue-400" />
        ) : (
          <Sun size={18} className="text-amber-500" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl border border-border bg-card p-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
            {[
              { name: "Light", value: "light", icon: Sun },
              { name: "Dark", value: "dark", icon: Moon },
              { name: "System", value: "system", icon: Monitor },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    theme === option.value
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground"
                  )}
                >
                  <Icon size={14} />
                  {option.name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

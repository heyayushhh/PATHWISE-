"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Right: Actions & Theme Toggle (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-98"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-98"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu and toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-accent focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {isOpen && (
        <div className="border-b border-border bg-background px-6 py-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Home
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              About
            </Link>

            <div className="my-2 h-px bg-border" />

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="w-full text-center rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

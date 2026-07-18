import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between md:py-16">
        <div className="flex flex-col gap-4 md:order-1 max-w-md">
          <Logo />
          <p className="text-xs text-muted-foreground">
            Empowering school students with personalized career roadmap guidance. Explore streams, streams alternatives, and college plans based on your interests.
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} PathWise. All rights reserved.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 md:order-2 md:mt-0">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <span className="text-sm text-muted-foreground select-none">
            Privacy
          </span>
          <span className="text-sm text-muted-foreground select-none">
            Terms
          </span>
        </div>
      </div>
    </footer>
  );
}

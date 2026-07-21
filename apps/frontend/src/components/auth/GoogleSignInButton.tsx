"use client";

import { useEffect, useRef, useCallback } from "react";

// Extend the global Window interface for the Google Identity Services script
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              shape?: string;
              width?: number;
              logo_alignment?: string;
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => Promise<void>;
  disabled?: boolean;
}

const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function GoogleSignInButton({
  onCredential,
  disabled = false,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  const initializeGsi = useCallback(() => {
    if (!window.google || !buttonRef.current || !GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        if (response.credential) {
          await onCredential(response.credential);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // We render a hidden native button but use our own styled button to trigger prompt
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      width: buttonRef.current.offsetWidth || 400,
      logo_alignment: "left",
    });
  }, [onCredential]);

  useEffect(() => {
    if (scriptLoaded.current) {
      initializeGsi();
      return;
    }

    // Check if script is already present (e.g. navigating between pages)
    if (window.google) {
      scriptLoaded.current = true;
      initializeGsi();
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded.current = true;
      initializeGsi();
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount — reuse it on navigation
    };
  }, [initializeGsi]);

  if (!GOOGLE_CLIENT_ID) {
    return null; // Silently hide if not configured
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => window.google?.accounts.id.prompt()}
      className={[
        "w-full flex items-center justify-center gap-3 rounded-xl border px-4 py-2.5",
        "bg-background/50 text-foreground text-sm font-medium",
        "border-input hover:border-primary/50 hover:bg-muted/30",
        "transition-all duration-200 active:scale-[0.98]",
        "disabled:opacity-50 disabled:pointer-events-none",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
      ].join(" ")}
    >
      {/* Google "G" SVG logo — official brand colors */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#4285F4"
          d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
        />
        <path
          fill="#34A853"
          d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
        />
        <path
          fill="#FBBC05"
          d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
        />
        <path
          fill="#EA4335"
          d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"
        />
      </svg>
      Continue with Google
      {/* Hidden native Google button — lets GIS handle the rendering internally */}
      <div ref={buttonRef} className="sr-only" aria-hidden="true" />
    </button>
  );
}

"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/providers/AuthProvider";
import { User, Mail, Phone, Shield, GraduationCap, ClipboardCheck, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, profile } = useAuth();

  const profileRows = [
    { 
      label: "Full Name", 
      value: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Not available",
      icon: User
    },
    { 
      label: "Email Address", 
      value: user?.email ?? "Not available",
      icon: Mail
    },
    { 
      label: "Phone Number", 
      value: user?.phoneNumber ?? "Not provided",
      icon: Phone
    },
    { 
      label: "Account Role", 
      value: user?.role ?? "Student",
      icon: Shield
    },
    { 
      label: "Academic Stage", 
      value: profile?.currentStage ?? "Not Selected",
      icon: GraduationCap
    },
    { 
      label: "Assessment Status", 
      value: profile?.assessmentStatus?.replaceAll("_", " ") ?? "Not Started",
      icon: ClipboardCheck
    },
  ];

  return (
    <div className="mx-auto max-w-5xl py-12 px-4 animate-fade-in text-foreground space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1.5 block">Student Hub</span>
          <h1 className="text-3xl font-extrabold font-display text-foreground tracking-tight sm:text-4xl">My Profile</h1>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Profile Overview */}
      <div className="flex items-center gap-6 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-extrabold font-display shadow-md">
          {user?.firstName?.[0] || "U"}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold font-display text-foreground">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile?.currentStage || "Academic Stage Not Set"}
          </p>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {profileRows.map((row) => (
          <div key={row.label} className="border border-border bg-card rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary text-foreground/80 flex items-center justify-center border border-border">
                <row.icon size={16} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{row.label}</span>
            </div>
            <span className="text-sm font-semibold text-foreground truncate max-w-[180px] text-right">
              {row.label === "Email Address" ? row.value.toLowerCase() : row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

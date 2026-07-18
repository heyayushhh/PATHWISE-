"use client";

import Link from "next/link";
import { Compass, Briefcase, Route, ArrowRight, CheckCircle2, ChevronRight, Sparkles, Target, Zap } from "lucide-react";
import MarketingLayout from "@/components/layout/MarketingLayout";

export default function Home() {
  return (
    <MarketingLayout>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-md mb-8 animate-fade-in">
            <Sparkles size={16} />
            Introducing PathWise AI
          </span>
          <h1 className="text-5xl font-extrabold font-display tracking-tight text-foreground sm:text-7xl lg:text-7xl leading-[1.1] animate-fade-in" style={{animationDelay: '0.1s'}}>
            Find a career path that <br className="hidden sm:block" />
            <span className="text-gradient">fits who you are.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            Explore your interests, discover career possibilities, and build a personalized roadmap with our AI-powered intelligence engine.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Discover Your Path
              <ArrowRight className="ml-2" size={18} />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-base font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT VALUE PILLARS */}
      <section className="py-24 bg-secondary/30 border-y border-border relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-foreground sm:text-4xl">
              A structured approach to career discovery
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We help school students build their path, shifting from guessing to informed choosing.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Compass size={24} />,
                title: "Discover Yourself",
                desc: "Understand your interests, strengths, preferences, and goals through an adaptive assessment."
              },
              {
                icon: <Target size={24} />,
                title: "Explore Possibilities",
                desc: "Discover career directions that align with your profile instead of following generic recommendations."
              },
              {
                icon: <Route size={24} />,
                title: "Build Your Roadmap",
                desc: "Turn career choices into clear, actionable steps for education, skills, and future goals."
              }
            ].map((pillar, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-card p-8 shadow-sm card-hover relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 ring-1 ring-primary/20">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold font-display text-foreground">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW PATHWISE WORKS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <span className="text-sm font-semibold text-primary tracking-wider uppercase mb-2 block">Product Journey</span>
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-foreground sm:text-4xl">
              How PathWise Works
            </h2>
          </div>

          <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Profile Setup", desc: "Choose your current academic stage to start." },
              { step: "02", title: "AI Assessment", desc: "Complete an adaptive assessment based on your answers." },
              { step: "03", title: "Career Match", desc: "Explore AI-recommended career paths tailored for you." },
              { step: "04", title: "Action Plan", desc: "Get a structured roadmap for your academic future." },
            ].map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-start p-8 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
                <span className="text-4xl font-extrabold text-primary/10 mb-4">{item.step}</span>
                <h4 className="text-base font-bold font-display text-foreground">{item.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHO PATHWISE IS FOR */}
      <section className="py-24 bg-secondary/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-foreground sm:text-4xl">
              Designed for your academic stage
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Career exploration adapts to where you are right now.
            </p>
          </div>

          <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-2">
            {/* Class 10 Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-10 shadow-sm card-hover">
              <div>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  Foundation Phase
                </span>
                <h3 className="mt-6 text-3xl font-bold font-display text-foreground">Class 10</h3>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                  Make informed decisions before transitioning to your next academic level.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Explore interests before choosing a stream",
                    "Understand Science, Commerce, and Arts",
                    "Discover career possibilities early",
                  ].map((bullet, index) => (
                     <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 text-primary shrink-0" size={18} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 pt-6 border-t border-border">
                <Link href="/register" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  Start exploration <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Class 12 Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-10 shadow-sm card-hover">
              <div>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  Specialization Phase
                </span>
                <h3 className="mt-6 text-3xl font-bold font-display text-foreground">Class 12</h3>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                  Bridge the gap between school subjects and future career directions.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Explore careers based on academic background",
                    "Understand courses and possible next steps",
                    "Build a direction for college and career planning",
                  ].map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 text-primary shrink-0" size={18} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 pt-6 border-t border-border">
                <Link href="/register" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  Plan next steps <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="mx-auto max-w-4xl px-6 relative z-10 text-center">
          <h2 className="text-4xl font-extrabold font-display tracking-tight text-foreground sm:text-5xl mb-6">
            Ready to find your direction?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join PathWise today and let our AI engine guide you towards a career you&apos;ll love.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            Start Your Journey
            <Zap className="ml-2" size={18} fill="currentColor" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}

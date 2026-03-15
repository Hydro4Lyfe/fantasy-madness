"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Zap, Shield, X, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const handleNavigate = (path: string) => {
    onComplete();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicators */}
        <div className="flex gap-1.5 px-6 pt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 py-8">
          {step === 0 && <StepScoring />}
          {step === 1 && <StepModes />}
          {step === 2 && <StepChoose onNavigate={handleNavigate} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6">
          <button
            onClick={onComplete}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Go to Dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepScoring() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
          Welcome to Fantasy Madness
        </h2>
        <p className="text-muted-foreground mt-2">
          The scoring is simple: <strong className="text-foreground">Seed &times; Wins</strong>. Pick upsets, score big.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary border border-border rounded-lg p-4 text-center">
          <div className="font-display text-4xl font-bold text-[#F59E0B]">16</div>
          <div className="text-xs text-muted-foreground mt-1">16-seed</div>
          <div className="text-sm font-medium text-foreground mt-2">16 pts / win</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">High risk, high reward</div>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-4 text-center">
          <div className="font-display text-4xl font-bold text-[#8B949E]">1</div>
          <div className="text-xs text-muted-foreground mt-1">1-seed</div>
          <div className="text-sm font-medium text-foreground mt-2">1 pt / win</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Safe, but low ceiling</div>
        </div>
      </div>
    </div>
  );
}

function StepModes() {
  const modes = [
    {
      icon: Globe,
      label: "Global Contest",
      description: "Pick any 8 teams. Compete against everyone.",
      color: "text-[#3B82F6]",
      borderColor: "border-l-[#3B82F6]",
    },
    {
      icon: Zap,
      label: "Drafts",
      description: "Snake draft with friends. Compete for the best picks.",
      color: "text-[#10B981]",
      borderColor: "border-l-[#10B981]",
    },
    {
      icon: Shield,
      label: "Leagues",
      description: "Create a group. Everyone picks independently.",
      color: "text-[#F59E0B]",
      borderColor: "border-l-[#F59E0B]",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
          Three Ways to Play
        </h2>
        <p className="text-muted-foreground mt-2">
          Each mode uses the same scoring. Choose how you compete.
        </p>
      </div>

      <div className="space-y-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.label}
              className={cn(
                "flex items-start gap-3 p-4 bg-secondary border border-border rounded-lg border-l-2",
                mode.borderColor,
              )}
            >
              <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", mode.color)} />
              <div>
                <div className="text-sm font-semibold text-foreground">{mode.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{mode.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepChoose({ onNavigate }: { onNavigate: (path: string) => void }) {
  const actions = [
    {
      label: "Enter Global Contest",
      path: "/global-contest",
      color: "bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white",
    },
    {
      label: "Create a Draft",
      path: "/drafts/new",
      color: "bg-[#10B981] hover:bg-[#10B981]/90 text-white",
    },
    {
      label: "Browse Leagues",
      path: "/leagues",
      color: "bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
          Choose Your Path
        </h2>
        <p className="text-muted-foreground mt-2">
          Jump right in. You can play all three modes.
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => onNavigate(action.path)}
            className={cn(
              "w-full flex items-center justify-between px-5 py-3.5 rounded-lg text-sm font-semibold transition-colors",
              action.color,
            )}
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

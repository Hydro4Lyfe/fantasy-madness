"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export function InviteLinkCard({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/drafts/join/${inviteCode}`
    : `/drafts/join/${inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const input = document.createElement("input");
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <GlassCard title="Invite Friends">
      <div className="grid gap-3">
        <p className="text-sm text-white/70 m-0">
          Share this link to invite people to your draft:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="flex-1 px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white text-sm"
          />
          <Button onClick={handleCopy} variant="secondary">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

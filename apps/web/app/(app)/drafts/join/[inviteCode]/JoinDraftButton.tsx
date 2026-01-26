"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { joinDraftByInviteAction } from "@/server/actions/joinDraftByInvite";

export function JoinDraftButton({ inviteCode }: { inviteCode: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setIsLoading(true);
    setError(null);

    const result = await joinDraftByInviteAction(inviteCode);

    if (!result.success) {
      setError(result.error ?? "Failed to join draft");
      setIsLoading(false);
    }
    // If successful, the action will redirect
  };

  return (
    <div className="grid gap-2">
      {error && (
        <div className="p-3 bg-red-500/10 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}
      <Button onClick={handleJoin} isLoading={isLoading} className="w-full">
        Join Draft
      </Button>
    </div>
  );
}

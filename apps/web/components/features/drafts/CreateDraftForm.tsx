"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDraftInputSchema, type CreateDraftFormInput } from "@fantasy-madness/domain";
import { useActionState } from "react";
import { createDraftAction, type CreateDraftFormState } from "@/server/actions/createDraft";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { GlassCard } from "@/components/ui/GlassCard";

type Tournament = { id: string; name: string; seasonYear: number };

type Props = {
  tournament?: Tournament | null;
  tournaments?: Tournament[];
};

export function CreateDraftForm({ tournament, tournaments }: Props) {
  const [state, formAction, isPending] = useActionState<CreateDraftFormState, FormData>(
    createDraftAction,
    { success: false }
  );

  const {
    register,
    formState: { errors },
  } = useForm<CreateDraftFormInput>({
    resolver: zodResolver(CreateDraftInputSchema),
    defaultValues: {
      tournamentId: tournament?.id ?? "",
      draftType: "SNAKE",
      isPrivate: true,
    },
  });

  const draftTypeOptions = [
    { value: "SNAKE", label: "Snake Draft" },
    { value: "LINEAR", label: "Linear Draft" },
    { value: "AUCTION", label: "Auction Draft" },
  ];

  const tournamentOptions = tournaments?.map((t) => ({
    value: t.id,
    label: `${t.name} (${t.seasonYear})`,
  }));

  return (
    <GlassCard title="Draft Settings">
      <form action={formAction} className="grid gap-4">
        {tournament ? (
          <>
            <input type="hidden" {...register("tournamentId")} />
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/70 m-0">Tournament</p>
              <p className="text-base font-medium m-0 mt-1">
                {tournament.name} ({tournament.seasonYear})
              </p>
            </div>
          </>
        ) : tournamentOptions ? (
          <Select
            {...register("tournamentId")}
            label="Tournament"
            options={[{ value: "", label: "Select a tournament..." }, ...tournamentOptions]}
            error={errors.tournamentId?.message ?? state.fieldErrors?.tournamentId}
          />
        ) : null}

        <Input
          {...register("name")}
          label="Draft Name"
          placeholder="My March Madness Draft"
          error={errors.name?.message ?? state.fieldErrors?.name}
        />

        <Select
          {...register("draftType")}
          label="Draft Type"
          options={draftTypeOptions}
          error={errors.draftType?.message ?? state.fieldErrors?.draftType}
        />

        <Input
          {...register("pickTimerSec")}
          label="Pick Timer (seconds, optional)"
          type="number"
          placeholder="60"
          min={30}
          max={300}
          error={errors.pickTimerSec?.message ?? state.fieldErrors?.pickTimerSec}
        />

        <Checkbox
          {...register("isPrivate")}
          label="Private draft (invite-only)"
          defaultChecked
        />

        <p className="text-sm text-white/60 m-0">
          Drafts have exactly 8 participants.
        </p>

        {state.error && !state.success && (
          <div className="p-3 bg-red-500/10 rounded-lg text-red-500 text-sm">
            {state.error}
          </div>
        )}

        <Button type="submit" isLoading={isPending}>
          Create Draft
        </Button>
      </form>
    </GlassCard>
  );
}

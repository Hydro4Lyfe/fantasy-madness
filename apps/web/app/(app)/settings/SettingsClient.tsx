"use client";

import { useActionState, useMemo, useRef, useState, type MouseEvent } from "react";
import { formatMediumDate } from "@/lib/date";
import { useFormStatus } from "react-dom";
import {
  Settings as SettingsIcon,
  User,
  AlertCircle,
  CheckCircle,
  Camera,
  Loader2,
  Mail,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { updateProfileAction, type UpdateProfileFormState } from "@/server/actions/users";
import { cn } from "@/lib/utils";

interface SettingsClientProps {
  initialProfile: {
    id: string;
    email: string | null;
    name: string | null;
    username: string | null;
    image: string | null;
    nextUsernameChangeAt: string | null;
  };
}

// ---------------------------------------------------------------------------
// SpotlightCard — mouse-tracking radial gradient on card surface
// ---------------------------------------------------------------------------
function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06]",
        "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]",
        "transition-shadow duration-300",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]",
        className,
      )}
    >
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(94,106,210,0.15), transparent 70%)`,
        }}
      />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        "bg-[#5E6AD2] hover:bg-[#6872D9] text-white font-medium",
        "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
        "hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_4px_20px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
        "active:scale-[0.98]",
        "transition-all duration-200",
        "disabled:opacity-60 disabled:cursor-not-allowed",
      )}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Saving…
        </>
      ) : (
        "Save Profile"
      )}
    </Button>
  );
}

export function SettingsClient({ initialProfile }: SettingsClientProps) {
  const initialState: UpdateProfileFormState = { success: false };
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const [imageUrl, setImageUrl] = useState(state.profile?.image ?? initialProfile.image ?? "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const effectiveNextUsernameChangeAt =
    state.profile?.nextUsernameChangeAt ?? initialProfile.nextUsernameChangeAt;

  const effectiveImageUrl = state.profile?.image ?? imageUrl;

  const nextUsernameChangeLabel = useMemo(() => {
    if (!effectiveNextUsernameChangeAt) return null;

    return formatMediumDate(effectiveNextUsernameChangeAt);
  }, [effectiveNextUsernameChangeAt]);

  const handleAvatarUpload = async (file: File) => {
    setUploadError(null);

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be 5MB or smaller.");
      return;
    }

    const filePath = `${initialProfile.id}/avatar`;

    try {
      setIsUploading(true);
      const supabase = createSupabaseClient();

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type,
        });

      if (error) {
        setUploadError(error.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
      setImageUrl(publicUrl);

      // Best-effort cleanup for legacy files from older naming schemes.
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(initialProfile.id, { limit: 100 });

      const oldPaths = (existingFiles ?? [])
        .filter(item => item.name !== "avatar")
        .map(item => `${initialProfile.id}/${item.name}`);

      if (oldPaths.length > 0) {
        await supabase.storage.from("avatars").remove(oldPaths);
      }
    } catch {
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadError(null);

    try {
      setIsUploading(true);
      const supabase = createSupabaseClient();

      await supabase.storage
        .from("avatars")
        .remove([`${initialProfile.id}/avatar`]);

      setImageUrl("");
    } catch {
      setUploadError("Failed to remove image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const initials = (state.profile?.name ?? initialProfile.name ?? "P")
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl border border-white/10 bg-[#5E6AD2]/10 flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <SettingsIcon className="w-6 h-6 text-[#5E6AD2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>
        <p className="text-[#8A8F98] text-sm leading-relaxed pl-16">
          Manage your public profile name and username.
        </p>
      </div>

      {/* Profile card */}
      <SpotlightCard className="p-6">
        {/* Card section header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.05] flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#5E6AD2]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#EDEDEF]">Profile</h2>
            <p className="text-sm text-[#8A8F98] mt-0.5">
              Username: 5–20 chars, letters/numbers/underscores. Changes limited to once every 30 days.
            </p>
          </div>
        </div>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="image" value={effectiveImageUrl ?? ""} />

          {/* Avatar section */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="w-16 h-16 border border-white/10 flex-shrink-0">
                <AvatarImage src={effectiveImageUrl || undefined} alt="Profile photo" />
                <AvatarFallback className="bg-[#5E6AD2]/20 text-[#EDEDEF] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium text-[#EDEDEF]">Profile Photo</p>
                  <p className="text-xs text-[#8A8F98]">JPG, PNG, or WEBP — max 5 MB</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Label
                    htmlFor="avatar-upload"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border border-white/10",
                      "bg-white/[0.05] hover:bg-white/[0.08] px-3 py-2 text-sm text-[#EDEDEF]",
                      "cursor-pointer transition-colors duration-200",
                      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
                      isUploading && "opacity-60 pointer-events-none",
                    )}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#8A8F98]" />
                        <span className="text-[#8A8F98]">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 text-[#8A8F98]" />
                        Upload Photo
                      </>
                    )}
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={isUploading}
                    onChange={event => {
                      const file = event.target.files?.[0];
                      if (file) void handleAvatarUpload(file);
                      event.currentTarget.value = "";
                    }}
                  />
                  {effectiveImageUrl && (
                    <button
                      type="button"
                      onClick={() => void handleRemoveAvatar()}
                      disabled={isUploading}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border border-white/[0.06]",
                        "bg-white/[0.03] hover:bg-white/[0.06] px-3 py-2 text-sm text-[#8A8F98]",
                        "transition-colors duration-200 cursor-pointer",
                        isUploading && "opacity-60 pointer-events-none",
                      )}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {uploadError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-[#8A8F98] inline-flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={initialProfile.email ?? ""}
              disabled
              className="bg-[#0F0F12] border-white/10 text-[#8A8F98] cursor-not-allowed"
            />
          </div>

          {/* Display name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-[#EDEDEF]">Display Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={state.profile?.name ?? initialProfile.name ?? ""}
              placeholder="Your display name"
              className="bg-[#0F0F12] border-white/10 text-[#EDEDEF] placeholder:text-[#8A8F98] focus-visible:border-[#5E6AD2] focus-visible:ring-[#5E6AD2]/30"
            />
            {state.fieldErrors?.name && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {state.fieldErrors.name}
              </div>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-[#EDEDEF]">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              defaultValue={state.profile?.username ?? initialProfile.username ?? ""}
              placeholder="your_username"
              className="bg-[#0F0F12] border-white/10 text-[#EDEDEF] placeholder:text-[#8A8F98] focus-visible:border-[#5E6AD2] focus-visible:ring-[#5E6AD2]/30"
            />
            {state.fieldErrors?.username ? (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {state.fieldErrors.username}
              </div>
            ) : (
              <p className="text-xs text-[#8A8F98]">Case-sensitive and unique.</p>
            )}
            {!state.fieldErrors?.username && nextUsernameChangeLabel && (
              <p className="text-xs text-[#8A8F98]">
                Next change available: {nextUsernameChangeLabel}
              </p>
            )}
          </div>

          {/* Success banner */}
          {state.success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-sm text-green-400">Profile updated successfully.</span>
            </div>
          )}

          {/* General error banner */}
          {!state.success && state.error && !state.fieldErrors && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">{state.error}</span>
            </div>
          )}

          <SaveButton />
        </form>
      </SpotlightCard>
    </div>
  );
}

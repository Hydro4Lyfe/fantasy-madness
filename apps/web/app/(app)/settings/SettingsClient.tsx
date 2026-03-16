"use client";

import { useActionState, useMemo, useState } from "react";
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
  Shield,
  LogOut,
  Clock,
  AtSign,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { updateProfileAction, type UpdateProfileFormState } from "@/server/actions/users";
import { signOut } from "@/server/actions/auth";
import { cn } from "@/lib/utils";
import { SportCard } from "@/components/shared/SportCard";

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
// Save button
// ---------------------------------------------------------------------------
function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        "bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6",
        "active:scale-[0.98]",
        "transition-all duration-200",
        "disabled:opacity-60 disabled:cursor-not-allowed",
      )}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Field error display
// ---------------------------------------------------------------------------
function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-1.5 text-destructive text-xs mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
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
    <div className="max-w-2xl space-y-6">
      {/* ── Page header ── */}
      <div className="animate-[slide-up_0.35s_ease-out_both]">
        <div className="flex items-center gap-2.5 mb-1">
          <SettingsIcon className="w-5 h-5 text-primary" />
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground leading-none">
            Settings
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your profile and account preferences
        </p>
      </div>

      {/* ── Avatar section ── */}
      <SportCard
        accent="blue"
        className="animate-[slide-up_0.35s_ease-out_0.06s_both]"
      >
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Camera className="w-[18px] h-[18px] text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                Profile Photo
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG, or WEBP up to 5 MB
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar display */}
            <div className="relative group">
              <Avatar className="relative w-20 h-20 border-2 border-border group-hover:border-primary/40 transition-colors duration-300">
                <AvatarImage src={effectiveImageUrl || undefined} alt="Profile photo" />
                <AvatarFallback className="bg-primary/15 text-foreground text-lg font-bold font-display">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Upload controls */}
            <div className="flex flex-col items-center sm:items-start gap-2">
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <Label
                  htmlFor="avatar-upload"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border border-border",
                    "bg-secondary hover:bg-accent px-3.5 py-2 text-sm text-foreground",
                    "cursor-pointer transition-all duration-200",
                    "hover:border-primary/30",
                    isUploading && "opacity-60 pointer-events-none",
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-muted-foreground" />
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
                      "inline-flex items-center gap-2 rounded-lg border border-border",
                      "bg-secondary hover:bg-destructive/10 px-3.5 py-2 text-sm text-muted-foreground",
                      "hover:text-destructive hover:border-destructive/30",
                      "transition-all duration-200 cursor-pointer",
                      isUploading && "opacity-60 pointer-events-none",
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>

              {uploadError && (
                <FieldError message={uploadError} />
              )}
            </div>
          </div>
        </div>
      </SportCard>

      {/* ── Profile form section ── */}
      <SportCard
        accent="blue"
        className="animate-[slide-up_0.35s_ease-out_0.12s_both]"
      >
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-[18px] h-[18px] text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                Profile Info
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your public identity across Fantasy Madness
              </p>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="image" value={effectiveImageUrl ?? ""} />

            {/* Display name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Display Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={state.profile?.name ?? initialProfile.name ?? ""}
                placeholder="Your display name"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
              />
              {state.fieldErrors?.name && (
                <FieldError message={state.fieldErrors.name} />
              )}
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-foreground flex items-center gap-2">
                <AtSign className="w-3.5 h-3.5 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                defaultValue={state.profile?.username ?? initialProfile.username ?? ""}
                placeholder="your_username"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 font-mono"
              />
              {state.fieldErrors?.username ? (
                <FieldError message={state.fieldErrors.username} />
              ) : (
                <p className="text-[11px] text-muted-foreground mt-1">
                  5-20 characters. Letters, numbers, and underscores only. Case-sensitive.
                </p>
              )}
              {!state.fieldErrors?.username && nextUsernameChangeLabel && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Next change available: {nextUsernameChangeLabel}
                </div>
              )}
            </div>

            {/* Success banner */}
            {state.success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <span className="text-sm text-success">Profile updated successfully.</span>
              </div>
            )}

            {/* General error banner */}
            {!state.success && state.error && !state.fieldErrors && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <span className="text-sm text-destructive">{state.error}</span>
              </div>
            )}

            <div className="pt-1">
              <SaveButton />
            </div>
          </form>
        </div>
      </SportCard>

      {/* ── Account section ── */}
      <SportCard
        accent="slate"
        className="animate-[slide-up_0.35s_ease-out_0.18s_both]"
      >
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[#21262D] border border-border flex items-center justify-center flex-shrink-0">
              <Shield className="w-[18px] h-[18px] text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                Account
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your login credentials and session
              </p>
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5 mb-5">
            <Label htmlFor="email" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={initialProfile.email ?? ""}
              disabled
              className="bg-secondary/30 border-border text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[11px] text-muted-foreground">
              Email is managed by your authentication provider and cannot be changed here.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-5" />

          {/* Sign out */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sign Out</p>
              <p className="text-xs text-muted-foreground mt-0.5">End your current session</p>
            </div>
            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className={cn(
                  "border-border text-muted-foreground",
                  "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
                  "transition-all duration-200",
                )}
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </SportCard>

      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  );
}

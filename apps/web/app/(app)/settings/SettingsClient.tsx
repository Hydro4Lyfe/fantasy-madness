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
  Shield,
  LogOut,
  Clock,
  AtSign,
  Trash2,
  CalendarDays,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { updateProfileAction, type UpdateProfileFormState } from "@/server/actions/users";
import { signOut } from "@/server/actions/auth";
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
  accentColor = "rgba(94,106,210,0.15)",
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
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
        "relative overflow-hidden rounded-xl border border-border",
        "bg-card",
        "shadow-sm",
        "transition-all duration-300",
        "hover:border-border/80",
        className,
      )}
    >
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${accentColor}, transparent 70%)`,
        }}
      />
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------
function SectionHeader({
  icon: Icon,
  title,
  description,
  iconColorClass = "text-[#5E6AD2]",
  iconBgClass = "bg-[#5E6AD2]/10",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconColorClass?: string;
  iconBgClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div
        className={cn(
          "w-9 h-9 rounded-lg border border-white/[0.06] flex items-center justify-center flex-shrink-0",
          iconBgClass,
        )}
      >
        <Icon className={cn("w-[18px] h-[18px]", iconColorClass)} />
      </div>
      <div className="min-w-0">
        <h2 className="font-display text-base font-bold uppercase tracking-wide text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
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
        "bg-[#5E6AD2] hover:bg-[#6872D9] text-white font-medium px-6",
        "shadow-[0_0_0_1px_rgba(94,106,210,0.4),0_2px_8px_rgba(94,106,210,0.25)]",
        "hover:shadow-[0_0_0_1px_rgba(104,114,217,0.5),0_4px_16px_rgba(94,106,210,0.35)]",
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
      <div
        className="animate-[slide-up_0.35s_ease-out_both]"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 flex items-center justify-center flex-shrink-0">
            <SettingsIcon className="w-5 h-5 text-[#5E6AD2]" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage your profile and account preferences
            </p>
          </div>
        </div>
      </div>

      {/* ── Avatar section ── */}
      <SpotlightCard
        className="animate-[slide-up_0.35s_ease-out_0.06s_both]"
        accentColor="rgba(94,106,210,0.12)"
      >
        <div className="p-5">
          <SectionHeader
            icon={Camera}
            title="Profile Photo"
            description="JPG, PNG, or WEBP up to 5 MB"
          />

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar display */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#5E6AD2]/40 via-[#5E6AD2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <Avatar className="relative w-20 h-20 border-2 border-border group-hover:border-[#5E6AD2]/40 transition-colors duration-300">
                <AvatarImage src={effectiveImageUrl || undefined} alt="Profile photo" />
                <AvatarFallback className="bg-[#5E6AD2]/15 text-foreground text-lg font-bold font-display">
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
                    "hover:border-[#5E6AD2]/30",
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
      </SpotlightCard>

      {/* ── Profile form section ── */}
      <SpotlightCard
        className="animate-[slide-up_0.35s_ease-out_0.12s_both]"
        accentColor="rgba(94,106,210,0.12)"
      >
        <div className="p-5">
          <SectionHeader
            icon={User}
            title="Profile Info"
            description="Your public identity across Fantasy Madness"
          />

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
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-[#5E6AD2] focus-visible:ring-[#5E6AD2]/20"
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
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-[#5E6AD2] focus-visible:ring-[#5E6AD2]/20 font-mono"
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
      </SpotlightCard>

      {/* ── Account section ── */}
      <SpotlightCard
        className="animate-[slide-up_0.35s_ease-out_0.18s_both]"
        accentColor="rgba(139,148,158,0.08)"
      >
        <div className="p-5">
          <SectionHeader
            icon={Shield}
            title="Account"
            description="Your login credentials and session"
            iconColorClass="text-muted-foreground"
            iconBgClass="bg-muted/50"
          />

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
      </SpotlightCard>

      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  );
}

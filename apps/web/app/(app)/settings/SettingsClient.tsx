"use client";

import { useActionState, useMemo, useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { updateProfileAction, type UpdateProfileFormState } from "@/server/actions/users";

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

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-orange-500 hover:bg-orange-600 text-white"
    >
      {pending ? "Saving..." : "Save Profile"}
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

    return new Date(effectiveNextUsernameChangeAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your public profile name and username.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">Profile</h2>
            <p className="text-sm text-muted-foreground">
              Username rules: 5-20 chars, case-sensitive, letters/numbers/underscores.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Username changes are limited to once every 30 days.
            </p>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="image" value={effectiveImageUrl ?? ""} />

          <div className="rounded-lg border border-border bg-background/30 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="w-16 h-16 border border-border">
                <AvatarImage src={effectiveImageUrl || undefined} alt="Profile photo" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">
                    Upload JPG, PNG, or WEBP (max 5MB)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
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
                      if (file) {
                        void handleAvatarUpload(file);
                      }
                      event.currentTarget.value = "";
                    }}
                  />
                  {effectiveImageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        void handleRemoveAvatar();
                      }}
                      disabled={isUploading}
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {uploadError}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium inline-flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={initialProfile.email ?? ""}
              disabled
              className="bg-muted/20 border-border text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={state.profile?.name ?? initialProfile.name ?? ""}
              placeholder="Your display name"
              className="bg-background border-border"
            />
            {state.fieldErrors?.name && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {state.fieldErrors.name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              defaultValue={state.profile?.username ?? initialProfile.username ?? ""}
              placeholder="your_username"
              className="bg-background border-border"
            />
            {state.fieldErrors?.username ? (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {state.fieldErrors.username}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Case-sensitive and unique.
              </p>
            )}
            {!state.fieldErrors?.username && nextUsernameChangeLabel && (
                <p className="text-xs text-muted-foreground">
                  Next username change available: {nextUsernameChangeLabel}
                </p>
            )}
          </div>

          {state.success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Profile updated successfully.</span>
            </div>
          )}

          {!state.success && state.error && !state.fieldErrors && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{state.error}</span>
            </div>
          )}

          <SaveButton />
        </form>
      </Card>
    </div>
  );
}

import { SettingsClient } from "./SettingsClient";
import { requireUserId } from "@/server/auth/guards";
import { getUserProfile } from "@/server/dal";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const profile = await getUserProfile({ userId });

  return (
    <SettingsClient
      initialProfile={{
        id: profile.id,
        email: profile.email,
        name: profile.name,
        username: profile.username,
        image: profile.image,
        nextUsernameChangeAt: profile.nextUsernameChangeAt,
      }}
    />
  );
}

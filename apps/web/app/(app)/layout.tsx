import { ReactNode } from "react";
import { requireUserId } from "@/server/auth/guards";
import { getUserProfile } from "@/server/dal";
import { NavBar } from "@/components/layout/NavBar";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userId = await requireUserId();
  const profile = await getUserProfile({ userId });

  return (
    <div className="min-h-screen bg-background">
      <NavBar
        user={{
          id: profile.id,
          name: profile.name,
          username: profile.username,
          image: profile.image,
        }}
      />

      {/* Main content */}
      <div className="relative pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}

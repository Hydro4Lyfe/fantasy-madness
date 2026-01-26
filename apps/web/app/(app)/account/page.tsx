import Link from "next/link";
import { requireUserId } from "@/server/auth/guards";
import { LogoutButton } from "@/components/ui/LogoutButton";

export default async function AccountPage() {
  const userId = await requireUserId();

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="text-white/70">User ID: <code className="bg-white/10 px-2 py-1 rounded">{userId}</code></p>
      <div className="flex gap-4">
        <Link href="/account/entries" className="text-indigo-400 hover:text-indigo-300">My entries</Link>
        <Link href="/account/settings" className="text-indigo-400 hover:text-indigo-300">Settings</Link>
      </div>
      <div className="pt-4 border-t border-white/10">
        <LogoutButton />
      </div>
    </main>
  );
}

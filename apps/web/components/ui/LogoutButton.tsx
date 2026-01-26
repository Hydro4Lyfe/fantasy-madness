"use client";

import { signOut } from "@/server/actions/auth";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all cursor-pointer"
    >
      Logout
    </button>
  );
}

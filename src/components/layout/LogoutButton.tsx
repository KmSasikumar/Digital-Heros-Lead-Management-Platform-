"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn-secondary text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </button>
  );
}

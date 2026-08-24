"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function HeaderNav({ session }: { session: any }) {
  const pathname = usePathname();

  return (
    <>
      {/* Center: Nav Links */}
      <nav className="flex w-1/3 justify-center items-center space-x-6 text-sm font-medium">
        {/* Intentionally left blank for minimalist design */}
      </nav>

      {/* Right: Auth and Form link */}
      <div className="flex w-1/3 justify-end items-center space-x-4">
        <nav className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user?.name || session.user?.email}
              </span>
              <LogoutButton />
            </>
          ) : pathname !== "/login" ? (
            <Link href="/login" className="btn-primary">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Link>
          ) : null}

          {pathname !== "/" && (
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
            >
              Form
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}

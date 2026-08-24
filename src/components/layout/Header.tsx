import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import HeaderNav from "./HeaderNav";
import { Briefcase } from "lucide-react";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border/40">
      <div className="flex h-16 items-center px-4 md:px-8 w-full">
        {/* Left: Brand */}
        <div className="flex w-1/3 justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="inline-block font-heading font-bold text-xl tracking-tight text-primary">
              Digital Heroes LeadGen
            </span>
          </Link>
        </div>
        
        <HeaderNav session={session} />
      </div>
    </header>
  );
}

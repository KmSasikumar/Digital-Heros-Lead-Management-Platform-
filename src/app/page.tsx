import LeadCaptureForm from "@/components/forms/LeadCaptureForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
                  🚀 New Feature: Automated Lead Scoring
                </div>
                <h1 className="text-4xl font-heading font-bold tracking-tight sm:text-5xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">
                  Manage leads with elegant simplicity
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                  Capture, track, and close deals faster with our premium lead management platform. Designed for modern teams who demand excellence.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <a href="#capture-form" className="btn-primary h-12 px-8 text-base flex items-center justify-center">
                  Get Started
                </a>
                {session ? (
                  <Link href="/dashboard" className="btn-secondary h-12 px-8 text-base flex items-center justify-center">
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link href="/login" className="btn-secondary h-12 px-8 text-base flex items-center justify-center">
                    Login to Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div id="capture-form" className="flex items-center justify-center relative">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />
              <div className="relative w-full max-w-sm">
                <LeadCaptureForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

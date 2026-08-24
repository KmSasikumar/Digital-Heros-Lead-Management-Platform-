import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="container relative flex-col items-center justify-center min-h-[calc(100vh-4rem)] md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-black p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        {/* Subtle glow effect */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          LeadGen Platform
        </div>

        <div className="relative z-20 mt-auto mb-auto flex flex-col items-start justify-center h-full max-w-md">
          <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4 leading-[1.1]">
            Elevate your <br/>
            <span className="text-white/50">workflow.</span>
          </h2>
          <p className="text-lg text-white/60 leading-relaxed font-light">
            Experience a new standard of clarity and performance in lead management.
          </p>
        </div>
        
        <div className="relative z-20 mt-auto text-sm text-white/40 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} LeadGen Inc.</span>
          <span className="uppercase tracking-widest text-xs">Internal Access</span>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center relative">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight font-heading">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

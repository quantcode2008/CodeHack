"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  GraduationCap,
  Microscope,
  Wrench,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { type DemoRole } from "@/lib/auth/demo";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Institutional email is required")
    .email("Must be a valid email address (e.g. name@eastbrook.edu)"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/explore";
  const { login, demoLogin } = useAuth();
  const [loadingDemoRole, setLoadingDemoRole] = React.useState<DemoRole | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "aanya@eastbrook.edu",
      password: "demo-student-2026!",
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    try {
      const res = await login(values.email, values.password);
      if (!res.success) {
        setError("root", { message: res.error || "Authentication failed" });
        return;
      }
      router.push(redirectTo);
    } catch (err: unknown) {
      setError("root", {
        message: err instanceof Error ? err.message : "Unable to verify credentials",
      });
    }
  };

  const handleDemoClick = async (role: DemoRole) => {
    setLoadingDemoRole(role);
    try {
      await demoLogin(role);
    } finally {
      setLoadingDemoRole(null);
    }
  };

  const demoChips: {
    role: DemoRole;
    name: string;
    label: string;
    desc: string;
    icon: React.ElementType;
  }[] = [
    {
      role: "student",
      name: "Aanya Patel",
      label: "Student",
      desc: "Reserve equipment & upload condition photos",
      icon: GraduationCap,
    },
    {
      role: "owner",
      name: "Dr. Kavitha Rao",
      label: "Owner",
      desc: "Approve requests & inspect returned tools",
      icon: Microscope,
    },
    {
      role: "manager",
      name: "Imran Syed",
      label: "Manager",
      desc: "Verify safety certs & oversee bay custody",
      icon: Wrench,
    },
    {
      role: "admin",
      name: "Campus Provost",
      label: "Admin",
      desc: "Review disputes, audits & usage governance",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-bone flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-line/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-editorial bg-ink text-surface flex items-center justify-center font-display text-xl group-hover:bg-terracotta transition-colors shadow-xs">
            C
          </div>
          <div>
            <span className="font-display text-2xl text-ink tracking-tight block leading-none">
              Commons
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
              Eastbrook Institute
            </span>
          </div>
        </Link>

        <div className="text-small text-ink-muted">
          Need an account?{" "}
          <Link
            href="/signup"
            className="text-terracotta hover:underline font-medium"
          >
            Register Student ID
          </Link>
        </div>
      </header>

      {/* Main Login Card Canvas */}
      <main className="max-w-md mx-auto w-full py-8 sm:py-12 space-y-6">
        <div className="text-center space-y-2">
          <Badge status="neutral" className="mb-1">
            Institutional Single Sign-On
          </Badge>
          <h1 className="font-display text-display-md text-ink font-normal tracking-tight">
            Sign in to Commons
          </h1>
          <p className="text-body text-ink-muted text-sm">
            Enter your university credentials or select your campus role for quick access.
          </p>
        </div>

        {/* Quick Access by Campus Role */}
        <div className="bg-surface border border-line rounded-editorial p-5 shadow-editorial space-y-3">
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <span className="text-mono-label uppercase text-ink-muted flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              Quick Access by Campus Role
            </span>
            <span className="text-[10px] text-ink-muted">No password needed</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {demoChips.map((chip) => {
              const Icon = chip.icon;
              const isLoading = loadingDemoRole === chip.role;
              return (
                <button
                  key={chip.role}
                  type="button"
                  disabled={!!loadingDemoRole}
                  onClick={() => handleDemoClick(chip.role)}
                  className={cn(
                    "flex flex-col text-left p-3 rounded-editorial border border-line bg-bone/50 hover:bg-bone hover:border-terracotta/40 transition-all select-none min-h-[64px] cursor-pointer group",
                    "focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:outline-none",
                    "disabled:opacity-50 disabled:cursor-wait"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-small font-semibold text-ink group-hover:text-terracotta transition-colors flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-terracotta" />
                      {chip.label}
                    </span>
                    {isLoading && (
                      <span className="w-2 h-2 rounded-full bg-terracotta animate-ping" />
                    )}
                  </div>
                  <span className="text-xs text-ink/80 font-medium truncate">
                    {chip.name}
                  </span>
                  <span className="text-[10px] text-ink-muted line-clamp-1 mt-0.5">
                    {chip.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-surface border border-line rounded-editorial p-6 sm:p-8 shadow-editorial space-y-4"
        >
          <div className="flex items-center gap-2 pb-1 text-xs text-ink-muted border-b border-line/60">
            <Building2 className="w-3.5 h-3.5 text-ink-muted" />
            <span>Or sign in with @eastbrook.edu email</span>
          </div>

          {errors.root && (
            <div className="p-3 bg-danger-light border border-danger/30 rounded-editorial text-xs text-danger font-medium">
              {errors.root.message}
            </div>
          )}

          <Input
            label="Institutional Email"
            type="email"
            placeholder="aanya@eastbrook.edu"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Account Password"
            type="password"
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In with Campus ID
          </Button>

          <p className="text-center text-xs text-ink-muted pt-2">
            Protected by Eastbrook Single Sign-On and immutable audit logging.
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-2">
        <p>© 2026 Eastbrook Institute of Technology · Commons Platform</p>
        <div className="flex items-center gap-4">
          <Link href="/explore" className="hover:text-ink transition-colors">
            Catalog
          </Link>
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-bone flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 bg-surface border border-line rounded-editorial shadow-editorial text-center space-y-4 animate-pulse">
            <div className="w-10 h-10 rounded-editorial bg-ink/10 mx-auto" />
            <div className="h-6 bg-ink/10 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-ink/10 rounded w-3/4 mx-auto" />
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}

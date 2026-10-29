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

export default function LoginPage() {
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
      desc: "Manage Fab Lab & approve booking requests",
      icon: Microscope,
    },
    {
      role: "manager",
      name: "Imran Syed",
      label: "Manager",
      desc: "Verify physical check-ins & review credentials",
      icon: Wrench,
    },
    {
      role: "admin",
      name: "Campus Admin",
      label: "Admin",
      desc: "Oversight, disputes & full audit trail",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-bone text-ink flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-editorial bg-ink text-surface flex items-center justify-center font-display text-h3 group-hover:bg-terracotta transition-colors">
            C
          </div>
          <div>
            <span className="font-display text-h3 text-ink tracking-tight block leading-none">
              Commons
            </span>
            <span className="text-mono-label text-ink-muted">
              Eastbrook Institute
            </span>
          </div>
        </Link>

        <Link
          href="/signup"
          className="text-small font-medium text-ink-muted hover:text-ink transition-colors flex items-center gap-1.5"
        >
          <span>Need an account?</span>
          <span className="text-terracotta underline font-semibold">Sign up</span>
        </Link>
      </header>

      {/* Main Form Centerpiece */}
      <main className="max-w-md mx-auto w-full space-y-6 my-auto py-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <Badge status="active" showDot={false}>
            Campus Access Portal
          </Badge>
          <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
            Sign In to Commons
          </h1>
          <p className="text-small text-ink-muted leading-relaxed max-w-sm mx-auto">
            Use your institutional credentials to access precision campus labs, fabrication suites, and testbenches.
          </p>
        </div>

        {/* ======================================================== */}
        {/* PROMINENT DEMO ACCOUNT CHIPS                             */}
        {/* ======================================================== */}
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
                  <span className="text-[10px] text-ink-muted truncate">
                    {chip.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-line w-full" />
          <span className="bg-bone px-3 text-mono-label uppercase text-ink-muted text-[11px] shrink-0">
            or continue with password
          </span>
        </div>

        {/* Email + Password Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-surface border border-line rounded-editorial p-6 shadow-editorial space-y-4"
        >
          {errors.root && (
            <div className="p-3 rounded-md bg-[#FCF2F1] border border-danger/40 text-danger text-small">
              {errors.root.message}
            </div>
          )}

          <Input
            label="Institutional Email"
            type="email"
            placeholder="e.g. aanya@eastbrook.edu"
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
          <Link href="/design" className="hover:text-ink transition-colors">
            Design Lab
          </Link>
          <Link href="/emulator" className="hover:text-ink transition-colors">
            Phone Emulator
          </Link>
        </div>
      </footer>
    </div>
  );
}


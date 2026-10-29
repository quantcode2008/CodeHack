"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  GraduationCap,
  Microscope,
  Wrench,
  ShieldCheck,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { useAuth, type Role } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { type DemoRole } from "@/lib/auth/demo";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full legal or institutional name is required"),
  email: z
    .string()
    .min(1, "Institutional email is required")
    .email("Must be a valid collegiate email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "owner", "manager", "admin"] as const),
  affiliation: z
    .string()
    .min(3, "Please specify your department or research program"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, demoLogin } = useAuth();
  const [loadingDemoRole, setLoadingDemoRole] = React.useState<DemoRole | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "student",
      affiliation: "Mechanical Engineering, Year 3",
    },
  });

  const onSubmit = async (values: SignupFormData) => {
    try {
      const res = await signup(values);
      if (!res.success) {
        setError("root", { message: res.error || "Signup failed" });
        return;
      }
      router.push("/onboarding");
    } catch (err: unknown) {
      setError("root", {
        message: err instanceof Error ? err.message : "Registration error",
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
    icon: React.ElementType;
  }[] = [
    { role: "student", name: "Aanya Patel", label: "Student", icon: GraduationCap },
    { role: "owner", name: "Dr. Kavitha Rao", label: "Owner", icon: Microscope },
    { role: "manager", name: "Imran Syed", label: "Manager", icon: Wrench },
    { role: "admin", name: "Campus Admin", label: "Admin", icon: ShieldCheck },
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
          href="/login"
          className="text-small font-medium text-ink-muted hover:text-ink transition-colors flex items-center gap-1.5"
        >
          <span>Already registered?</span>
          <span className="text-terracotta underline font-semibold">Sign in</span>
        </Link>
      </header>

      {/* Main Registration Form */}
      <main className="max-w-md mx-auto w-full space-y-6 my-auto py-6">
        <div className="text-center space-y-2">
          <Badge status="active" showDot={false}>
            New Membership
          </Badge>
          <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
            Create Campus Account
          </h1>
          <p className="text-small text-ink-muted leading-relaxed max-w-sm mx-auto">
            Join the verified campus exchange for shared scientific equipment, media studios, and precision tools.
          </p>
        </div>

        {/* Demo Fast Track */}
        <div className="bg-surface border border-line rounded-editorial p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-mono-label uppercase text-ink-muted flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              Fast Track with Campus Role
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {demoChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.role}
                  type="button"
                  disabled={!!loadingDemoRole}
                  onClick={() => handleDemoClick(chip.role)}
                  className="flex flex-col items-center justify-center p-2 rounded-editorial border border-line bg-bone/40 hover:bg-bone hover:border-terracotta transition-all text-center min-h-[52px] cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-terracotta mb-1" />
                  <span className="text-[11px] font-semibold text-ink leading-tight">
                    {chip.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sign up form */}
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
            label="Full Legal Name"
            placeholder="e.g. Aanya Patel"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="Collegiate Institutional Email"
            type="email"
            placeholder="e.g. aanya@eastbrook.edu"
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Requires institutional address ending in .edu"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Select
            label="Campus Persona & Role"
            options={[
              { value: "student", label: "Student / Independent Researcher" },
              { value: "owner", label: "Department Lab & Equipment Owner" },
              { value: "manager", label: "Lab Coordinator / Facility Manager" },
              { value: "admin", label: "Campus Governance Administrator" },
            ]}
            error={errors.role?.message}
            {...register("role")}
          />

          <Input
            label="Department Affiliation"
            placeholder="e.g. Mechanical Engineering, Year 3"
            leftIcon={<Building2 className="w-4 h-4" />}
            error={errors.affiliation?.message}
            {...register("affiliation")}
          />

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue to Verification Onboarding
          </Button>

          <p className="text-center text-xs text-ink-muted pt-1">
            By creating an account, you agree to Eastbrook collegiate equipment sharing regulations and condition accountability rules.
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-2">
        <p>© 2026 Eastbrook Institute of Technology · Commons</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-ink transition-colors">
            Sign In
          </Link>
          <Link href="/design" className="hover:text-ink transition-colors">
            Design System
          </Link>
        </div>
      </footer>
    </div>
  );
}


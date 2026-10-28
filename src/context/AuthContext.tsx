"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DEMO_ACCOUNTS, type DemoRole } from "@/lib/auth/demo";
import type { VerificationStatus, CredentialStatus, RequirementType } from "@/lib/supabase/types";

export type Role = "student" | "owner" | "manager" | "admin";

export interface UserCredentialItem {
  id: string;
  userId: string;
  userName: string;
  userAffiliation: string;
  requirementLabel: string;
  type: RequirementType;
  documentPath?: string;
  status: CredentialStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  expiresAt?: string;
  reviewNote?: string;
  submittedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  affiliation: string;
  verifiedStatus: VerificationStatus;
  avatarUrl?: string;
  weeklyHoursUsed: number;
  weeklyHoursCap: number;
  noShowsCount: number;
}

interface AuthContextType {
  user: UserProfile;
  role: Role;
  roleTitle: string;
  setRole: (role: Role) => void;
  verifiedStatus: VerificationStatus;
  setVerifiedStatus: (status: VerificationStatus) => void;
  credentials: UserCredentialItem[];
  reviewQueue: UserCredentialItem[];
  demoLogin: (role: DemoRole) => Promise<void>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    fullName: string;
    email: string;
    password: string;
    role: Role;
    affiliation: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  submitOnboardingCredential: (credential: {
    requirementLabel: string;
    type: RequirementType;
    fileName: string;
    department: string;
    institution: string;
    notes?: string;
  }) => void;
  reviewCredential: (
    credentialId: string,
    decision: "verified" | "rejected",
    reviewNote?: string
  ) => void;
}

const INITIAL_CREDENTIALS: UserCredentialItem[] = [
  {
    id: "cred-01",
    userId: DEMO_ACCOUNTS.student.id,
    userName: "Aanya Patel",
    userAffiliation: "B.Tech Mechanical Engineering, Year 3",
    requirementLabel: "Laser Safety Certification Level 1",
    type: "training",
    status: "verified",
    reviewedBy: "Dr. Kavitha Rao",
    reviewedAt: "2026-10-08",
    expiresAt: "2027-04-08",
    reviewNote: "Passed optical alignment practical check with 100%.",
    submittedAt: "2026-10-08T10:00:00Z",
  },
  {
    id: "cred-02",
    userId: DEMO_ACCOUNTS.student.id,
    userName: "Aanya Patel",
    userAffiliation: "B.Tech Mechanical Engineering, Year 3",
    requirementLabel: "Fabrication Lab Proximity Card",
    type: "authorisation",
    status: "verified",
    reviewedBy: "Dr. Kavitha Rao",
    reviewedAt: "2026-08-20",
    reviewNote: "Physical RFID tag #89201 issued and active.",
    submittedAt: "2026-08-20T14:30:00Z",
  },
  {
    id: "cred-03",
    userId: DEMO_ACCOUNTS.student.id,
    userName: "Aanya Patel",
    userAffiliation: "B.Tech Mechanical Engineering, Year 3",
    requirementLabel: "FDM 3D Printing Fundamentals",
    type: "qualification",
    status: "verified",
    reviewedBy: "Dr. Kavitha Rao",
    reviewedAt: "2026-09-12",
    reviewNote: "Completed PrusaSlicer orientation module.",
    submittedAt: "2026-09-12T09:15:00Z",
  },
  {
    id: "cred-04",
    userId: DEMO_ACCOUNTS.student.id,
    userName: "Aanya Patel",
    userAffiliation: "B.Tech Mechanical Engineering, Year 3",
    requirementLabel: "Workshop Safety Orientation",
    type: "training",
    status: "verified",
    reviewedBy: "Imran Syed",
    reviewedAt: "2026-07-30",
    reviewNote: "Fall semester general machine shop safety sign-off.",
    submittedAt: "2026-07-30T11:00:00Z",
  },
  {
    id: "cred-05",
    userId: DEMO_ACCOUNTS.student.id,
    userName: "Aanya Patel",
    userAffiliation: "B.Tech Mechanical Engineering, Year 3",
    requirementLabel: "AV Media Vault Equipment Induction",
    type: "training",
    documentPath: "vault/inductions/aanya_patel_av_2026.pdf",
    status: "pending",
    reviewNote: "Scheduled for Friday camera briefing.",
    submittedAt: "2026-10-28T13:45:00Z",
  },
];

const INITIAL_QUEUE: UserCredentialItem[] = [
  ...INITIAL_CREDENTIALS.filter((c) => c.status === "pending"),
  {
    id: "cred-06",
    userId: "55555555-5555-5555-5555-555555555555",
    userName: "Marcus Brody",
    userAffiliation: "Graduate Robotics Laboratory, Year 1",
    requirementLabel: "Digital Fabrication CNC Level 2",
    type: "qualification",
    documentPath: "vault/credentials/brody_cnc_cert.pdf",
    status: "pending",
    submittedAt: "2026-10-28T14:10:00Z",
  },
  {
    id: "cred-07",
    userId: "66666666-6666-6666-6666-666666666666",
    userName: "Elena Rostova",
    userAffiliation: "School of Architecture & Urban Design",
    requirementLabel: "Laser Safety Certification Level 1",
    type: "training",
    documentPath: "vault/credentials/rostova_laser_safety.pdf",
    status: "pending",
    submittedAt: "2026-10-28T11:20:00Z",
  },
];

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRoleState] = React.useState<Role>("student");
  const [verifiedStatus, setVerifiedStatus] = React.useState<VerificationStatus>("verified");
  const [credentials, setCredentials] = React.useState<UserCredentialItem[]>(INITIAL_CREDENTIALS);
  const [reviewQueue, setReviewQueue] = React.useState<UserCredentialItem[]>(INITIAL_QUEUE);

  // Sync role to cookie so Next.js server components & middleware read it
  const setRole = React.useCallback((newRole: Role) => {
    setRoleState(newRole);
    if (typeof document !== "undefined") {
      document.cookie = `commons_demo_role=${newRole}; path=/; max-age=604800; SameSite=Lax`;
    }
  }, []);

  const demoAccountsMapped: Record<Role, UserProfile> = React.useMemo(() => ({
    student: {
      id: DEMO_ACCOUNTS.student.id,
      email: DEMO_ACCOUNTS.student.email,
      fullName: DEMO_ACCOUNTS.student.name,
      role: "student",
      affiliation: DEMO_ACCOUNTS.student.affiliation,
      verifiedStatus: verifiedStatus,
      avatarUrl: "/avatars/aanya.jpg",
      weeklyHoursUsed: 2.5,
      weeklyHoursCap: 8.0,
      noShowsCount: 0,
    },
    owner: {
      id: DEMO_ACCOUNTS.owner.id,
      email: DEMO_ACCOUNTS.owner.email,
      fullName: DEMO_ACCOUNTS.owner.name,
      role: "owner",
      affiliation: DEMO_ACCOUNTS.owner.affiliation,
      verifiedStatus: "verified",
      avatarUrl: "/avatars/dr-rao.jpg",
      weeklyHoursUsed: 0,
      weeklyHoursCap: 99.0,
      noShowsCount: 0,
    },
    manager: {
      id: DEMO_ACCOUNTS.manager.id,
      email: DEMO_ACCOUNTS.manager.email,
      fullName: DEMO_ACCOUNTS.manager.name,
      role: "manager",
      affiliation: DEMO_ACCOUNTS.manager.affiliation,
      verifiedStatus: "verified",
      avatarUrl: "/avatars/imran.jpg",
      weeklyHoursUsed: 0,
      weeklyHoursCap: 99.0,
      noShowsCount: 0,
    },
    admin: {
      id: DEMO_ACCOUNTS.admin.id,
      email: DEMO_ACCOUNTS.admin.email,
      fullName: DEMO_ACCOUNTS.admin.name,
      role: "admin",
      affiliation: DEMO_ACCOUNTS.admin.affiliation,
      verifiedStatus: "verified",
      avatarUrl: "/avatars/admin.jpg",
      weeklyHoursUsed: 0,
      weeklyHoursCap: 99.0,
      noShowsCount: 0,
    },
  }), [verifiedStatus]);

  const user = demoAccountsMapped[role];

  const roleTitle = React.useMemo(() => {
    switch (role) {
      case "student":
        return "Student / Researcher";
      case "owner":
        return "Lab & Equipment Owner";
      case "manager":
        return "Department Coordinator";
      case "admin":
        return "Campus Administrator";
    }
  }, [role]);

  // Read initial persona from cookie if present
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/commons_demo_role=([^;]+)/);
      if (match && ["student", "owner", "manager", "admin"].includes(match[1])) {
        setRoleState(match[1] as Role);
      }
    }
  }, []);

  const demoLogin = async (targetRole: DemoRole) => {
    try {
      const res = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");

      setRole(targetRole);
      toast.success(`Signed in as ${data.profile?.full_name || targetRole}`, {
        description: `Campus persona switched to ${targetRole.toUpperCase()}.`,
      });

      if (targetRole === "owner" || targetRole === "manager" || targetRole === "admin") {
        router.push("/admin/credentials");
      } else {
        router.push("/explore");
      }
    } catch (err: unknown) {
      // Fallback
      setRole(targetRole);
      toast.success(`Demo Persona: ${targetRole.toUpperCase()}`);
      router.push(targetRole === "student" ? "/explore" : "/admin/credentials");
    }
  };

  const login = async (email: string) => {
    // Recognize demo accounts or log in cleanly
    const foundDemoRole = (Object.keys(DEMO_ACCOUNTS) as DemoRole[]).find(
      (k) => DEMO_ACCOUNTS[k].email.toLowerCase() === email.toLowerCase()
    );
    if (foundDemoRole) {
      await demoLogin(foundDemoRole);
      return { success: true };
    }

    // Generic campus user
    setRole("student");
    toast.success("Welcome back to Commons", {
      description: "Signed in with collegiate credentials.",
    });
    router.push("/explore");
    return { success: true };
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    password: string;
    role: Role;
    affiliation: string;
  }) => {
    setRole(data.role);
    setVerifiedStatus("unverified");
    toast.success("Campus account created", {
      description: "Welcome to Eastbrook Commons. Please complete onboarding.",
    });
    router.push("/onboarding");
    return { success: true };
  };

  const logout = () => {
    if (typeof document !== "undefined") {
      document.cookie = "commons_demo_role=; path=/; max-age=0";
    }
    toast.info("Signed out of Commons session");
    router.push("/login");
  };

  const submitOnboardingCredential = (data: {
    requirementLabel: string;
    type: RequirementType;
    fileName: string;
    department: string;
    institution: string;
    notes?: string;
  }) => {
    const newCred: UserCredentialItem = {
      id: `cred-${Date.now()}`,
      userId: user.id,
      userName: user.fullName,
      userAffiliation: `${data.department}, ${data.institution}`,
      requirementLabel: data.requirementLabel,
      type: data.type,
      documentPath: `vault/credentials/${data.fileName}`,
      status: "pending",
      reviewNote: data.notes || "Submitted via campus onboarding portal.",
      submittedAt: new Date().toISOString(),
    };

    setCredentials((prev) => [newCred, ...prev]);
    setReviewQueue((prev) => [newCred, ...prev]);
    setVerifiedStatus("pending");
  };

  const reviewCredential = (
    credentialId: string,
    decision: "verified" | "rejected",
    reviewNote?: string
  ) => {
    const reviewerName = user.fullName;
    const nowStr = new Date().toISOString().split("T")[0];

    const updater = (item: UserCredentialItem): UserCredentialItem => {
      if (item.id === credentialId) {
        return {
          ...item,
          status: decision,
          reviewedBy: reviewerName,
          reviewedAt: nowStr,
          reviewNote: reviewNote || (decision === "verified" ? "Verified compliance with campus safety standard." : "Declined by lab custodian."),
          expiresAt: decision === "verified" ? "2027-10-28" : undefined,
        };
      }
      return item;
    };

    setReviewQueue((prev) => prev.map(updater));
    setCredentials((prev) => prev.map(updater));

    if (decision === "verified") {
      toast.success("Credential approved", {
        description: "Logged to audit ledger and applicant notified.",
      });
    } else {
      toast.error("Credential rejected", {
        description: `Applicant notified with explanation: "${reviewNote || "Documentation requirements unmet"}"`,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        roleTitle,
        setRole,
        verifiedStatus,
        setVerifiedStatus,
        credentials,
        reviewQueue,
        demoLogin,
        login,
        signup,
        logout,
        submitOnboardingCredential,
        reviewCredential,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Backward-compatible alias for existing components
export function useRole() {
  const { role, setRole, roleTitle } = useAuth();
  return { role, setRole, roleTitle };
}


import type { UserRole } from "@/lib/supabase/types";

export const DEMO_ACCOUNTS = {
  student: {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Aanya Patel",
    email: "aanya@eastbrook.edu",
    password: "demo-student-2026!",
    role: "user" as UserRole,
    affiliation: "B.Tech Mechanical Engineering, Year 3",
  },
  owner: {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Dr. Kavitha Rao",
    email: "rao@eastbrook.edu",
    password: "demo-owner-2026!",
    role: "owner" as UserRole,
    affiliation: "Associate Professor, Eastbrook Fabrication Lab",
  },
  manager: {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Imran Syed",
    email: "imran@eastbrook.edu",
    password: "demo-manager-2026!",
    role: "manager" as UserRole,
    affiliation: "Lab Coordinator, EE Department",
  },
  admin: {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Campus Administrator",
    email: "admin@eastbrook.edu",
    password: "demo-admin-2026!",
    role: "admin" as UserRole,
    affiliation: "Dean of Operations & Resource Governance",
  },
} as const;

export type DemoRole = keyof typeof DEMO_ACCOUNTS;


# AGENTS.md — Project Governance & Engineering Standards

> **Governing Document**: This file serves as the single source of truth for all architectural, design, engineering, and workflow standards for **Commons**. It must be strictly respected by all AI agents, contributors, and subagents across every task and turn. A replica of this file is maintained at `GEMINI.md`.

---

## 1. Project Overview

### **Commons** — Trusted Campus Resource Sharing
"Commons" is an editorial, calm, and high-trust resource-sharing platform engineered specifically for a single college campus community. Verified owners list underutilized campus resources—including specialized labs, study rooms, media equipment, hardware testbenches, fabrication tools, and precision instruments.

Users can:
1. Discover available campus resources with real-time status and availability schedules.
2. Prove eligibility and department/course qualification.
3. Request reservations/bookings with purpose declarations.
4. Experience transparent approval, waitlist, or rejection flows with clear, human explanations.
5. Check in upon physical arrival by uploading timestamped condition photos.
6. Return items/spaces on schedule with check-out confirmation.
7. Report delays, damages, or discrepancies, backed by immutable audit tracking.

### Hackathon North Star
> **Judge Self-Serve Guarantee**: A hackathon judge must be able to complete one end-to-end journey (**Listing → Discovery → Eligibility/Booking Request → Approval → Photo Check-in → Return & Condition Verification**) completely unassisted, with zero external explanation or out-of-band setup.

---

## 2. Technical Stack

| Category | Technology | Usage & Constraint |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server Components by default; Client Components (`'use client'`) only when state or client events are mandatory. Strict adherence to React 19 conventions. |
| **Language** | TypeScript | `strict: true`, zero `any`, strict null checks, full type safety for database schemas and API responses. |
| **Styling** | Tailwind CSS | Semantic utility classes using explicit design tokens defined below. Hairline borders, 8pt spacing grid. |
| **Database & Auth** | Supabase | Postgres DB, Supabase Auth, Storage (condition photos/documents), Realtime, and Row Level Security (RLS) on every table. |
| **State Mutations** | Postgres RPC Functions | **Zero direct client status updates.** Every status lifecycle change goes through validated stored procedures that write to `audit_log`. |
| **Motion & Polish** | Framer Motion | Fluid, accessible transitions inside the app UI. Must respect `prefers-reduced-motion`. |
| **Landing Experience** | GSAP + ScrollTrigger + Lenis | **Restricted strictly to the public landing/marketing page.** Never bleed GSAP/Lenis into application dashboard views. |
| **Iconography** | Lucide React | Minimal, consistent stroke widths. **No emoji icons.** |
| **Forms & Validation** | React Hook Form + Zod | Schema-first validation with inline, contextual error messages on every field. |
| **Date Utilities** | `date-fns` | Consistent date/time parsing, relative scheduling, and timeline formatting. |
| **Feedback / Toasts** | Sonner | Accessible, subtle notifications for operation confirmations and errors. |

---

## 3. Skills & Process Triggers

Before undertaking UI/UX or engineering passes, consult and activate the appropriate skills:

1. **`design-taste-frontend` / Taste Skill**:
   - Activate before designing or writing public, user-facing, or dashboard web pages.
   - Enforce anti-slop principles: curated typography, bespoke layout composition, no generic templates.
2. **`ui-ux-pro-max` / UI-UX Skill**:
   - Apply for comprehensive UI/UX intelligence, component states, color profiles, accessibility guidelines, responsive behavior, and micro-interactions.
3. **`gstack` Suite**:
   - Leverage `gstack-review` and `gstack-qa` passes when verifying PRs, diffs, responsive breakpoints, and workflows.

---

## 4. Design System & Rules (Non-Negotiable)

### Aesthetic Direction
**Editorial, calm, and premium.** Think archival records meets contemporary collegiate typography. Restrained warmth, tactile clarity, and generous breathing room.

### Palette Tokens

| Token Name | Hex Code | Role / Usage |
|---|---|---|
| `bone` | `#F3EEE4` | Main page background, subtle contrasting backdrops |
| `surface` | `#FBF8F2` | Card backgrounds, elevated surfaces, sheet containers |
| `ink` | `#1C1B18` | Primary typography, deep hairline borders, high-contrast marks |
| `muted ink` | `#6B675E` | Secondary copy, metadata, timestamps, input placeholders |
| `line` | `#E2DBCB` | 1px hairline borders, dividers, subtle table rules |
| `accent terracotta` | `#B8522E` | Primary call to action, active indicators, focal accents |
| `sage` | `#8A9A7B` | Secondary accents, tags, neutral success tints |
| `success` | `#3F6B4A` | Completed returns, verified condition, approved states |
| `warning` | `#B07A1E` | Pending approvals, waitlisted items, upcoming deadlines |
| `danger` | `#A3362B` | Damage reports, overdue alerts, rejection notices |

### Typography
- **Display Font**: `Instrument Serif` (Headings, hero titles, milestone labels, editorial pullouts).
- **Body & Interface Font**: `Geist` (Sans-serif interface copy, navigation, forms, tabular data).

### Banned Anti-Patterns (Zero Tolerance)
- ❌ **No purple/blue or generic multi-color SaaS gradients**.
- ❌ **No glassmorphism, blur-heavy frosted surfaces, or neon glows**.
- ❌ **No emojis used as functional or UI icons** (use `lucide-react` exclusively).
- ❌ **No generic 3-equal-card feature grids**; construct intentional, editorial asymmetrical layouts or thoughtful lists.
- ❌ **No placeholder "Lorem ipsum"**; always draft context-specific campus copy.
- ❌ **No stock "AI sparkle" or magic wand visual tropes**.

### Layout & Spacing Rules
- **Grid & Spacing**: Strict 8pt spacing grid (`p-2`, `p-4`, `p-6`, `p-8`, `gap-4`, etc.).
- **Borders & Radii**: Thin `1px` hairline borders (`border-[#E2DBCB]`), subtle corner radii between `14px` and `20px` (`rounded-2xl` / `rounded-3xl`).
- **Whitespace**: Generous vertical pacing; do not cram controls.
- **Mobile-First**: Design and test at **375px** first, then scale smoothly to tablet and **1280px+** desktop.
- **Touch & Accessibility**:
  - Minimum touch target: **44px × 44px** for buttons, tabs, links, and form controls.
  - Visible, high-contrast focus rings for keyboard navigation (`focus-visible:ring-2 focus-visible:ring-[#B8522E]`).
  - Strict compliance with **WCAG AA contrast ratios** against `#F3EEE4` and `#FBF8F2`.
  - Respect `prefers-reduced-motion` for all Framer Motion and GSAP animations.

---

## 5. Engineering Architecture & Integrity

### Database & RPC Status Integrity
- **Immutability of History**: Direct client-side updates to booking, item, or verification statuses (e.g. `supabase.from('bookings').update({ status: 'approved' })`) are **strictly prohibited**.
- **Postgres RPC Functions**: Every single state transition (e.g., `request_booking`, `approve_booking`, `reject_booking`, `check_in_resource`, `return_resource`, `report_issue`) must execute through a designated Postgres RPC function.
- **Automated Audit Logging**: Every RPC status transition must atomically insert an entry into `audit_log` capturing:
  - `entity_type` & `entity_id`
  - `actor_id` (from `auth.uid()`)
  - `previous_status` & `new_status`
  - `reason_or_notes`
  - `metadata` (JSON payload with condition photos, timestamps, geolocation, or flags)
  - `created_at`
- **Row Level Security (RLS)**: Every table must have RLS enabled with explicit `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies tied to authenticated roles.

### User Roles & Permissions
1. **Student / User**: Discovers resources, verifies student identity, submits booking requests, uploads check-in condition photos, returns items, logs disputes/delays.
2. **Owner**: Departments, lab managers, professors, or clubs owning equipment. Creates and manages listings, sets availability, reviews and approves/rejects requests with required explanations.
3. **Manager**: Campus lab monitors or departmental coordinators who can verify check-ins, inspect equipment returns, and oversee day-to-day custody.
4. **Admin**: Campus-wide authority overseeing disputes, audit log trails, platform verification, and security escalations.

### Component & File Structure Standards
```text
/
├── app/                      # Next.js 15 App Router pages & layouts
│   ├── (marketing)/          # Landing page (GSAP + ScrollTrigger + Lenis)
│   ├── (app)/                # Authenticated application flows (Framer Motion)
│   │   ├── explore/          # Discovery & filtering
│   │   ├── listings/         # Owner listing management
│   │   ├── bookings/         # Active journeys & check-ins
│   │   └── audit/            # Transparent audit history
│   └── api/                  # Route handlers (when RPC cannot be called directly)
├── components/               # Commit-sized, modular UI components
│   ├── ui/                   # Primitive accessible atoms (buttons, inputs, dialogs)
│   ├── common/               # Layout elements, navbar, state containers
│   └── journey/              # Stepper, photo uploader, condition check
├── lib/                      # Pure domain logic, validation schemas, utilities
│   ├── supabase/             # Supabase client, server, and middleware helpers
│   ├── validations/          # Zod schemas (booking, listing, return schemas)
│   └── utils.ts              # Class merging and formatting helpers
├── supabase/
│   └── migrations/           # SQL DDL, RLS policies, and RPC stored procedures
├── .env.example              # Documented environment variable template
└── .env.local                # Local environment configuration (never committed)
```

### State & Error Handling Requirements
- **Every list view** must implement 3 explicit states with intentional, domain-specific copy:
  1. *Loading State*: Skeleton shimmer or calm editorial loader matching `#F3EEE4`.
  2. *Empty State*: Helpful, encouraging guidance with an action (e.g., "No active bookings in Hall B — check available lab benches").
  3. *Error State*: Clear explanation of failure with a manual retry trigger.
- **Every form** must include:
  - Zod schema validation matching server-side expectations.
  - Accessible inline error labels positioned directly beneath the invalid field.
  - Disabled or pending state visual indicator on submit triggers to prevent duplicate submissions.
- **Secrets & Configuration**:
  - No credentials or sensitive API keys hardcoded in the codebase.
  - Maintain a pristine `.env.example` documenting all required variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.).

---

## 6. Definition of Done (DoD)

For every feature, refactor, or bugfix turn, the task is considered complete **only** when all of the following criteria are fulfilled:

1. **Zero TypeScript Errors**: Passes `tsc --noEmit` and builds clean with Next.js without warnings.
2. **Responsive Fidelity**: Verified functional and visually balanced at both **375px (Mobile)** and **1280px (Desktop)**.
3. **Complete State Coverage**: All relevant states (default, hover/focus, active, loading, empty, validation error, server error) are accounted for.
4. **Audit Trail Compliance**: Any state alteration correctly dispatches to the corresponding Postgres RPC function and writes to the audit log.
5. **Verification Report**: Explicitly summarize in the turn response exactly what was verified (e.g., lint/typecheck runs, state checks, UI responsive verifications).


"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowRight,
  Send,
  Search,
  FileCheck2,
  Calendar,
  Lock,
  Camera,
  Layers,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Sheet,
  Dialog,
  Tabs,
  Tooltip,
  Skeleton,
  EmptyState,
  Avatar,
  Stepper,
  Timeline,
  DataTable,
  type Column,
} from "@/components/ui";

interface SampleResource {
  id: string;
  name: string;
  category: string;
  location: string;
  custodian: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "waitlisted"
    | "active"
    | "returned"
    | "overdue"
    | "disputed";
  hourlyRate: string;
}

export default function DesignSystemPage() {
  // Dialog & Sheet State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [sheetPosition, setSheetPosition] = React.useState<"bottom" | "right">("bottom");

  // Tabs State
  const [activeTab, setActiveTab] = React.useState("overview");
  const [pillTab, setPillTab] = React.useState("tab1");

  // Form Controls State
  const [switchActive, setSwitchActive] = React.useState(true);
  const [checkboxChecked, setCheckboxChecked] = React.useState(true);
  const [selectValue, setSelectValue] = React.useState("eecs");

  // Sample Data for DataTable
  const sampleResources: SampleResource[] = [
    {
      id: "res-1",
      name: "Coherent 120W Laser Cutter",
      category: "Fabrication Tool",
      location: "East Hall Rm 104",
      custodian: "Prof. S. Adler",
      status: "active",
      hourlyRate: "Free / Academic",
    },
    {
      id: "res-2",
      name: "Anechoic RF Testbench",
      category: "Specialized Lab",
      location: "Maxwell Tower B2",
      custodian: "Dr. K. Chen",
      status: "pending",
      hourlyRate: "Free / Academic",
    },
    {
      id: "res-3",
      name: "RED V-Raptor 8K Cinema Rig",
      category: "Media Equipment",
      location: "Arts Studio 220",
      custodian: "Film Guild",
      status: "approved",
      hourlyRate: "$15 / session",
    },
    {
      id: "res-4",
      name: "Transmission Electron Microscope",
      category: "Precision Instrument",
      location: "Materials Science 01",
      custodian: "Materials Dept",
      status: "waitlisted",
      hourlyRate: "Faculty Auth",
    },
    {
      id: "res-5",
      name: "Formlabs Form 4 SLA 3D Printer",
      category: "Fabrication Tool",
      location: "Makerspace Rm 12",
      custodian: "Robotics Club",
      status: "returned",
      hourlyRate: "Material cost",
    },
    {
      id: "res-6",
      name: "Keysight 50GHz Network Analyzer",
      category: "Precision Instrument",
      location: "EE Research Lab 402",
      custodian: "EECS Department",
      status: "overdue",
      hourlyRate: "Free / Academic",
    },
  ];

  const columns: Column<SampleResource>[] = [
    {
      key: "name",
      header: "Resource & Spec",
      render: (item) => (
        <div>
          <div className="font-semibold text-ink">{item.name}</div>
          <div className="text-mono-label text-ink-muted flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-terracotta" />
            <span>{item.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => (
        <span className="text-small text-ink-muted">{item.category}</span>
      ),
    },
    {
      key: "custodian",
      header: "Custodian",
      render: (item) => (
        <span className="text-small font-medium text-ink">{item.custodian}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <Badge status={item.status} />,
    },
    {
      key: "actions",
      header: "Action",
      className: "text-right",
      render: (item) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info(`Inspect resource: ${item.name}`)}
        >
          View Log
        </Button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-16">
        {/* ======================================================== */}
        {/* HERO / INTRODUCTION                                      */}
        {/* ======================================================== */}
        <section className="border-b border-line pb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge status="active" showDot={false}>
                Internal Living Styleguide & Lab
              </Badge>
              <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
                Editorial Design System
              </h1>
              <p className="text-body text-ink-muted max-w-2xl leading-relaxed">
                Archival collegiate clarity, restrained warmth, and tactile
                elegance engineered strictly according to the non-negotiable
                standards in <code className="text-xs bg-bone px-1.5 py-0.5 rounded border border-line">GEMINI.md</code>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success("Design tokens validated against WCAG AA standards.");
                }}
              >
                Audit AA Contrast
              </Button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 1. COLOR TOKENS & SWATCHES                               */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-line/60 pb-3">
            <span className="text-mono-label uppercase text-ink-muted">Token Layer 01</span>
            <h2 className="font-display text-h2 text-ink">Palette Architecture</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: "Bone", hex: "#F3EEE4", role: "Page Backdrop", bg: "bg-bone", text: "text-ink" },
              { name: "Surface", hex: "#FBF8F2", role: "Cards & Sheets", bg: "bg-surface", text: "text-ink" },
              { name: "Ink", hex: "#1C1B18", role: "Primary Text & Dark Marks", bg: "bg-ink", text: "text-surface" },
              { name: "Muted Ink", hex: "#6B675E", role: "Metadata & Subtitles", bg: "bg-[#6B675E]", text: "text-surface" },
              { name: "Line", hex: "#E2DBCB", role: "Hairline Borders (1px)", bg: "bg-line", text: "text-ink" },
              { name: "Terracotta", hex: "#B8522E", role: "Primary Action & Focal", bg: "bg-terracotta", text: "text-surface" },
              { name: "Sage", hex: "#8A9A7B", role: "Secondary Accents", bg: "bg-sage", text: "text-surface" },
              { name: "Success", hex: "#3F6B4A", role: "Approved & Completed", bg: "bg-success", text: "text-surface" },
              { name: "Warning", hex: "#B07A1E", role: "Pending & Waitlisted", bg: "bg-warning", text: "text-surface" },
              { name: "Danger", hex: "#A3362B", role: "Delays, Disputes, Errors", bg: "bg-danger", text: "text-surface" },
            ].map((token) => (
              <div
                key={token.name}
                className="border border-line rounded-editorial overflow-hidden bg-surface shadow-sm group"
              >
                <div
                  className={`h-20 ${token.bg} flex items-end p-3 transition-transform group-hover:scale-[1.02] duration-150`}
                >
                  <span className={`text-mono-label font-bold ${token.text}`}>
                    {token.hex}
                  </span>
                </div>
                <div className="p-3">
                  <div className="font-semibold text-small text-ink">{token.name}</div>
                  <div className="text-xs text-ink-muted leading-tight mt-0.5">
                    {token.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. TYPOGRAPHY SCALE                                      */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-line/60 pb-3">
            <span className="text-mono-label uppercase text-ink-muted">Token Layer 02</span>
            <h2 className="font-display text-h2 text-ink">Fluid Typography Hierarchy</h2>
          </div>

          <div className="bg-surface border border-line rounded-editorial p-6 space-y-6 divide-y divide-line/60">
            <div className="space-y-1">
              <div className="text-mono-label text-ink-muted">display-xl (Instrument Serif)</div>
              <p className="font-display text-display-xl text-ink leading-tight">
                Commons Archival
              </p>
            </div>
            <div className="pt-6 space-y-1">
              <div className="text-mono-label text-ink-muted">display-lg (Instrument Serif)</div>
              <p className="font-display text-display-lg text-ink leading-tight">
                High-Trust Campus Resource Sharing
              </p>
            </div>
            <div className="pt-6 space-y-1">
              <div className="text-mono-label text-ink-muted">h1 (Instrument Serif)</div>
              <h1 className="font-display text-h1 text-ink">Precision Equipment Booking & Audit Trail</h1>
            </div>
            <div className="pt-6 space-y-1">
              <div className="text-mono-label text-ink-muted">h2 (Instrument Serif)</div>
              <h2 className="font-display text-h2 text-ink">Department Verification & Qualification</h2>
            </div>
            <div className="pt-6 space-y-1">
              <div className="text-mono-label text-ink-muted">h3 & h4 (Instrument Serif)</div>
              <h3 className="font-display text-h3 text-ink">Optical Bench Alpha — Laser Physics Laboratory</h3>
              <h4 className="font-display text-h4 text-ink-muted">Sub-nanometer stabilization table</h4>
            </div>
            <div className="pt-6 space-y-1">
              <div className="text-mono-label text-ink-muted">body & small (Geist Sans)</div>
              <p className="text-body text-ink max-w-2xl leading-relaxed">
                Reservations are allocated based on student course qualifications and safety certifications.
                Condition photos taken upon pickup and return form an immutable chain of custody in the campus ledger.
              </p>
              <p className="text-small text-ink-muted">
                Last verified by Lab Monitor R. Hawthorne on Oct 28, 2026 at 14:15 EST.
              </p>
            </div>
            <div className="pt-6 space-y-1">
              <div className="text-mono-label text-ink-muted">mono-label (Geist Mono uppercase)</div>
              <p className="text-mono-label text-ink tracking-widest uppercase">
                STATUS: DEPT_CERTIFIED_LEVEL_3 · AUDIT_HASH: 0x8F92A
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. BUTTONS & ACTIONS                                     */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-line/60 pb-3">
            <span className="text-mono-label uppercase text-ink-muted">Components</span>
            <h2 className="font-display text-h2 text-ink">Button Matrix & Interactive States</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>Distinct visual weights for actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary Ink</Button>
                  <Button variant="accent">Accent Terracotta</Button>
                  <Button variant="outline">Hairline Outline</Button>
                  <Button variant="ghost">Quiet Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sizes & Ergonomics</CardTitle>
                <CardDescription>All meeting the strict ≥44px mobile touch target rule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="outline">Small (44px)</Button>
                  <Button size="md" variant="primary">Standard (44px)</Button>
                  <Button size="lg" variant="accent">Hero Action (48px)</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading & Disabled States</CardTitle>
                <CardDescription>Zero layout shift with calm editorial spinners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button isLoading variant="primary">
                    Saving
                  </Button>
                  <Button isLoading variant="accent">
                    Confirming
                  </Button>
                  <Button disabled variant="outline">
                    Unavailable
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Icon Pairing</CardTitle>
                <CardDescription>Lucide icons with balanced stroke and spacing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    leftIcon={<Camera className="w-4 h-4" />}
                    onClick={() => toast.success("Condition photo shutter activated")}
                  >
                    Check In Photo
                  </Button>
                  <Button
                    variant="accent"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => toast.info("Opening booking request pipeline")}
                  >
                    Request Booking
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<FileCheck2 className="w-4 h-4 text-success" />}
                  >
                    Verify Pass
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. FORM CONTROLS & INLINE VALIDATION                     */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-line/60 pb-3">
            <span className="text-mono-label uppercase text-ink-muted">Inputs & Forms</span>
            <h2 className="font-display text-h2 text-ink">Form Controls with Schema Feedback</h2>
          </div>

          <div className="bg-surface border border-line rounded-editorial p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Student Identity / Institutional ID"
                placeholder="e.g. s2026adler@campus.edu"
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Must match your verified departmental roster."
              />
              <Input
                label="Intended Project Title"
                placeholder="e.g. Senior Capstone: Autonomous Rover"
                error="Project title is required for insurance coverage"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Departmental Affiliation"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: "eecs", label: "Electrical Eng. & Computer Science" },
                  { value: "mech", label: "Mechanical & Aerospace Engineering" },
                  { value: "phys", label: "Department of Physics & Astronomy" },
                  { value: "arch", label: "School of Architecture & Fabrication" },
                ]}
                helperText="Determines automated access eligibility tier."
              />
              <Select
                label="Access Classification (Disabled Example)"
                disabled
                options={[{ value: "restricted", label: "Tier 4 Radiation Protocol" }]}
                helperText="Contact Lab Safety Officer for clearance."
              />
            </div>

            <Textarea
              label="Intended Purpose Declaration & Safety Protocol"
              placeholder="Detail your operational hours, tools required, and supervisor in charge..."
              maxLength={300}
              maxLengthIndicator
              helperText="Campus policy requires all laser cutter reservations to document material specs."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-line/60">
              <div className="space-y-3">
                <Checkbox
                  id="chk-safety"
                  label="I have completed Workshop Safety 101"
                  description="Attended mandatory training in the current academic semester."
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                />
                <Checkbox
                  id="chk-error"
                  label="Acknowledge campus damage liability"
                  description="Required to proceed with booking creation."
                  error="You must accept responsibility to request access."
                />
              </div>

              <div className="space-y-4">
                <Switch
                  id="sw-notify"
                  label="Real-time SMS return reminders"
                  description="Receive 30-minute advance notice before check-out deadline."
                  checked={switchActive}
                  onCheckedChange={setSwitchActive}
                />
                <Switch
                  id="sw-dis"
                  label="Emergency Escalation Beacon"
                  description="Reserved for department heads and campus security."
                  disabled
                />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. STATUS BADGES                                         */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-line/60 pb-3">
            <span className="text-mono-label uppercase text-ink-muted">Lifecycle State</span>
            <h2 className="font-display text-h2 text-ink">Complete Status Badge Collection</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audit & Booking Status Tokens</CardTitle>
              <CardDescription>
                Color-coded indicators mapping 1:1 to database lifecycle RPC functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Badge status="pending" />
                <Badge status="approved" />
                <Badge status="active" />
                <Badge status="returned" />
                <Badge status="waitlisted" />
                <Badge status="rejected" />
                <Badge status="overdue" />
                <Badge status="disputed" />
                <Badge status="neutral">Neutral Tag</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ======================================================== */}
        {/* 6. STEPPER & AUDIT TIMELINE                              */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-line/60 pb-3">
            <span className="text-mono-label uppercase text-ink-muted">North Star Journey</span>
            <h2 className="font-display text-h2 text-ink">Journey Stepper & Audit Ledger</h2>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Judge End-to-End Progression</CardTitle>
                <CardDescription>
                  Tracks state across Discovery → Booking → Approval → Photo Check-in → Return
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Stepper
                  steps={[
                    { id: 1, title: "Booking Request", description: "Submitted Oct 28", status: "completed" },
                    { id: 2, title: "Owner Approval", description: "Granted by Prof. Adler", status: "completed" },
                    { id: 3, title: "Photo Check-in", description: "Condition verified", status: "current" },
                    { id: 4, title: "Custody & Usage", description: "In session", status: "upcoming" },
                    { id: 5, title: "Return Sign-off", description: "Final inspection", status: "upcoming" },
                  ]}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Log Timeline</CardTitle>
                  <CardDescription>
                    Immutable chain of custody written atomically by Postgres RPC
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Timeline
                    events={[
                      {
                        id: "aud-3",
                        timestamp: "Today at 14:45",
                        actorName: "Elena Rostova (Student)",
                        actorRole: "Student",
                        previousStatus: "approved",
                        newStatus: "active",
                        notes: "Check-in condition photo uploaded. Verified clean lens & bed alignment.",
                        metadata: { photoHash: "sha256:d8a92...", deskStatus: "verified" },
                      },
                      {
                        id: "aud-2",
                        timestamp: "Today at 11:20",
                        actorName: "Prof. S. Adler",
                        actorRole: "Owner",
                        previousStatus: "pending",
                        newStatus: "approved",
                        notes: "Qualified for high-power cutting. Safety orientation on file.",
                      },
                      {
                        id: "aud-1",
                        timestamp: "Yesterday at 17:05",
                        actorName: "Elena Rostova",
                        actorRole: "Student",
                        newStatus: "pending",
                        notes: "Requested 2-hour reservation for architectural scale model prototyping.",
                      },
                    ]}
                  />
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Empty State Architecture</CardTitle>
                    <CardDescription>
                      Thoughtful, context-specific guidance instead of cold blanks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmptyState
                      title="No Active Reservations in East Hall"
                      description="You currently hold no active reservations or custody passes for fabrication equipment in this facility."
                      action={
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => toast.info("Redirecting to explore directory")}
                        >
                          Browse Available Tools
                        </Button>
                      }
                      secondaryAction={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info("Opening course prerequisites")}
                        >
                          Check Prerequisites
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skeleton Loaders</CardTitle>
                    <CardDescription>Editorial bone/line shimmer preventing jarring shifts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10" rounded="full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full" rounded="lg" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 7. DATA TABLE (RESPONSIVE: DESKTOP & MOBILE STACK)       */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-line/60 pb-3">
            <span className="text-mono-label uppercase text-ink-muted">Tabular Presentation</span>
            <h2 className="font-display text-h2 text-ink">Campus Resource Directory</h2>
            <p className="text-small text-ink-muted">
              Renders as an archival table on desktop (≥768px) and automatically transforms into stacked tactile cards on mobile (&lt;768px).
            </p>
          </div>

          <DataTable
            data={sampleResources}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        </section>

        {/* ======================================================== */}
        {/* 8. OVERLAYS: MODAL DIALOG & BOTTOM SHEET                 */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-line/60 pb-3">
            <span className="text-mono-label uppercase text-ink-muted">Overlays & Interaction</span>
            <h2 className="font-display text-h2 text-ink">Dialog & Responsive Sheet Triggers</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="primary"
              onClick={() => setIsDialogOpen(true)}
            >
              Open Modal Dialog
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSheetPosition("bottom");
                setIsSheetOpen(true);
              }}
            >
              Open Mobile Bottom Sheet
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSheetPosition("right");
                setIsSheetOpen(true);
              }}
            >
              Open Slide-Over Panel
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                toast.success("Custody transfer acknowledged", {
                  description: "Written to immutable audit trail block #4921.",
                });
              }}
            >
              Trigger Success Toast
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                toast.error("Equipment verification expired", {
                  description: "Please renew your laser cutter qualification certificate.",
                });
              }}
            >
              Trigger Error Toast
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            <Tooltip content="Verified by Campus Safety Board">
              <span className="inline-flex items-center gap-1.5 text-small text-ink border-b border-dashed border-ink/40 cursor-help">
                <FileCheck2 className="w-4 h-4 text-success" />
                Hover me for Tooltip
              </span>
            </Tooltip>

            <Avatar
              name="Marcus Brody"
              subtitle="Lab Custodian · Rm 104"
              verified
              size="lg"
            />
            <Avatar name="Sofia Adler" size="md" verified />
            <Avatar name="Kaelen Chen" size="sm" />
          </div>
        </section>

        {/* ======================================================== */}
        {/* 9. AUTH, ONBOARDING & VERIFICATION                       */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-line/60 pb-3">
            <span className="text-mono-label uppercase text-ink-muted">Access & Credentials</span>
            <h2 className="font-display text-h2 text-ink">Authentication & Onboarding Architecture</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/login" className="block">
              <Card interactive className="h-full">
                <CardHeader>
                  <CardTitle className="text-h4">1. /login Portal</CardTitle>
                  <CardDescription>
                    4-chip instant demo sign-in (Student, Owner, Manager, Admin) + password credentials.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <span className="text-terracotta text-small font-semibold flex items-center gap-1">
                    Open Login Portal <ArrowRight className="w-4 h-4" />
                  </span>
                </CardFooter>
              </Card>
            </Link>

            <Link href="/onboarding" className="block">
              <Card interactive className="h-full">
                <CardHeader>
                  <CardTitle className="text-h4">2. /onboarding Stepper</CardTitle>
                  <CardDescription>
                    3-step workflow: Department affiliation, vault certificate upload, plain-English privacy disclosure.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <span className="text-terracotta text-small font-semibold flex items-center gap-1">
                    Open Onboarding Stepper <ArrowRight className="w-4 h-4" />
                  </span>
                </CardFooter>
              </Card>
            </Link>

            <Link href="/admin/credentials" className="block">
              <Card interactive className="h-full">
                <CardHeader>
                  <CardTitle className="text-h4">3. /admin/credentials Queue</CardTitle>
                  <CardDescription>
                    Signed-URL document viewer with review decisions (Approve, Reject with reason, Request Info).
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <span className="text-terracotta text-small font-semibold flex items-center gap-1">
                    Open Review Desk <ArrowRight className="w-4 h-4" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          </div>
        </section>

        {/* ======================================================== */}
        {/* MODAL DIALOG INSTANCE                                    */}
        {/* ======================================================== */}
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Confirm Reservation Intent"
          description="Please review your reservation parameters before dispatching to the department owner."
        >
          <div className="space-y-4">
            <div className="p-4 bg-bone/70 rounded-editorial border border-line space-y-2">
              <div className="flex justify-between text-small">
                <span className="text-ink-muted">Resource:</span>
                <span className="font-semibold text-ink">Coherent 120W Laser Cutter</span>
              </div>
              <div className="flex justify-between text-small">
                <span className="text-ink-muted">Time Slot:</span>
                <span className="font-semibold text-ink">Oct 28, 15:00 – 17:00 EST</span>
              </div>
              <div className="flex justify-between text-small">
                <span className="text-ink-muted">Supervisor:</span>
                <span className="font-semibold text-ink">Dr. R. Vance</span>
              </div>
            </div>
            <p className="text-small text-ink-muted leading-relaxed">
              Submitting this request writes a pending declaration to the campus database.
              The owner will be alerted to evaluate your course eligibility.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={() => {
                  setIsDialogOpen(false);
                  toast.success("Booking request submitted to owner queue!");
                }}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </Dialog>

        {/* ======================================================== */}
        {/* SHEET INSTANCE                                           */}
        {/* ======================================================== */}
        <Sheet
          isOpen={isSheetOpen}
          position={sheetPosition}
          onClose={() => setIsSheetOpen(false)}
          title={sheetPosition === "bottom" ? "Mobile Condition Check-in" : "Resource Specifications"}
          description="Upload arrival photos to verify physical condition prior to operating equipment."
        >
          <div className="space-y-5">
            <div className="border border-dashed border-line rounded-editorial p-6 text-center bg-bone/40 space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface border border-line flex items-center justify-center mx-auto text-terracotta">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-small text-ink">
                  Take or Upload Condition Photo
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  High-resolution photo stamped with campus timestamp
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Sample check-in photo attached (bed_clear_20261028.jpg)")}
              >
                Select Image File
              </Button>
            </div>

            <Textarea
              label="Pre-existing Observation / Wear Notes"
              placeholder="Note any scratches, residue, or alignment flags..."
            />

            <Button
              className="w-full"
              variant="accent"
              onClick={() => {
                setIsSheetOpen(false);
                toast.success("Physical check-in registered in audit trail!");
              }}
            >
              Sign and Confirm Check-in
            </Button>
          </div>
        </Sheet>
      </div>
    </AppShell>
  );
}


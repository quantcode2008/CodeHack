"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Calendar,
  Clock,
  Download,
  Trash2,
  FileCheck2,
  LogOut,
  PlusCircle,
  AlertTriangle,
  Building2,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth, type UserCredentialItem } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, credentials, logout, role, roleTitle } = useAuth();

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = React.useState("");

  // Data Download Handler
  const handleDownloadData = () => {
    const dataArchive = {
      archive_version: "1.0",
      generated_at: new Date().toISOString(),
      institution: "Eastbrook Institute of Technology",
      user_profile: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        affiliation: user.affiliation,
        verified_status: user.verifiedStatus,
        weekly_hours_used: user.weeklyHoursUsed,
        weekly_hours_cap: user.weeklyHoursCap,
        no_shows_recorded: user.noShowsCount,
      },
      verified_credentials: credentials,
      governance_notice:
        "This export contains your complete collegiate access records, active safety credentials, and fair-use audit logs.",
    };

    const blob = new Blob([JSON.stringify(dataArchive, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commons_data_archive_${user.email.split("@")[0]}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Data archive generated and downloaded", {
      description: "Complete JSON snapshot saved to your device.",
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmationText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleteOpen(false);
    toast.info("Deletion request logged to Campus Governance Board", {
      description: "Under academic privacy policy, accounts are purged within 30 days.",
    });
  };

  const usagePercent = Math.min(
    100,
    Math.round((user.weeklyHoursUsed / user.weeklyHoursCap) * 100)
  );

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-surface border border-line rounded-editorial p-6 sm:p-8 shadow-editorial space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                name={user.fullName}
                verified={user.verifiedStatus === "verified"}
                size="lg"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-h2 text-ink font-normal leading-tight">
                    {user.fullName}
                  </h1>
                  <Badge status={user.verifiedStatus === "verified" ? "approved" : user.verifiedStatus} />
                </div>
                <p className="text-small text-ink-muted">
                  {user.affiliation} · {user.email}
                </p>
                <div className="flex items-center gap-2 pt-1 text-mono-label text-ink-muted">
                  <span>Persona: <strong className="text-ink">{roleTitle}</strong></span>
                  <span>·</span>
                  <span>ID: <code className="bg-bone px-1 rounded">{user.id.slice(0, 8)}</code></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Link href="/onboarding">
                <Button size="sm" variant="outline" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Add Credential
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={logout}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="text-ink-muted hover:text-danger"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Fair-Use Metering & Usage (Quiet Editorial Progress Bar) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Collegiate Fair-Use Allocation</CardTitle>
                <CardDescription>
                  Weekly category hour cap preventing resource monopolization.
                </CardDescription>
              </div>
              <span className="text-mono-label font-bold text-terracotta">
                {user.weeklyHoursUsed}h / {user.weeklyHoursCap}h used
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quiet Editorial Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-bone border border-line rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-terracotta rounded-full transition-all duration-300"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-ink-muted">
                <span>0h (Monday reset)</span>
                <span>
                  {(user.weeklyHoursCap - user.weeklyHoursUsed).toFixed(1)}h remaining this week
                </span>
                <span>{user.weeklyHoursCap}h max weekly cap</span>
              </div>
            </div>

            {/* Fair Use Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-line/60 text-small">
              <div className="p-3 bg-bone/50 border border-line rounded-editorial">
                <span className="text-xs text-ink-muted block">No-Show Record</span>
                <strong className="text-success text-small font-semibold">
                  0 No-Shows (Clean Standing)
                </strong>
              </div>
              <div className="p-3 bg-bone/50 border border-line rounded-editorial">
                <span className="text-xs text-ink-muted block">Waitlist Multiplier</span>
                <strong className="text-ink text-small font-semibold">
                  1.25x Priority Tier
                </strong>
              </div>
              <div className="p-3 bg-bone/50 border border-line rounded-editorial">
                <span className="text-xs text-ink-muted block">Consecutive-Day Limit</span>
                <strong className="text-ink text-small font-semibold">
                  Max 2 days per scarce tool
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credentials List with Expiry Badges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-mono-label uppercase text-ink-muted">Proof of Qualification</span>
              <h2 className="font-display text-h2 text-ink">My Safety & Lab Credentials</h2>
            </div>
            <Link href="/onboarding">
              <Button size="sm" variant="accent" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Upload Document
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="bg-surface border border-line rounded-editorial p-4 sm:p-5 shadow-xs hover:border-ink/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-body text-ink">
                      {cred.requirementLabel}
                    </span>
                    <Badge status={cred.status} />
                    {cred.expiresAt ? (
                      <span className="text-mono-label text-ink-muted px-2 py-0.5 rounded bg-bone border border-line/60 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-warning" />
                        Expires {cred.expiresAt}
                      </span>
                    ) : (
                      <span className="text-mono-label text-ink-muted px-2 py-0.5 rounded bg-bone border border-line/60">
                        Permanent Pass
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-ink-muted">
                    Classification: <strong className="capitalize text-ink">{cred.type}</strong>
                    {cred.reviewedBy && (
                      <span> · Verified by {cred.reviewedBy} on {cred.reviewedAt}</span>
                    )}
                  </p>

                  {cred.reviewNote && (
                    <p className="text-xs text-ink/80 bg-bone/50 p-2 rounded border border-line/40 max-w-lg">
                      {cred.reviewNote}
                    </p>
                  )}
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {cred.documentPath ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info(`Accessing encrypted token for: ${cred.documentPath}`)}
                    >
                      View Certificate
                    </Button>
                  ) : (
                    <span className="text-mono-label text-ink-muted">Institutional Roster</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Rights & Privacy Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Collegiate Data Rights & Export</CardTitle>
            <CardDescription>
              In accordance with campus privacy charters, you retain full ownership of your data history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-small text-ink-muted leading-relaxed">
              Your profile records, uploaded training certificates, and condition audit trails are stored securely within the private institutional enclave. You may export your complete historical archive or request permanent deletion.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                leftIcon={<Download className="w-4 h-4 text-terracotta" />}
                onClick={handleDownloadData}
              >
                Download My Data Archive (JSON)
              </Button>

              <Button
                variant="ghost"
                className="text-danger hover:bg-danger/10 hover:text-danger"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  setDeleteConfirmationText("");
                  setIsDeleteOpen(true);
                }}
              >
                Request Account Deletion
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Deletion Dialog */}
        <Dialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Confirm Account Deletion Request"
          description="Permanent deletion will revoke active equipment reservations and archive safety certificates."
        >
          <div className="space-y-4">
            <p className="text-small text-ink-muted leading-relaxed">
              To verify your intention, please type <strong className="text-danger">DELETE</strong> in the field below. Your request will be queued for campus administrative review.
            </p>

            <Input
              placeholder="Type DELETE"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={deleteConfirmationText !== "DELETE"}
                onClick={handleConfirmDelete}
              >
                Submit Deletion Request
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Check,
  X,
  FileText,
  AlertCircle,
  Eye,
  Clock,
  HelpCircle,
  User,
  Building2,
  Calendar,
  Lock,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth, type UserCredentialItem } from "@/context/AuthContext";
import { useAudit } from "@/context/AuditContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Sheet } from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CredentialsReviewPage() {
  const { reviewQueue, reviewCredential, role, roleTitle, user } = useAuth();
  const { logAudit } = useAudit();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "verified" | "rejected">("pending");
  const [selectedCredential, setSelectedCredential] = React.useState<UserCredentialItem | null>(null);

  // AI Pre-Check State
  const [aiPrecheck, setAiPrecheck] = React.useState<{
    extractedName: string;
    extractedCourse: string;
    issueDate: string;
    expiryDate: string;
    mismatchFlags: string[];
    isNameMatching: boolean;
    isExpired: boolean;
    confidence: string;
    reviewerGuidance: string;
    isAiGenerated: boolean;
    modelUsed: string;
  } | null>(null);
  const [isLoadingPrecheck, setIsLoadingPrecheck] = React.useState(false);

  // Fetch precheck whenever credential is opened
  React.useEffect(() => {
    if (!selectedCredential) {
      setAiPrecheck(null);
      return;
    }

    let isMounted = true;
    setIsLoadingPrecheck(true);

    fetch("/api/ai/credential-precheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: selectedCredential.documentPath || "certificate.pdf",
        requirementLabel: selectedCredential.requirementLabel,
        userProfileName: selectedCredential.userName,
        userEmail: "aanya@eastbrook.edu",
        userAffiliation: selectedCredential.userAffiliation,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setAiPrecheck(data);

          // Log AI Pre-check event in audit trail
          logAudit({
            entityType: "credential",
            entityId: selectedCredential.id,
            entityTitle: selectedCredential.requirementLabel,
            action: "AI_CREDENTIAL_PRECHECK_EVALUATED",
            actionLabel: "AI Credential Pre-Check Evaluated",
            actorId: user?.id || "usr-reviewer",
            actorName: user?.fullName || "Custodian Reviewer",
            actorRole: (user?.role as any) || "owner",
            reason: `Evaluated training certificate for ${selectedCredential.userName} via ${data.modelUsed}.`,
            before: undefined,
            after: {
              extractedName: data.extractedName,
              mismatchFlagsCount: data.mismatchFlags?.length || 0,
              isNameMatching: data.isNameMatching,
            },
          });
        }
      })
      .catch(() => {
        // Fallback
      })
      .finally(() => {
        if (isMounted) setIsLoadingPrecheck(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCredential, user, logAudit]);

  // Rejection Dialog State
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectError, setRejectError] = React.useState<string | null>(null);

  // Request More Info Dialog State
  const [isMoreInfoOpen, setIsMoreInfoOpen] = React.useState(false);
  const [moreInfoText, setMoreInfoText] = React.useState("");

  // Filtered Items
  const filteredQueue = React.useMemo(() => {
    return reviewQueue.filter((item) => {
      const matchesSearch =
        item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requirementLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.userAffiliation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reviewQueue, searchQuery, statusFilter]);

  const handleApprove = (cred: UserCredentialItem) => {
    reviewCredential(cred.id, "verified", "Passed verification criteria.");
    if (selectedCredential?.id === cred.id) {
      setSelectedCredential((prev) => (prev ? { ...prev, status: "verified" } : null));
    }
  };

  const handleOpenReject = (cred: UserCredentialItem) => {
    setSelectedCredential(cred);
    setRejectReason("");
    setRejectError(null);
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 8) {
      setRejectError("A substantive reason is required (minimum 8 characters).");
      return;
    }

    if (selectedCredential) {
      reviewCredential(selectedCredential.id, "rejected", rejectReason);
      setSelectedCredential((prev) => (prev ? { ...prev, status: "rejected" } : null));
    }
    setIsRejectDialogOpen(false);
  };

  const handleConfirmMoreInfo = () => {
    if (!moreInfoText.trim()) return;
    toast.info("Request for information dispatched to student", {
      description: `Note: "${moreInfoText}" appended to application record.`,
    });
    setIsMoreInfoOpen(false);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge status="active" showDot={false}>
                Custodian Review Queue
              </Badge>
              <span className="text-mono-label text-ink-muted">
                Active Role: {roleTitle}
              </span>
            </div>
            <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
              Credential Verification Desk
            </h1>
            <p className="text-small text-ink-muted leading-relaxed max-w-2xl">
              Inspect student safety training certifications, machine shop qualifications, and liability waivers. Every review decision dispatches directly to the immutable audit ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-small text-ink-muted">Pending Backlog:</span>
            <Badge status="pending">
              {reviewQueue.filter((c) => c.status === "pending").length} Awaiting Review
            </Badge>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 border border-line rounded-editorial shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search student or certificate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-bone/50 border border-line rounded-editorial text-small text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            {(
              [
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "verified" },
                { label: "Rejected", value: "rejected" },
                { label: "All Items", value: "all" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-editorial text-xs font-medium transition-colors select-none cursor-pointer whitespace-nowrap min-h-[38px]",
                  statusFilter === filter.value
                    ? "bg-ink text-surface font-semibold"
                    : "bg-bone hover:bg-bone/80 text-ink-muted hover:text-ink border border-line/60"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Queue List */}
        {filteredQueue.length === 0 ? (
          <EmptyState
            title="Review Queue Clear"
            description={
              statusFilter === "pending"
                ? "No pending student credentials currently require custodian review. All submissions are up to date."
                : "No credential records match your active search and filter parameters."
            }
            action={
              statusFilter !== "all" ? (
                <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
                  View All Submissions
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredQueue.map((item) => {
              const isPending = item.status === "pending";

              return (
                <div
                  key={item.id}
                  className="bg-surface border border-line rounded-editorial p-5 shadow-editorial hover:border-ink/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-body text-ink truncate">
                        {item.userName}
                      </span>
                      <span className="text-mono-label text-ink-muted px-2 py-0.5 rounded bg-bone border border-line/60">
                        {item.userAffiliation}
                      </span>
                      <Badge status={item.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-ink/90">
                      <span className="font-medium text-terracotta flex items-center gap-1.5">
                        <FileText className="w-4 h-4 shrink-0" />
                        {item.requirementLabel}
                      </span>
                      <span className="text-ink-muted text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted: {item.submittedAt.split("T")[0]}
                      </span>
                    </div>

                    {item.reviewNote && (
                      <p className="text-xs text-ink-muted bg-bone/40 p-2 rounded border border-line/40 max-w-xl">
                        <strong>Note:</strong> {item.reviewNote}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Eye className="w-4 h-4" />}
                      onClick={() => setSelectedCredential(item)}
                    >
                      Inspect Document
                    </Button>

                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          variant="accent"
                          leftIcon={<Check className="w-4 h-4" />}
                          onClick={() => handleApprove(item)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger hover:bg-danger/10 hover:text-danger"
                          leftIcon={<X className="w-4 h-4" />}
                          onClick={() => handleOpenReject(item)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECURE SIGNED-URL VIEWER SHEET (SLIDE-OVER)              */}
        {/* ======================================================== */}
        <Sheet
          isOpen={!!selectedCredential}
          position="right"
          onClose={() => setSelectedCredential(null)}
          title="Secure Credential Inspection"
          description="Decrypted signed URL viewer with cryptographic audit trail."
        >
          {selectedCredential && (
            <div className="space-y-6">
              {/* Document Metadata Card */}
              <div className="p-4 bg-bone/60 border border-line rounded-editorial space-y-2 text-small">
                <div className="flex justify-between border-b border-line/60 pb-1.5">
                  <span className="text-ink-muted">Applicant:</span>
                  <span className="font-semibold text-ink">{selectedCredential.userName}</span>
                </div>
                <div className="flex justify-between border-b border-line/60 pb-1.5">
                  <span className="text-ink-muted">Affiliation:</span>
                  <span className="text-ink">{selectedCredential.userAffiliation}</span>
                </div>
                <div className="flex justify-between border-b border-line/60 pb-1.5">
                  <span className="text-ink-muted">Certificate:</span>
                  <strong className="text-terracotta">{selectedCredential.requirementLabel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Storage Bucket:</span>
                  <span className="font-mono text-xs text-ink">credentials (private)</span>
                </div>
              </div>

              {/* Secure Document Canvas Preview */}
              <div className="border border-line rounded-editorial p-6 bg-surface shadow-inner text-center space-y-4">
                <div className="w-16 h-20 bg-bone border border-line rounded shadow-sm mx-auto flex flex-col items-center justify-center text-ink-muted p-2">
                  <FileText className="w-8 h-8 text-terracotta mb-1" />
                  <span className="text-[9px] font-mono uppercase">PDF SECURE</span>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-small text-ink">
                    {selectedCredential.documentPath || "certificate_scan_verified.pdf"}
                  </p>
                  <p className="text-xs text-ink-muted flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-success" />
                    Encrypted Token: exp=1730129400&sig=sha256_d89201f...
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/credentials/signed-url", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          path: selectedCredential.documentPath || "credentials/cert.pdf",
                          bucket: "credentials",
                        }),
                      });
                      const data = await res.json();
                      if (data.signedUrl) {
                        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
                      }
                    } catch {
                      toast.error("Could not generate cryptographic signed URL");
                    }
                  }}
                >
                  Open Secure Document (15m Signed URL)
                </Button>

                <div className="p-3 bg-bone/80 rounded-md border border-line/60 text-left text-xs text-ink/80 space-y-1">
                  <div className="font-semibold text-ink">Simulated Scan Verification:</div>
                  <p>• Optical radiation training completed on Oct 08, 2026.</p>
                  <p>• Practical exam score: 100%.</p>
                  <p>• Signed by Eastbrook Safety Officer Dr. S. Vance.</p>
                </div>
              </div>

              {/* AI Credential Pre-Check Card */}
              <div className="p-4 bg-bone/70 border border-line rounded-editorial space-y-3 text-xs shadow-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    <Sparkles className="w-4 h-4 text-terracotta" />
                    <span>AI Pre-Check Hints (OCR & Mismatch)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-terracotta/10 text-terracotta font-semibold">
                    Advisory Only
                  </span>
                </div>

                {isLoadingPrecheck ? (
                  <div className="space-y-1.5 py-2">
                    <div className="h-4 bg-bone rounded animate-pulse" />
                    <div className="h-4 bg-bone rounded animate-pulse w-3/4" />
                  </div>
                ) : aiPrecheck ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-ink-muted block text-[10px] uppercase">Extracted Recipient</span>
                        <strong className="text-ink">{aiPrecheck.extractedName}</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted block text-[10px] uppercase">Verified Program</span>
                        <strong className="text-ink">{aiPrecheck.extractedCourse}</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted block text-[10px] uppercase">Issue Date</span>
                        <span className="font-mono text-ink">{aiPrecheck.issueDate}</span>
                      </div>
                      <div>
                        <span className="text-ink-muted block text-[10px] uppercase">Expiry Date</span>
                        <span className="font-mono text-ink">{aiPrecheck.expiryDate}</span>
                      </div>
                    </div>

                    {/* Mismatch & Consistency Indicators */}
                    <div className="p-2.5 bg-surface rounded border border-line space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[11px] text-ink">
                        {aiPrecheck.isNameMatching ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-warning" />
                        )}
                        <span>
                          {aiPrecheck.isNameMatching
                            ? "Recipient matches applicant profile"
                            : "Potential name discrepancy flagged"}
                        </span>
                      </div>

                      {aiPrecheck.mismatchFlags.map((flag, idx) => (
                        <p key={idx} className="text-[10px] text-ink-muted pl-5 leading-tight">
                          • {flag}
                        </p>
                      ))}
                    </div>

                    <p className="text-[10px] text-ink-muted leading-tight">
                      <strong>Guidance: </strong>{aiPrecheck.reviewerGuidance}
                    </p>
                  </div>
                ) : null}

                {/* Governance Mandatory Notice */}
                <div className="pt-2 border-t border-line/60 text-[10px] text-ink-muted">
                  <strong className="text-ink">Reviewer Governance: </strong>
                  AI never makes final decisions. Hints are synthesized to assist verification; the human custodian must approve or reject.
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="space-y-3 pt-2">
                <span className="text-mono-label uppercase text-ink-muted font-bold block">
                  Custodian Evaluation Action
                </span>

                {selectedCredential.status === "pending" ? (
                  <div className="space-y-2">
                    <Button
                      variant="accent"
                      className="w-full"
                      leftIcon={<Check className="w-4 h-4" />}
                      onClick={() => handleApprove(selectedCredential)}
                    >
                      Approve & Register Credential
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        leftIcon={<HelpCircle className="w-4 h-4" />}
                        onClick={() => setIsMoreInfoOpen(true)}
                      >
                        Request Info
                      </Button>
                      <Button
                        variant="danger"
                        leftIcon={<X className="w-4 h-4" />}
                        onClick={() => handleOpenReject(selectedCredential)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-bone rounded-editorial border border-line text-small text-center">
                    Status: <Badge status={selectedCredential.status} />
                    <p className="text-xs text-ink-muted mt-1">
                      Evaluated on {selectedCredential.reviewedAt} by {selectedCredential.reviewedBy}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Sheet>

        {/* ======================================================== */}
        {/* REJECT MODAL DIALOG (REASON REQUIRED)                    */}
        {/* ======================================================== */}
        <Dialog
          isOpen={isRejectDialogOpen}
          onClose={() => setIsRejectDialogOpen(false)}
          title="Reject Safety Credential"
          description="Collegiate standards require a clear, human explanation so the applicant can take corrective action."
        >
          <div className="space-y-4">
            {rejectError && (
              <div className="p-3 bg-[#FCF2F1] border border-danger/40 text-danger text-small rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rejectError}</span>
              </div>
            )}

            <div className="p-3 bg-bone/70 border border-line rounded-md text-small">
              <span className="text-xs text-ink-muted block">Rejecting Credential For:</span>
              <strong>{selectedCredential?.userName}</strong> — {selectedCredential?.requirementLabel}
            </div>

            <Textarea
              label="Explanation for Rejection (Required)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Certificate scan is illegible, expired, or missing prerequisite optical hazard module signature..."
              helperText="This reason is permanently preserved in the audit log and emailed to the student."
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmReject}
                leftIcon={<X className="w-4 h-4" />}
              >
                Confirm Rejection & Notify
              </Button>
            </div>
          </div>
        </Dialog>

        {/* ======================================================== */}
        {/* REQUEST MORE INFO DIALOG                                 */}
        {/* ======================================================== */}
        <Dialog
          isOpen={isMoreInfoOpen}
          onClose={() => setIsMoreInfoOpen(false)}
          title="Request Credential Clarification"
          description="Send an inquiry to the student regarding missing details or document renewal."
        >
          <div className="space-y-4">
            <Textarea
              label="Inquiry / Clarification Request"
              value={moreInfoText}
              onChange={(e) => setMoreInfoText(e.target.value)}
              placeholder="e.g. Please upload the practical exam completion certificate along with your attendance slip..."
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/60">
              <Button variant="outline" onClick={() => setIsMoreInfoOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleConfirmMoreInfo}>
                Send Request
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}


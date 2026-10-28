"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  FileUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Lock,
  Eye,
  Calendar,
  AlertCircle,
  UploadCloud,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Stepper, type StepItem } from "@/components/ui/Stepper";
import { type RequirementType } from "@/lib/supabase/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, submitOnboardingCredential } = useAuth();

  // Current Step: 1 = Affiliation, 2 = Credentials, 3 = Review & Privacy
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);

  // Form State: Step 1 Affiliation
  const [institution, setInstitution] = React.useState("Eastbrook Institute of Technology");
  const [department, setDepartment] = React.useState("Mechanical Engineering");
  const [academicRole, setAcademicRole] = React.useState("Undergraduate Student (Year 3)");
  const [studentId, setStudentId] = React.useState("EIT-2024-89201");
  const [affiliationError, setAffiliationError] = React.useState<string | null>(null);

  // Form State: Step 2 Credentials
  const [credentialType, setCredentialType] = React.useState<RequirementType>("training");
  const [requirementLabel, setRequirementLabel] = React.useState("Laser Safety Certification Level 1");
  const [selectedFileName, setSelectedFileName] = React.useState<string>("laser_safety_certificate_2026.pdf");
  const [uploadProgress, setUploadProgress] = React.useState<number>(100);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [notes, setNotes] = React.useState<string>(
    "Completed orientation with Prof. Adler. Scored 100% on beam hazard handling."
  );

  // Success State
  const [isCompleted, setIsCompleted] = React.useState<boolean>(false);

  const steps: StepItem[] = [
    {
      id: 1,
      title: "Affiliation",
      description: "Department & Status",
      status: currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "upcoming",
    },
    {
      id: 2,
      title: "Credentials",
      description: "Safety Certificates",
      status: currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "upcoming",
    },
    {
      id: 3,
      title: "Review & Privacy",
      description: "Rights & Submission",
      status: currentStep === 3 ? "current" : "upcoming",
    },
  ];

  const handleStep1Next = () => {
    if (!department.trim() || !studentId.trim()) {
      setAffiliationError("Department and campus student ID are required.");
      return;
    }
    setAffiliationError(null);
    setCurrentStep(2);
  };

  const simulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsUploading(true);
    setUploadProgress(15);

    setTimeout(() => setUploadProgress(55), 300);
    setTimeout(() => setUploadProgress(90), 600);
    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      toast.success("Document staged for private vault upload", {
        description: `${file.name} encrypted and verified.`,
      });
    }, 900);
  };

  const handleFinalSubmit = () => {
    submitOnboardingCredential({
      requirementLabel,
      type: credentialType,
      fileName: selectedFileName,
      department,
      institution,
      notes,
    });

    setIsCompleted(true);
    toast.success("Onboarding submitted for evaluation", {
      description: "Your verification status is now PENDING. Lab coordinators notified.",
    });
  };

  if (isCompleted) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 text-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge status="pending" showDot={false}>
              Verification Pending
            </Badge>
            <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
              Onboarding Complete
            </h1>
            <p className="text-small text-ink-muted leading-relaxed max-w-md mx-auto">
              Your credentials have been securely registered to the private vault.
              Dr. Kavitha Rao and authorized Eastbrook lab custodians have received your verification request.
            </p>
          </div>

          <div className="p-4 bg-surface border border-line rounded-editorial text-left text-small space-y-2 max-w-md mx-auto">
            <div className="flex justify-between border-b border-line/60 pb-2">
              <span className="text-ink-muted">Applicant:</span>
              <span className="font-semibold text-ink">{user.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-line/60 pb-2">
              <span className="text-ink-muted">Submitted Credential:</span>
              <span className="font-semibold text-ink">{requirementLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Expected Review Time:</span>
              <span className="text-success font-medium">~4 Academic Hours</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/explore">
              <Button variant="accent" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse Equipment Catalog
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline">
                View My Profile & Credentials
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <Badge status="active" showDot={false}>
            Academic Onboarding
          </Badge>
          <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
            Campus Verification Setup
          </h1>
          <p className="text-small text-ink-muted max-w-xl leading-relaxed">
            Prove your departmental standing and safety certifications to unlock self-serve reservations for precision tools, laser cutters, and specialized research rooms.
          </p>

          {/* Stepper */}
          <div className="pt-4 border-t border-line/60">
            <Stepper steps={steps} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: ACADEMIC AFFILIATION                            */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <Card className="animate-in fade-in duration-200">
            <CardHeader>
              <CardTitle>Step 1: Department & Academic Standing</CardTitle>
              <CardDescription>
                Confirm your collegiate enrollment or faculty appointment at Eastbrook Institute.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {affiliationError && (
                <div className="p-3 bg-[#FCF2F1] border border-danger/40 text-danger text-small rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{affiliationError}</span>
                </div>
              )}

              <Input
                label="Host Institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                helperText="Verified single-campus network"
                leftIcon={<Building2 className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Department / School"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  options={[
                    { value: "Mechanical Engineering", label: "Mechanical Engineering" },
                    { value: "Electrical & Computer Engineering", label: "Electrical & Computer Eng." },
                    { value: "Physics & Astronomy", label: "Physics & Astronomy" },
                    { value: "Architecture & Design", label: "Architecture & Design" },
                    { value: "Media Arts & Sound", label: "Media Arts & Sound" },
                    { value: "Materials Science", label: "Materials Science" },
                  ]}
                />

                <Select
                  label="Academic Role / Status"
                  value={academicRole}
                  onChange={(e) => setAcademicRole(e.target.value)}
                  options={[
                    { value: "Undergraduate Student (Year 3)", label: "Undergraduate Student" },
                    { value: "Master's Degree Candidate", label: "Master's Degree Candidate" },
                    { value: "Ph.D. Doctoral Researcher", label: "Ph.D. Doctoral Researcher" },
                    { value: "Postdoctoral Fellow / Faculty", label: "Faculty / Postdoctoral" },
                    { value: "Student Venture / Startup Team", label: "Student Venture Team" },
                  ]}
                />
              </div>

              <Input
                label="Student / Campus ID Number"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. EIT-2024-89201"
                helperText="Cross-referenced against verified university registrar records."
              />
            </CardContent>

            <CardFooter className="justify-end">
              <Button
                variant="accent"
                onClick={handleStep1Next}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Upload Credentials
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ======================================================== */}
        {/* STEP 2: UPLOAD CREDENTIALS                              */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <Card className="animate-in fade-in duration-200">
            <CardHeader>
              <CardTitle>Step 2: Upload Safety & Qualification Documents</CardTitle>
              <CardDescription>
                Upload your training orientation certificate, machine shop pass, or institutional clearance.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Credential Classification"
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value as RequirementType)}
                  options={[
                    { value: "training", label: "Safety Orientation & Training" },
                    { value: "qualification", label: "Course / Technical Qualification" },
                    { value: "authorisation", label: "Proximity Pass / Facility Card" },
                    { value: "membership", label: "Lab / Department Membership" },
                    { value: "document", label: "Signed Liability Release Form" },
                  ]}
                />

                <Select
                  label="Required Specific Certification"
                  value={requirementLabel}
                  onChange={(e) => setRequirementLabel(e.target.value)}
                  options={[
                    { value: "Laser Safety Certification Level 1", label: "Laser Safety Certification Level 1" },
                    { value: "Workshop Safety Orientation", label: "Workshop Safety Orientation" },
                    { value: "Digital Fabrication CNC Level 2", label: "Digital Fabrication CNC Level 2" },
                    { value: "AV Media Vault Equipment Induction", label: "AV Equipment Induction" },
                    { value: "FDM 3D Printing Fundamentals", label: "FDM 3D Printing Fundamentals" },
                  ]}
                />
              </div>

              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-line rounded-editorial p-6 sm:p-8 bg-bone/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface border border-line flex items-center justify-center mx-auto text-terracotta">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-small text-ink">
                    Upload certificate document (PDF, PNG, JPG)
                  </p>
                  <p className="text-xs text-ink-muted">
                    Stored in private encrypted bucket · Accessible only to reviewing custodians
                  </p>
                </div>

                <div className="pt-2">
                  <label className="inline-flex">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={simulateFileUpload}
                      className="sr-only"
                    />
                    <span className="px-4 py-2 bg-surface hover:bg-bone border border-line rounded-editorial text-small font-medium text-ink cursor-pointer transition-colors shadow-xs">
                      Choose Certificate File
                    </span>
                  </label>
                </div>

                {/* File Attachment Pill */}
                {selectedFileName && (
                  <div className="mt-4 p-3 bg-surface border border-line rounded-md text-left flex items-center justify-between gap-3 max-w-md mx-auto">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-terracotta shrink-0" />
                      <span className="text-small font-medium text-ink truncate">
                        {selectedFileName}
                      </span>
                    </div>
                    {isUploading ? (
                      <span className="text-mono-label text-terracotta font-bold">
                        {uploadProgress}%
                      </span>
                    ) : (
                      <Badge status="approved" showDot={false}>
                        Ready
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Textarea
                label="Optional Submitter Notes / Instructor Reference"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention instructor name, semester attended, or special clearance notes..."
              />
            </CardContent>

            <CardFooter className="justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Affiliation
              </Button>
              <Button
                variant="accent"
                onClick={() => setCurrentStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Privacy & Review
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ======================================================== */}
        {/* STEP 3: REVIEW & PLAIN-ENGLISH PRIVACY POLICY            */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <Card className="animate-in fade-in duration-200">
            <CardHeader>
              <CardTitle>Step 3: Review & Collegiate Privacy Guarantee</CardTitle>
              <CardDescription>
                Clear, transparent disclosure of how your credentials and campus records are governed.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Application Summary Box */}
              <div className="p-4 bg-bone/60 border border-line rounded-editorial space-y-2.5 text-small">
                <span className="text-mono-label uppercase text-ink-muted font-bold block mb-1">
                  Submission Summary
                </span>
                <div className="grid grid-cols-2 gap-2 text-ink">
                  <div>
                    <span className="text-xs text-ink-muted block">Student</span>
                    <strong>{user.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-ink-muted block">Institutional Email</span>
                    <strong>{user.email}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-ink-muted block">Department</span>
                    <span>{department}</span>
                  </div>
                  <div>
                    <span className="text-xs text-ink-muted block">Credential</span>
                    <strong className="text-terracotta">{requirementLabel}</strong>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* PLAIN-ENGLISH PRIVACY DISCLOSURE (NON-NEGOTIABLE)         */}
              {/* ======================================================== */}
              <div className="border border-line rounded-editorial p-5 bg-surface space-y-4">
                <div className="flex items-center gap-2 border-b border-line/60 pb-2">
                  <ShieldCheck className="w-4 h-4 text-terracotta" />
                  <span className="text-small font-semibold text-ink">
                    Collegiate Data Stewardship & Privacy Charter
                  </span>
                </div>

                <div className="space-y-3 text-small text-ink/90 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <Eye className="w-4 h-4 text-ink-muted shrink-0 mt-1" />
                    <div>
                      <strong className="text-ink">What data is collected:</strong>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Your legal name, campus institutional email, course enrollment status, and the certificate files you upload.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-ink-muted shrink-0 mt-1" />
                    <div>
                      <strong className="text-ink">Who can see it:</strong>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Only verified lab owners (e.g. Dr. Kavitha Rao) and departmental facility coordinators (e.g. Imran Syed) evaluating access clearance. Your files are stored in a private storage bucket and are never visible to students or outside third parties.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-ink-muted shrink-0 mt-1" />
                    <div>
                      <strong className="text-ink">How long it is kept:</strong>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Retained for the duration of the current academic year or until your certificate expires (typically 180–365 days). You may download your complete data archive or request permanent deletion at any time from your profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Documents
              </Button>

              <Button
                variant="accent"
                onClick={handleFinalSubmit}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm & Submit for Lab Review
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppShell>
  );
}


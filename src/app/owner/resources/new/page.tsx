"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ResourceWizard } from "@/components/owner/ResourceWizard";
import { ArrowLeft } from "lucide-react";

export default function NewResourcePage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          href="/owner/resources"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Listings</span>
        </Link>

        <ResourceWizard isEditMode={false} />
      </div>
    </AppShell>
  );
}


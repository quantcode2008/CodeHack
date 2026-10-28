"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ResourceWizard } from "@/components/owner/ResourceWizard";
import { useOwnerResources } from "@/context/OwnerResourceContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const { getResource } = useOwnerResources();

  const resourceId = params?.id as string;
  const resource = getResource(resourceId);

  if (!resource) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-12">
          <EmptyState
            title="Resource Not Found"
            description={`Could not locate listing with ID "${resourceId}".`}
            action={
              <Button variant="accent" onClick={() => router.push("/owner/resources")}>
                Return to Listings
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

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

        <ResourceWizard initialResource={resource} isEditMode={true} />
      </div>
    </AppShell>
  );
}

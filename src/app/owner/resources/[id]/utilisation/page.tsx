"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useOwnerResources } from "@/context/OwnerResourceContext";
import { UtilisationHeatmap } from "@/components/owner/UtilisationHeatmap";
import { Sparkline } from "@/components/owner/Sparkline";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ExternalLink, Calendar, ShieldCheck, Clock } from "lucide-react";

export default function ResourceUtilisationPage() {
  const params = useParams();
  const router = useRouter();
  const { getResource, getUtilisation } = useOwnerResources();

  const resourceId = params?.id as string;
  const resource = getResource(resourceId);

  if (!resource) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-12">
          <EmptyState
            title="Resource Not Found"
            description="The requested listing could not be found."
            action={
              <Button variant="accent" onClick={() => router.push("/owner/resources")}>
                Back to Listings
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  const util = getUtilisation(resource.id);

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto pb-16">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/owner/resources"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Listings</span>
          </Link>

          <Link href={`/resources/${resource.slug}`}>
            <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              View Student Catalog Page
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-line pb-4 space-y-1">
          <span className="text-mono-label uppercase text-ink-muted">Asset Demand Analytics</span>
          <h1 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight">
            {resource.title}
          </h1>
          <p className="text-xs text-ink-muted">
            {resource.locationText} • Custodian: {resource.owner.name} ({resource.owner.department})
          </p>
        </div>

        {/* Detailed Heatmap Component */}
        <UtilisationHeatmap data={util} resourceTitle={resource.title} />
      </div>
    </AppShell>
  );
}

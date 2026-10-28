"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useOwnerResources } from "@/context/OwnerResourceContext";
import { useAuth } from "@/context/AuthContext";
import { Sparkline } from "@/components/owner/Sparkline";
import { ManagerInviteDialog } from "@/components/owner/ManagerInviteDialog";
import { UtilisationHeatmap } from "@/components/owner/UtilisationHeatmap";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Plus,
  Layers,
  Settings,
  Users,
  BarChart3,
  ExternalLink,
  Flame,
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  Wrench,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type CampusResource } from "@/lib/resources/data";
import { type OwnerResourceStatus } from "@/lib/owner/types";

export default function OwnerResourcesPage() {
  const { user, role } = useAuth();
  const {
    myResources,
    updateResourceStatus,
    getUtilisation,
    getManagersByResource,
  } = useOwnerResources();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "listed" | "paused" | "draft">("all");
  const [selectedHeatmapResource, setSelectedHeatmapResource] = React.useState<CampusResource | null>(null);
  const [selectedManagerResource, setSelectedManagerResource] = React.useState<CampusResource | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Filtered resources
  const filteredResources = React.useMemo(() => {
    return myResources.filter((res) => {
      const matchesSearch =
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.locationText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : res.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [myResources, searchQuery, statusFilter]);

  // Aggregate metrics
  const totalListings = myResources.length;
  const activeListings = myResources.filter((r) => r.status === "listed").length;
  const avgUtilization = Math.round(
    myResources.reduce((acc, r) => acc + getUtilisation(r.id).utilizationRate, 0) / (myResources.length || 1)
  );
  const totalRecoveredHours = myResources.reduce(
    (acc, r) => acc + getUtilisation(r.id).idleHoursRecovered,
    0
  );

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Editorial Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
          <div className="space-y-1">
            <span className="text-mono-label uppercase text-ink-muted">Custodian Console</span>
            <h1 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight">
              My Campus Listings & Assets
            </h1>
            <p className="text-xs text-ink-muted">
              Oversee availability schedules, delegated lab managers, and collegiate utilization trends.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/owner/resources/new">
              <Button variant="accent" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                List New Resource
              </Button>
            </Link>
          </div>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Layers className="w-3.5 h-3.5 text-terracotta" />
              <span>Managed Assets</span>
            </div>
            <div className="font-display text-3xl text-ink font-normal">
              {totalListings}
            </div>
            <span className="text-[11px] text-ink-muted block">
              {activeListings} listed & active
            </span>
          </div>

          <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Flame className="w-3.5 h-3.5 text-terracotta" />
              <span>Fleet Utilization</span>
            </div>
            <div className="font-display text-3xl text-ink font-normal">
              {avgUtilization}%
            </div>
            <span className="text-[11px] text-sage font-medium block">
              +14% vs unshared baseline
            </span>
          </div>

          <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Clock className="w-3.5 h-3.5 text-sage" />
              <span>Idle Hours Recovered</span>
            </div>
            <div className="font-display text-3xl text-ink font-normal">
              {totalRecoveredHours}h
            </div>
            <span className="text-[11px] text-ink-muted block">
              This academic term
            </span>
          </div>

          <div className="p-4 bg-surface border border-line rounded-editorial space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Users className="w-3.5 h-3.5 text-ink-muted" />
              <span>Delegated Managers</span>
            </div>
            <div className="font-display text-3xl text-ink font-normal">
              {myResources.reduce((acc, r) => acc + getManagersByResource(r.id).length, 0)}
            </div>
            <span className="text-[11px] text-ink-muted block">
              Proctors & lab monitors
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface border border-line rounded-editorial shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, room, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-bone border border-line rounded-editorial text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {(
              [
                { id: "all", label: "All Listings" },
                { id: "listed", label: "Active" },
                { id: "paused", label: "Paused" },
                { id: "draft", label: "Drafts" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-editorial text-xs font-medium transition-colors cursor-pointer shrink-0 min-h-[36px]",
                  statusFilter === tab.id
                    ? "bg-ink text-surface font-semibold"
                    : "text-ink-muted hover:text-ink hover:bg-bone"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Collection */}
        {filteredResources.length === 0 ? (
          <EmptyState
            title="No Resources Found"
            description={
              searchQuery
                ? `No listings matching "${searchQuery}". Clear your search or filter.`
                : "You haven't listed any campus facilities yet. Click below to add your first asset."
            }
            action={
              <Link href="/owner/resources/new">
                <Button variant="accent">List New Resource</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredResources.map((resource) => {
              const util = getUtilisation(resource.id);
              const managers = getManagersByResource(resource.id);

              return (
                <div
                  key={resource.id}
                  className="p-5 bg-surface border border-line rounded-editorial shadow-xs hover:border-terracotta/40 transition-colors space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Thumbnail & Core Info */}
                    <div className="flex items-start gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resource.photos[0]}
                        alt={resource.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-editorial object-cover border border-line shrink-0"
                      />

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            status={
                              resource.status === "listed"
                                ? "approved"
                                : resource.status === "paused"
                                ? "pending"
                                : "neutral"
                            }
                          >
                            {resource.status === "listed"
                              ? "ACTIVE LISTED"
                              : resource.status.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-ink-muted font-mono">
                            {resource.categoryLabel}
                          </span>
                          <span className="text-line">•</span>
                          <span className="text-xs text-ink-muted">
                            {resource.locationText}
                          </span>
                        </div>

                        <Link
                          href={`/resources/${resource.slug}`}
                          className="group inline-flex items-center gap-1.5 text-ink hover:text-terracotta transition-colors"
                        >
                          <h2 className="font-display text-xl sm:text-2xl font-normal group-hover:underline">
                            {resource.title}
                          </h2>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                          <span>
                            Rate: <strong className="text-ink">{resource.creditCostPerHour === 0 ? "Free" : `${resource.creditCostPerHour} cr/h`}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Weekly Cap: <strong className="text-ink">{resource.fairUse.weeklyCapHours}h</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Prerequisites: <strong className="text-ink">{resource.requirements.length}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Sparkline & Heatmap Trigger */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-bone/60 border border-line/60 rounded-editorial p-3.5">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-ink-muted font-medium">7-Day Trend</span>
                          <span className="font-mono font-bold text-terracotta">
                            {util.utilizationRate}%
                          </span>
                        </div>
                        <Sparkline data={util.sparkline} width={130} height={32} />
                        <span className="text-[10px] text-ink-muted block">
                          {util.idleHoursRecovered}h idle recovered
                        </span>
                      </div>

                      <div className="border-l border-line/70 pl-3 hidden sm:block">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedHeatmapResource(resource)}
                          leftIcon={<BarChart3 className="w-3.5 h-3.5 text-terracotta" />}
                          className="text-xs min-h-[36px]"
                        >
                          Hourly Heatmap
                        </Button>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                      <div className="flex items-center gap-2">
                        {/* Managers Trigger */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedManagerResource(resource)}
                          leftIcon={<Users className="w-3.5 h-3.5 text-sage" />}
                          className="text-xs border border-line min-h-[36px]"
                        >
                          <span>Managers</span>
                          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-bone text-[10px] font-mono">
                            {managers.length}
                          </span>
                        </Button>

                        {/* Edit Button */}
                        <Link href={`/owner/resources/${resource.id}/edit`}>
                          <Button variant="outline" size="sm" className="text-xs min-h-[36px]">
                            Edit Listing
                          </Button>
                        </Link>
                      </div>

                      {/* Status Toggle Button */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {resource.status === "listed" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateResourceStatus(resource.id, "paused")}
                            className="text-[11px] text-ink-muted hover:text-warning min-h-[32px] px-2"
                            title="Temporarily pause bookings"
                          >
                            <PauseCircle className="w-3.5 h-3.5 mr-1" />
                            Pause Booking
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateResourceStatus(resource.id, "listed")}
                            className="text-[11px] text-success hover:bg-success/10 min-h-[32px] px-2"
                            title="Activate listings"
                          >
                            <PlayCircle className="w-3.5 h-3.5 mr-1" />
                            Set Active
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Heatmap Modal */}
        {selectedHeatmapResource && (
          <Dialog
            isOpen={Boolean(selectedHeatmapResource)}
            onClose={() => setSelectedHeatmapResource(null)}
            title={`${selectedHeatmapResource.title} — Utilisation`}
            description="Hourly demand density profile and idle-hour recovery metrics."
          >
            <div className="pt-2">
              <UtilisationHeatmap
                data={getUtilisation(selectedHeatmapResource.id)}
                resourceTitle={selectedHeatmapResource.title}
              />
            </div>
          </Dialog>
        )}

        {/* Manager Invites Dialog */}
        {selectedManagerResource && (
          <ManagerInviteDialog
            isOpen={Boolean(selectedManagerResource)}
            onClose={() => setSelectedManagerResource(null)}
            resourceId={selectedManagerResource.id}
            resourceTitle={selectedManagerResource.title}
          />
        )}
      </div>
    </AppShell>
  );
}

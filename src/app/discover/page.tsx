"use client";

import * as React from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Compass,
  Map,
  List,
  Sparkles,
  ArrowUpDown,
  Search,
  RotateCcw,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { NaturalSearchBar } from "@/components/discover/NaturalSearchBar";
import { FilterRail, type FilterState } from "@/components/discover/FilterRail";
import { ResourceCard } from "@/components/discover/ResourceCard";
import { CampusMap } from "@/components/discover/CampusMap";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  searchCampusResources,
  parseNaturalLanguageQuery,
  computeEligibility,
  type UserCredentialSnapshot,
} from "@/lib/resources/service";
import { CAMPUS_RESOURCES } from "@/lib/resources/data";
import { cn } from "@/lib/utils";

const INITIAL_FILTERS: FilterState = {
  category: "all",
  building: "all",
  requiresTraining: "all",
  supervision: "all",
  creditCost: "all",
  onlyEligible: false,
};

export default function DiscoverPage() {
  const { user, credentials } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = React.useState<"best_match" | "soonest" | "lowest_credits">("best_match");
  const [viewMode, setViewMode] = React.useState<"list" | "map">("list");
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Compute active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.building !== "all") count++;
    if (filters.requiresTraining !== "all") count++;
    if (filters.supervision !== "all") count++;
    if (filters.creditCost !== "all") count++;
    if (filters.onlyEligible) count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [filters, searchQuery]);

  // Map user credentials to snapshot for eligibility check
  const userCredSnapshots: UserCredentialSnapshot[] = React.useMemo(() => {
    return (credentials || []).map((c) => ({
      requirementLabel: c.requirementLabel,
      status: c.status,
    }));
  }, [credentials]);

  // Natural language query interpretation
  const parsedNL = React.useMemo(() => {
    return parseNaturalLanguageQuery(searchQuery);
  }, [searchQuery]);

  // Filter & Search Results
  const filteredResources = React.useMemo(() => {
    return searchCampusResources(
      {
        query: searchQuery,
        category: filters.category,
        building: filters.building,
        requiresTraining: filters.requiresTraining,
        supervision: filters.supervision,
        creditCost: filters.creditCost,
        onlyEligible: filters.onlyEligible,
        sort: sortBy,
      },
      userCredSnapshots
    );
  }, [searchQuery, filters, sortBy, userCredSnapshots]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilters(INITIAL_FILTERS);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Editorial Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge status="active" showDot={false}>
                Eastbrook Campus Registry
              </Badge>
              <span className="text-mono-label text-ink-muted">
                {CAMPUS_RESOURCES.length} Precision Facilities
              </span>
            </div>
            <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
              Discover Campus Resources
            </h1>
            <p className="text-small text-ink-muted leading-relaxed">
              Explore specialized fabrication tools, precision testbenches, acoustic studios, and cinema kits across all collegiate quadrangles.
            </p>
          </div>

          {/* View Mode Toggle: List vs Map */}
          <div className="flex items-center gap-2 bg-bone border border-line rounded-editorial p-1 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer",
                viewMode === "map"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <Map className="w-3.5 h-3.5 text-terracotta" />
              <span>Campus Map</span>
            </button>
          </div>
        </div>

        {/* Natural Language Search Bar */}
        <NaturalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          intentSummary={parsedNL.intentSummary}
        />

        {/* Main Content Layout (Desktop Left Rail + Results) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================== */}
          {/* DESKTOP FILTER RAIL (3 COLS)                             */}
          {/* ======================================================== */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-surface border border-line rounded-editorial p-5 shadow-xs">
            <FilterRail
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              activeCount={activeFilterCount}
            />
          </div>

          {/* ======================================================== */}
          {/* RESULTS COLUMN (9 COLS)                                 */}
          {/* ======================================================== */}
          <div className="lg:col-span-9 space-y-6">
            {/* Control Bar: Mobile Filter Button & Sort Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 border border-line rounded-editorial text-xs">
              {/* Mobile Filter Sheet Trigger */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-2 bg-bone hover:bg-surface border border-line rounded-editorial font-medium text-ink flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-terracotta" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-terracotta text-surface text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <span className="text-ink font-medium">
                  Showing <strong>{filteredResources.length}</strong> available resources
                </span>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-ink-muted text-[11px] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort resources"
                  className="h-8 px-2.5 bg-bone border border-line rounded-md text-xs text-ink font-medium focus:outline-none focus:border-terracotta cursor-pointer"
                >
                  <option value="best_match">Best Match</option>
                  <option value="soonest">Soonest Available</option>
                  <option value="lowest_credits">Lowest Credits / Free</option>
                </select>
              </div>
            </div>

            {/* Map View Display */}
            {viewMode === "map" && (
              <div className="space-y-6">
                <CampusMap
                  resources={filteredResources}
                  userCredentials={userCredSnapshots}
                />
              </div>
            )}

            {/* List / Grid View Display */}
            {viewMode === "list" && (
              <>
                {filteredResources.length === 0 ? (
                  <EmptyState
                    title="No resources matched your criteria"
                    description="Try relaxing your category or location filters, or rephrase your natural-language search request."
                    action={
                      <Button variant="accent" onClick={handleResetFilters}>
                        Reset All Filters
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredResources.map((res) => {
                      const elig = computeEligibility(res, userCredSnapshots);
                      return (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          eligibility={elig}
                          isLoggedIn={Boolean(user)}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <Sheet
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Campus Resources"
        description="Refine by category, prerequisites, building, or eligibility"
      >
        <div className="pt-2 pb-6 space-y-6">
          <FilterRail
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            activeCount={activeFilterCount}
          />
          <Button
            variant="accent"
            size="lg"
            className="w-full justify-center"
            onClick={() => setMobileFilterOpen(false)}
          >
            Show {filteredResources.length} Results
          </Button>
        </div>
      </Sheet>
    </AppShell>
  );
}

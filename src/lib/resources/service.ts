import { CAMPUS_RESOURCES, type CampusResource } from "./data";
import { type ResourceCategory } from "@/lib/supabase/types";

export interface UserCredentialSnapshot {
  requirementLabel: string;
  status: "pending" | "verified" | "rejected" | "expired";
}

export interface EligibilityResult {
  isEligible: boolean;
  hasPending: boolean;
  missingCount: number;
  missingLabels: string[];
  verifiedLabels: string[];
  primaryChipLabel: string;
}

export interface SearchFilters {
  query?: string;
  category?: ResourceCategory | "all";
  building?: string | "all";
  requiresTraining?: "all" | "yes" | "no";
  supervision?: "all" | "unsupervised" | "supervised";
  creditCost?: "all" | "free" | "under_10";
  onlyEligible?: boolean;
  sort?: "best_match" | "soonest" | "lowest_credits";
}

/**
 * Natural language search parser that interprets intent from phrases like:
 * "I need a camera for a short film on Saturday"
 * "laser cutter for my capstone"
 * "quiet room for recording podcast"
 */
export function parseNaturalLanguageQuery(rawInput: string): {
  normalizedQuery: string;
  inferredCategory?: ResourceCategory;
  inferredDay?: string;
  inferredFree?: boolean;
  intentSummary?: string;
} {
  const text = rawInput.trim().toLowerCase();
  if (!text) return { normalizedQuery: "" };

  let inferredCategory: ResourceCategory | undefined;
  let inferredDay: string | undefined;
  let inferredFree: boolean | undefined;
  const intents: string[] = [];

  // 1. Detect Category Intents
  if (
    text.includes("camera") ||
    text.includes("film") ||
    text.includes("video") ||
    text.includes("shoot") ||
    text.includes("cinema") ||
    text.includes("photo")
  ) {
    inferredCategory = "device";
    intents.push("Media capture devices");
  } else if (
    text.includes("room") ||
    text.includes("studio") ||
    text.includes("podcast") ||
    text.includes("space") ||
    text.includes("booth") ||
    text.includes("audio")
  ) {
    inferredCategory = "space";
    intents.push("Acoustic studio rooms");
  } else if (
    text.includes("laser") ||
    text.includes("cnc") ||
    text.includes("mill") ||
    text.includes("router") ||
    text.includes("cut")
  ) {
    inferredCategory = "equipment";
    intents.push("Machining & fabrication equipment");
  } else if (
    text.includes("3d print") ||
    text.includes("printer") ||
    text.includes("prusa") ||
    text.includes("scope") ||
    text.includes("oscilloscope") ||
    text.includes("electronics")
  ) {
    inferredCategory = "device";
    intents.push("Prototyping & electronics instruments");
  }

  // 2. Detect Schedule Intents
  if (text.includes("saturday") || text.includes("sat")) {
    inferredDay = "Sat";
    intents.push("Saturday availability");
  } else if (text.includes("sunday") || text.includes("sun")) {
    inferredDay = "Sun";
    intents.push("Sunday availability");
  } else if (text.includes("weekend")) {
    inferredDay = "Sat";
    intents.push("Weekend availability");
  } else if (text.includes("today")) {
    inferredDay = "Wed"; // Baseline seed day
    intents.push("Immediate slots today");
  } else if (text.includes("tomorrow")) {
    inferredDay = "Thu";
    intents.push("Tomorrow slots");
  }

  // 3. Detect Free Cost Intents
  if (text.includes("free") || text.includes("zero cost") || text.includes("no credit")) {
    inferredFree = true;
    intents.push("No credit cost ($0)");
  }

  return {
    normalizedQuery: text,
    inferredCategory,
    inferredDay,
    inferredFree,
    intentSummary: intents.length > 0 ? intents.join(" · ") : undefined,
  };
}

/**
 * Computes exact eligibility by cross-referencing resource requirements
 * against a user's verified credentials.
 */
export function computeEligibility(
  resource: CampusResource,
  userCredentials: UserCredentialSnapshot[] = []
): EligibilityResult {
  if (resource.requirements.length === 0) {
    return {
      isEligible: true,
      hasPending: false,
      missingCount: 0,
      missingLabels: [],
      verifiedLabels: [],
      primaryChipLabel: "No Prerequisite Required",
    };
  }

  const verifiedLabels: string[] = [];
  const missingLabels: string[] = [];
  let hasPending = false;

  for (const req of resource.requirements) {
    const matchingCred = userCredentials.find(
      (c) => c.requirementLabel.toLowerCase() === req.label.toLowerCase()
    );

    if (matchingCred && matchingCred.status === "verified") {
      verifiedLabels.push(req.label);
    } else if (matchingCred && matchingCred.status === "pending") {
      hasPending = true;
      missingLabels.push(req.label);
    } else {
      missingLabels.push(req.label);
    }
  }

  const isEligible = missingLabels.length === 0;

  let primaryChipLabel = "You're Eligible";
  if (!isEligible) {
    if (hasPending) {
      primaryChipLabel = `Pending Review: ${missingLabels[0]}`;
    } else {
      primaryChipLabel = `Needs: ${missingLabels[0]}`;
    }
  }

  return {
    isEligible,
    hasPending,
    missingCount: missingLabels.length,
    missingLabels,
    verifiedLabels,
    primaryChipLabel,
  };
}

/**
 * Filters and searches resources based on search term, filters, and user credentials.
 */
export function searchCampusResources(
  filters: SearchFilters,
  userCredentials: UserCredentialSnapshot[] = []
): CampusResource[] {
  const {
    query = "",
    category = "all",
    building = "all",
    requiresTraining = "all",
    supervision = "all",
    creditCost = "all",
    onlyEligible = false,
    sort = "best_match",
  } = filters;

  const parsed = parseNaturalLanguageQuery(query);
  const searchWords = parsed.normalizedQuery
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["the", "for", "and", "need", "with"].includes(w));

  const filtered = CAMPUS_RESOURCES.filter((res) => {
    // 1. Text Search (title, description, location, category, specs, rules)
    if (searchWords.length > 0) {
      const corpus = [
        res.title,
        res.description,
        res.locationText,
        res.building,
        res.category,
        res.categoryLabel,
        ...res.usageRules,
        ...res.specs.map((s) => `${s.label} ${s.value}`),
      ]
        .join(" ")
        .toLowerCase();

      const matchesAny = searchWords.some((word) => corpus.includes(word));
      if (!matchesAny) return false;
    }

    // 2. Category Filter (explicit or inferred if explicit is all)
    const activeCategory =
      category !== "all" ? category : parsed.inferredCategory;
    if (activeCategory && res.category !== activeCategory) {
      return false;
    }

    // 3. Building Filter
    if (building !== "all" && res.building !== building) {
      return false;
    }

    // 4. Requires Training Filter
    if (requiresTraining === "yes" && res.requirements.length === 0) {
      return false;
    }
    if (requiresTraining === "no" && res.requirements.length > 0) {
      return false;
    }

    // 5. Supervision Filter
    if (supervision === "supervised" && !res.requiresSupervision) {
      return false;
    }
    if (supervision === "unsupervised" && res.requiresSupervision) {
      return false;
    }

    // 6. Credit Cost Filter
    if ((creditCost === "free" || parsed.inferredFree) && res.creditCostPerHour > 0) {
      return false;
    }
    if (creditCost === "under_10" && res.creditCostPerHour >= 10) {
      return false;
    }

    // 7. Eligibility Filter
    if (onlyEligible) {
      const elig = computeEligibility(res, userCredentials);
      if (!elig.isEligible) return false;
    }

    return true;
  });

  // Sorting
  return filtered.sort((a, b) => {
    if (sort === "lowest_credits") {
      return a.creditCostPerHour - b.creditCostPerHour;
    }
    if (sort === "soonest") {
      // Soonest available slots prioritize today over tomorrow
      const aToday = a.nextAvailableSlot.toLowerCase().includes("today") ? 0 : 1;
      const bToday = b.nextAvailableSlot.toLowerCase().includes("today") ? 0 : 1;
      return aToday - bToday;
    }
    // Default best match
    return 0;
  });
}


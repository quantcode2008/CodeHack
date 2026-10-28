"use client";

import * as React from "react";
import { CAMPUS_RESOURCES, type CampusResource, type AvailabilitySlot, type ResourceRequirementItem, type FairUsePolicy } from "@/lib/resources/data";
import { type ResourceCategory } from "@/lib/supabase/types";
import {
  type ResourceManager,
  type ResourceUtilisationData,
  type AdminMetrics,
  type FairUseFlaggedUser,
  type OrgVerificationItem,
  type OwnerResourceStatus,
  type ScopedPermissions,
} from "@/lib/owner/types";
import {
  SEED_RESOURCE_MANAGERS,
  SEED_FAIR_USE_FLAGS,
  SEED_ADMIN_METRICS,
  SEED_ORG_VERIFICATIONS,
  getResourceUtilisation,
} from "@/lib/owner/metrics";
import { useAuth } from "@/context/AuthContext";
import { useAudit } from "@/context/AuditContext";
import { useNotifications } from "@/context/NotificationContext";
import { toast } from "sonner";

export interface ResourceDraftData {
  id?: string;
  title: string;
  category: CampusResource["category"];
  categoryLabel: string;
  description: string;
  assetTag: string;
  department: string;
  building: string;
  room: string;
  locationText: string;
  photos: string[];
  capacity: number;
  requiresSupervision: boolean;
  supervisionNote?: string;
  depositAmount: number;
  creditCostPerHour: number;
  maxBookingHours: number;
  minNoticeHours: number;
  usageRules: string[];
  specs: { label: string; value: string }[];
  accessInstructions: string;
  fairUse: FairUsePolicy;
  requirements: ResourceRequirementItem[];
  weeklySchedule: AvailabilitySlot[];
  status: OwnerResourceStatus;
  savedAt: string;
}

interface OwnerResourceContextType {
  resources: CampusResource[];
  myResources: CampusResource[];
  getResource: (idOrSlug: string) => CampusResource | undefined;
  createResource: (resourceData: Omit<CampusResource, "id" | "slug" | "owner">) => Promise<CampusResource>;
  updateResource: (id: string, updates: Partial<CampusResource>) => Promise<CampusResource>;
  updateResourceStatus: (id: string, newStatus: OwnerResourceStatus, reason?: string) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  
  // Managers
  managers: ResourceManager[];
  getManagersByResource: (resourceId: string) => ResourceManager[];
  inviteManager: (
    resourceId: string,
    data: { name: string; email: string; roleTitle: string; permissions: ScopedPermissions }
  ) => Promise<ResourceManager>;
  updateManagerPermissions: (managerId: string, permissions: ScopedPermissions) => Promise<void>;
  revokeManager: (managerId: string) => Promise<void>;

  // Analytics & Heatmap
  getUtilisation: (resourceId: string) => ResourceUtilisationData;
  adminMetrics: AdminMetrics;
  
  // Fair-Use Governance
  fairUseFlags: FairUseFlaggedUser[];
  dismissFairUseFlag: (flagId: string) => void;
  applyFairUseAction: (flagId: string, actionNote: string) => Promise<void>;

  // Org Verifications
  orgVerifications: OrgVerificationItem[];
  verifyOrganization: (orgId: string) => Promise<void>;

  // Draft Autosave
  saveDraft: (data: Partial<ResourceDraftData>) => void;
  loadDraft: () => ResourceDraftData | null;
  clearDraft: () => void;
  lastDraftSavedAt: string | null;
}

const DRAFT_STORAGE_KEY = "commons_owner_resource_draft";

const OwnerResourceContext = React.createContext<OwnerResourceContextType | null>(null);

export function OwnerResourceProvider({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();
  const { logAudit } = useAudit();
  const { sendNotification } = useNotifications();

  const [resources, setResources] = React.useState<CampusResource[]>(CAMPUS_RESOURCES);
  const [managers, setManagers] = React.useState<ResourceManager[]>(SEED_RESOURCE_MANAGERS);
  const [fairUseFlags, setFairUseFlags] = React.useState<FairUseFlaggedUser[]>(SEED_FAIR_USE_FLAGS);
  const [orgVerifications, setOrgVerifications] = React.useState<OrgVerificationItem[]>(SEED_ORG_VERIFICATIONS);
  const [lastDraftSavedAt, setLastDraftSavedAt] = React.useState<string | null>(null);

  // Compute resources owned by user (for demonstration, owners see resources matching their affiliation or all default listings)
  const myResources = React.useMemo(() => {
    if (role === "admin") return resources;
    // By default, match resources where owner name/id matches or show first 5
    return resources.slice(0, 5);
  }, [resources, role]);

  const getResource = React.useCallback(
    (idOrSlug: string) => {
      return resources.find((r) => r.id === idOrSlug || r.slug === idOrSlug);
    },
    [resources]
  );

  // Create new resource
  const createResource = React.useCallback(
    async (resourceData: Omit<CampusResource, "id" | "slug" | "owner">) => {
      const id = `res-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
      const slug = resourceData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const newResource: CampusResource = {
        ...resourceData,
        id,
        slug,
        owner: {
          id: user?.id || "own-001",
          name: user?.fullName || "Dr. Marcus Vance",
          title: "Facility Custodian & Principal",
          department: user?.affiliation || "College of Engineering",
          avatarUrl: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
          verified: true,
          responseTime: "under 2 hours",
        },
      };

      setResources((prev) => [newResource, ...prev]);

      // Atomic Audit Log
      await logAudit({
        entityType: "resource",
        entityId: id,
        entityTitle: newResource.title,
        action: "RESOURCE_REGISTERED",
        actionLabel: "Resource Registered & Cataloged",
        actorId: user?.id || "usr-anon",
        actorName: user?.fullName || "Facility Custodian",
        actorRole: (user?.role as any) || "owner",
        reason: "New collegiate asset registered with fair-use and access prerequisites.",
        before: undefined,
        after: {
          title: newResource.title,
          category: newResource.category,
          building: newResource.building,
          status: newResource.status,
          weeklyCapHours: newResource.fairUse.weeklyCapHours,
        },
      });

      // Clear draft upon successful creation
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setLastDraftSavedAt(null);

      toast.success("Resource Published Successfully", {
        description: `${newResource.title} is now active and discoverable on campus.`,
      });

      return newResource;
    },
    [user, logAudit]
  );

  // Update existing resource
  const updateResource = React.useCallback(
    async (id: string, updates: Partial<CampusResource>) => {
      let updatedResource: CampusResource | undefined;

      setResources((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            updatedResource = { ...item, ...updates };
            return updatedResource;
          }
          return item;
        })
      );

      if (updatedResource) {
        await logAudit({
          entityType: "resource",
          entityId: id,
          entityTitle: updatedResource.title,
          action: "RESOURCE_CONFIG_UPDATED",
          actionLabel: "Resource Configurations Updated",
          actorId: user?.id || "usr-anon",
          actorName: user?.fullName || "Facility Custodian",
          actorRole: (user?.role as any) || "owner",
          reason: "Resource specifications, rules, or fair-use policies modified by custodian.",
          before: undefined,
          after: updates as Record<string, unknown>,
        });

        toast.success("Listing Updated", {
          description: "Changes have been saved and applied to campus catalog.",
        });

        return updatedResource;
      }

      throw new Error(`Resource ${id} not found.`);
    },
    [user, logAudit]
  );

  // Toggle/Update status
  const updateResourceStatus = React.useCallback(
    async (id: string, newStatus: OwnerResourceStatus, reason?: string) => {
      const target = resources.find((r) => r.id === id);
      if (!target) return;

      const previousStatus = target.status;
      const validDbStatus = (newStatus === "maintenance" || newStatus === "archived") ? "paused" : newStatus;

      setResources((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: validDbStatus } : item))
      );

      await logAudit({
        entityType: "resource",
        entityId: id,
        entityTitle: target.title,
        action: "RESOURCE_STATUS_CHANGED",
        actionLabel: "Resource Status Transitioned",
        actorId: user?.id || "usr-anon",
        actorName: user?.fullName || "Facility Custodian",
        actorRole: (user?.role as any) || "owner",
        reason: reason || `Custodian changed operational status from ${previousStatus} to ${newStatus}.`,
        before: { status: previousStatus },
        after: { status: newStatus },
      });

      toast.success("Status Updated", {
        description: `${target.title} is now set to ${newStatus.toUpperCase()}.`,
      });
    },
    [resources, user, logAudit]
  );

  // Delete/Archive resource
  const deleteResource = React.useCallback(
    async (id: string) => {
      const target = resources.find((r) => r.id === id);
      if (!target) return;

      setResources((prev) => prev.filter((r) => r.id !== id));

      await logAudit({
        entityType: "resource",
        entityId: id,
        entityTitle: target.title,
        action: "RESOURCE_ARCHIVED",
        actionLabel: "Resource Delisted & Archived",
        actorId: user?.id || "usr-anon",
        actorName: user?.fullName || "Facility Custodian",
        actorRole: (user?.role as any) || "owner",
        reason: "Resource removed from active collegiate catalog.",
        before: { title: target.title, status: target.status },
        after: { archived: true },
      });

      toast.info("Resource Archived", {
        description: `${target.title} has been delisted from the student registry.`,
      });
    },
    [resources, user, logAudit]
  );

  // Managers
  const getManagersByResource = React.useCallback(
    (resourceId: string) => {
      return managers.filter((m) => m.resourceId === resourceId);
    },
    [managers]
  );

  const inviteManager = React.useCallback(
    async (
      resourceId: string,
      data: { name: string; email: string; roleTitle: string; permissions: ScopedPermissions }
    ) => {
      const targetResource = resources.find((r) => r.id === resourceId);
      const newManager: ResourceManager = {
        id: `mgr-${Date.now().toString(36)}`,
        resourceId,
        name: data.name,
        email: data.email,
        roleTitle: data.roleTitle,
        status: "active",
        invitedAt: new Date().toISOString(),
        permissions: data.permissions,
      };

      setManagers((prev) => [newManager, ...prev]);

      await logAudit({
        entityType: "resource",
        entityId: resourceId,
        entityTitle: targetResource?.title || "Campus Asset",
        action: "MANAGER_PERMISSIONS_GRANTED",
        actionLabel: "Manager Permissions Delegated",
        actorId: user?.id || "usr-anon",
        actorName: user?.fullName || "Owner Custodian",
        actorRole: "owner",
        reason: `Delegated operational permissions to ${data.name} (${data.roleTitle}).`,
        before: undefined,
        after: {
          managerEmail: data.email,
          permissions: data.permissions as unknown as Record<string, unknown>,
        },
      });

      sendNotification({
        userId: user?.id || "usr-current",
        type: "credential_reviewed",
        title: "Manager Delegate Assigned",
        body: `${data.name} was granted scoped access to manage ${targetResource?.title || "resource"}.`,
        link: "/owner/resources",
      });

      toast.success("Manager Invited", {
        description: `${data.name} has been added with scoped authority.`,
      });

      return newManager;
    },
    [resources, user, logAudit, sendNotification]
  );

  const updateManagerPermissions = React.useCallback(
    async (managerId: string, permissions: ScopedPermissions) => {
      let targetManager: ResourceManager | undefined;

      setManagers((prev) =>
        prev.map((m) => {
          if (m.id === managerId) {
            targetManager = { ...m, permissions };
            return targetManager;
          }
          return m;
        })
      );

      if (targetManager) {
        await logAudit({
          entityType: "resource",
          entityId: targetManager.resourceId,
          entityTitle: "Campus Asset",
          action: "MANAGER_PERMISSIONS_SCOPED",
          actionLabel: "Manager Scope Adjusted",
          actorId: user?.id || "usr-anon",
          actorName: user?.fullName || "Owner Custodian",
          actorRole: "owner",
          reason: `Modified access permissions for manager ${targetManager.name}.`,
          before: undefined,
          after: { permissions: permissions as unknown as Record<string, unknown> },
        });

        toast.success("Permissions Updated", {
          description: `Updated authority for ${targetManager.name}.`,
        });
      }
    },
    [user, logAudit]
  );

  const revokeManager = React.useCallback(
    async (managerId: string) => {
      const targetManager = managers.find((m) => m.id === managerId);
      if (!targetManager) return;

      setManagers((prev) => prev.filter((m) => m.id !== managerId));

      await logAudit({
        entityType: "resource",
        entityId: targetManager.resourceId,
        entityTitle: "Campus Asset",
        action: "MANAGER_PERMISSIONS_REVOKED",
        actionLabel: "Manager Delegation Revoked",
        actorId: user?.id || "usr-anon",
        actorName: user?.fullName || "Owner Custodian",
        actorRole: "owner",
        reason: `Revoked operational delegation for ${targetManager.name}.`,
        before: { managerName: targetManager.name, email: targetManager.email },
        after: { status: "revoked" },
      });

      toast.info("Manager Access Revoked", {
        description: `${targetManager.name} no longer has custody over this asset.`,
      });
    },
    [managers, user, logAudit]
  );

  // Analytics & Heatmap
  const getUtilisation = React.useCallback((resourceId: string) => {
    return getResourceUtilisation(resourceId);
  }, []);

  // Fair-Use flags
  const dismissFairUseFlag = React.useCallback((flagId: string) => {
    setFairUseFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, status: "dismissed" } : f))
    );
    toast.info("Fair-Use Flag Dismissed", {
      description: "No further administrative action applied.",
    });
  }, []);

  const applyFairUseAction = React.useCallback(
    async (flagId: string, actionNote: string) => {
      const targetFlag = fairUseFlags.find((f) => f.id === flagId);
      if (!targetFlag) return;

      setFairUseFlags((prev) =>
        prev.map((f) => (f.id === flagId ? { ...f, status: "reviewed" } : f))
      );

      await logAudit({
        entityType: "booking",
        entityId: targetFlag.userId,
        entityTitle: targetFlag.userName,
        action: "FAIR_USE_POLICY_ENFORCED",
        actionLabel: "Fair-Use Countermeasure Enforced",
        actorId: user?.id || "usr-admin",
        actorName: user?.fullName || "Campus Administrator",
        actorRole: "admin",
        reason: `${targetFlag.recommendedRuleAction}: ${actionNote}`,
        before: { flagType: targetFlag.flagType, metricDetail: targetFlag.metricDetail },
        after: { action: targetFlag.recommendedRuleAction, status: "reviewed" },
      });

      toast.success("Fair-Use Action Applied", {
        description: `${targetFlag.recommendedRuleAction} enforced for ${targetFlag.userName}.`,
      });
    },
    [fairUseFlags, user, logAudit]
  );

  // Org verification
  const verifyOrganization = React.useCallback(
    async (orgId: string) => {
      const target = orgVerifications.find((o) => o.id === orgId);
      if (!target) return;

      setOrgVerifications((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, status: "verified" } : o))
      );

      await logAudit({
        entityType: "credential",
        entityId: orgId,
        entityTitle: target.orgName,
        action: "ORGANIZATION_ACCREDITED",
        actionLabel: "Departmental Entity Accredited",
        actorId: user?.id || "usr-admin",
        actorName: user?.fullName || "Campus Administrator",
        actorRole: "admin",
        reason: "Departmental charter and collegiate safety protocols verified.",
        before: { status: "pending" },
        after: { status: "verified" },
      });

      toast.success("Organization Verified", {
        description: `${target.orgName} has been officially accredited.`,
      });
    },
    [orgVerifications, user, logAudit]
  );

  const loadDraft = React.useCallback((): ResourceDraftData | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  // Draft Autosave
  const saveDraft = React.useCallback((draftData: Partial<ResourceDraftData>) => {
    if (typeof window === "undefined") return;
    const now = new Date().toISOString();
    const existing = loadDraft() || {};
    const merged = { ...existing, ...draftData, savedAt: now };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(merged));
      setLastDraftSavedAt(now);
    } catch {
      // LocalStorage error fallback
    }
  }, [loadDraft]);

  const clearDraft = React.useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setLastDraftSavedAt(null);
  }, []);

  return (
    <OwnerResourceContext.Provider
      value={{
        resources,
        myResources,
        getResource,
        createResource,
        updateResource,
        updateResourceStatus,
        deleteResource,
        managers,
        getManagersByResource,
        inviteManager,
        updateManagerPermissions,
        revokeManager,
        getUtilisation,
        adminMetrics: SEED_ADMIN_METRICS,
        fairUseFlags,
        dismissFairUseFlag,
        applyFairUseAction,
        orgVerifications,
        verifyOrganization,
        saveDraft,
        loadDraft,
        clearDraft,
        lastDraftSavedAt,
      }}
    >
      {children}
    </OwnerResourceContext.Provider>
  );
}

export function useOwnerResources() {
  const context = React.useContext(OwnerResourceContext);
  if (!context) {
    throw new Error("useOwnerResources must be used within an OwnerResourceProvider");
  }
  return context;
}

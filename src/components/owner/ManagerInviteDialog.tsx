"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useOwnerResources } from "@/context/OwnerResourceContext";
import { type ScopedPermissions } from "@/lib/owner/types";
import { UserPlus, Shield, UserCheck, Trash2, Mail, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManagerInviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  resourceTitle: string;
}

export function ManagerInviteDialog({
  isOpen,
  onClose,
  resourceId,
  resourceTitle,
}: ManagerInviteDialogProps) {
  const { getManagersByResource, inviteManager, updateManagerPermissions, revokeManager } =
    useOwnerResources();

  const managers = getManagersByResource(resourceId);

  const [isAdding, setIsAdding] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [roleTitle, setRoleTitle] = React.useState("Lab Monitor");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Scoped permissions form state
  const [permissions, setPermissions] = React.useState<ScopedPermissions>({
    canApproveBookings: true,
    canVerifyHandoff: true,
    canModifySchedule: false,
    canManageIncidents: false,
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    await inviteManager(resourceId, {
      name,
      email,
      roleTitle,
      permissions,
    });

    setIsSubmitting(false);
    setName("");
    setEmail("");
    setRoleTitle("Lab Monitor");
    setIsAdding(false);
  };

  const togglePermission = (key: keyof ScopedPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delegate Custody & Managers"
      description={`Grant scoped authority to departmental coordinators for ${resourceTitle}.`}
    >
      <div className="space-y-6 pt-2">
        {/* Active Managers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-mono-label uppercase text-ink-muted font-bold">
              Active Custodians & Monitors ({managers.length})
            </span>
            {!isAdding && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                onClick={() => setIsAdding(true)}
              >
                Add Manager
              </Button>
            )}
          </div>

          {managers.length === 0 ? (
            <div className="p-4 bg-bone/50 border border-line border-dashed rounded-editorial text-center space-y-1">
              <Shield className="w-6 h-6 text-ink-muted mx-auto" />
              <p className="text-xs text-ink-muted">
                No delegated managers assigned yet. As the primary custodian, you retain all approval and inspection rights.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {managers.map((mgr) => (
                <div
                  key={mgr.id}
                  className="p-3 bg-surface border border-line rounded-editorial flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-ink font-semibold">{mgr.name}</strong>
                      <Badge status={mgr.status === "active" ? "approved" : "pending"}>
                        {mgr.status === "active" ? "Active" : "Invite Pending"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                      <span>{mgr.roleTitle}</span>
                      <span>•</span>
                      <span>{mgr.email}</span>
                    </div>

                    {/* Scoped Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {mgr.permissions.canApproveBookings && (
                        <span className="px-1.5 py-0.5 rounded bg-sage/15 text-sage font-mono text-[9px]">
                          Approve Bookings
                        </span>
                      )}
                      {mgr.permissions.canVerifyHandoff && (
                        <span className="px-1.5 py-0.5 rounded bg-sage/15 text-sage font-mono text-[9px]">
                          Condition Check-in
                        </span>
                      )}
                      {mgr.permissions.canModifySchedule && (
                        <span className="px-1.5 py-0.5 rounded bg-terracotta/15 text-terracotta font-mono text-[9px]">
                          Modify Schedule
                        </span>
                      )}
                      {mgr.permissions.canManageIncidents && (
                        <span className="px-1.5 py-0.5 rounded bg-danger/15 text-danger font-mono text-[9px]">
                          Resolve Incidents
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => revokeManager(mgr.id)}
                    className="p-1.5 text-ink-muted hover:text-danger rounded hover:bg-danger/10 transition-colors self-end sm:self-center cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label={`Revoke access for ${mgr.name}`}
                    title="Revoke manager access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite Form */}
        {isAdding && (
          <form
            onSubmit={handleInvite}
            className="p-4 bg-bone border border-line rounded-editorial space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="font-semibold text-xs text-ink flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-terracotta" />
                <span>Invite New Campus Manager</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-ink-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-ink block">Full Name</label>
                <Input
                  required
                  placeholder="e.g. Julian Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-ink block">Campus Email</label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. j.vance@eastbrook.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-medium text-ink block">Role / Designation</label>
              <Input
                required
                placeholder="e.g. Graduate Lab Monitor, Workshop Proctor"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>

            {/* Scoped Authority Toggles */}
            <div className="space-y-2 pt-1 text-xs">
              <label className="text-mono-label uppercase text-ink-muted font-bold block">
                Scoped Permissions
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="p-2.5 bg-surface border border-line rounded-editorial flex items-start gap-2.5 cursor-pointer hover:border-terracotta/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.canApproveBookings}
                    onChange={() => togglePermission("canApproveBookings")}
                    className="mt-0.5 rounded text-terracotta focus:ring-terracotta"
                  />
                  <div>
                    <span className="font-semibold text-ink block">Approve Reservations</span>
                    <span className="text-[10px] text-ink-muted block leading-tight">
                      Review purpose declarations and grant/reject slots.
                    </span>
                  </div>
                </label>

                <label className="p-2.5 bg-surface border border-line rounded-editorial flex items-start gap-2.5 cursor-pointer hover:border-terracotta/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.canVerifyHandoff}
                    onChange={() => togglePermission("canVerifyHandoff")}
                    className="mt-0.5 rounded text-terracotta focus:ring-terracotta"
                  />
                  <div>
                    <span className="font-semibold text-ink block">Handoff Sign-off</span>
                    <span className="text-[10px] text-ink-muted block leading-tight">
                      Inspect check-in and return condition photos.
                    </span>
                  </div>
                </label>

                <label className="p-2.5 bg-surface border border-line rounded-editorial flex items-start gap-2.5 cursor-pointer hover:border-terracotta/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.canModifySchedule}
                    onChange={() => togglePermission("canModifySchedule")}
                    className="mt-0.5 rounded text-terracotta focus:ring-terracotta"
                  />
                  <div>
                    <span className="font-semibold text-ink block">Modify Availability</span>
                    <span className="text-[10px] text-ink-muted block leading-tight">
                      Add maintenance blackout periods and adjust hours.
                    </span>
                  </div>
                </label>

                <label className="p-2.5 bg-surface border border-line rounded-editorial flex items-start gap-2.5 cursor-pointer hover:border-terracotta/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.canManageIncidents}
                    onChange={() => togglePermission("canManageIncidents")}
                    className="mt-0.5 rounded text-terracotta focus:ring-terracotta"
                  />
                  <div>
                    <span className="font-semibold text-ink block">Resolve Incidents</span>
                    <span className="text-[10px] text-ink-muted block leading-tight">
                      Adjudicate condition discrepancies and peer reports.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<Mail className="w-3.5 h-3.5" />}
              >
                Send Manager Invitation
              </Button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-line">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export type AuditActorRole = "student" | "owner" | "manager" | "admin" | "system";

export type AuditEntityType = "booking" | "resource" | "incident" | "credential" | "profile";

export interface AuditRecord {
  id: string;
  actorId?: string;
  actorName: string;
  actorRole: AuditActorRole;
  actorAvatar?: string;
  action: string;
  actionLabel: string;
  entityType: AuditEntityType;
  entityId: string;
  entityTitle: string;
  bookingId?: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  hash: string;
  createdAt: string;
}


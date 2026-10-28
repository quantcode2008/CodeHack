export type NotificationCategory =
  | "request_received"
  | "approved"
  | "rejected"
  | "waitlisted_promoted"
  | "reminder_24h"
  | "reminder_1h"
  | "cancellation"
  | "overdue"
  | "incident_update"
  | "credential_reviewed";

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationCategory;
  title: string;
  body: string;
  link: string; // Deep link e.g. /bookings/bk-epilog-001 or /incidents/inc-001
  read: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: {
    resourceTitle?: string;
    bookingId?: string;
    incidentId?: string;
    actorName?: string;
    hoursUsed?: number;
    urgency?: "normal" | "urgent" | "critical";
  };
}


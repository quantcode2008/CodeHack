"use client";

import * as React from "react";
import { toast } from "sonner";
import { type NotificationRecord, type NotificationCategory } from "@/lib/notifications/types";
import { sendNotificationEmail } from "@/lib/notifications/email";

interface NotificationContextType {
  notifications: NotificationRecord[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  sendNotification: (data: {
    userId?: string;
    type: NotificationCategory;
    title: string;
    body: string;
    link: string;
    metadata?: NotificationRecord["metadata"];
  }) => NotificationRecord;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "notif-001",
    userId: "11111111-1111-1111-1111-111111111111",
    type: "overdue",
    title: "Session Overdue — Return Checklist Required",
    body: "Your booking for Sony FX3 Full-Frame Cinema Camera Kit has passed its scheduled end time. Please complete the return checklist to maintain clean collegiate standing.",
    link: "/bookings/bk-active-sony-002/return",
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    metadata: {
      resourceTitle: "Sony FX3 Full-Frame Cinema Camera Kit",
      bookingId: "bk-active-sony-002",
      urgency: "urgent",
    },
  },
  {
    id: "notif-002",
    userId: "11111111-1111-1111-1111-111111111111",
    type: "waitlisted_promoted",
    title: "Spot Opened! Promoted to Confirmed",
    body: "The primary holder released their Friday slot for Epilog Fusion Pro 48. Your waitlist position #2 has been automatically promoted to Confirmed.",
    link: "/bookings/bk-epilog-001",
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    metadata: {
      resourceTitle: "Epilog Fusion Pro 48 Laser Cutter",
      bookingId: "bk-epilog-001",
      urgency: "normal",
    },
  },
  {
    id: "notif-003",
    userId: "11111111-1111-1111-1111-111111111111",
    type: "reminder_1h",
    title: "Session Starting in 1 Hour",
    body: "Your scheduled fabrication window on Epilog Laser Cutter starts in 60 minutes. Reminder: Eye protection OD5+ is mandatory.",
    link: "/bookings/bk-epilog-001",
    read: false,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    metadata: {
      resourceTitle: "Epilog Fusion Pro 48 Laser Cutter",
      bookingId: "bk-epilog-001",
      urgency: "normal",
    },
  },
  {
    id: "notif-004",
    userId: "11111111-1111-1111-1111-111111111111",
    type: "incident_update",
    title: "Incident #inc-001 Moved to Under Review",
    body: "Dr. Kavitha Rao has flagged the delay report on Sony FX3 for departmental review. A written explanation was recorded.",
    link: "/incidents/inc-001",
    read: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    metadata: {
      incidentId: "inc-001",
      actorName: "Dr. Kavitha Rao",
      urgency: "normal",
    },
  },
  {
    id: "notif-005",
    userId: "11111111-1111-1111-1111-111111111111",
    type: "credential_reviewed",
    title: "Laser Safety Qualification Verified",
    body: "Your submitted EHS training certificate has been verified by the Lab Safety Officer. Equipment booking privileges are unlocked.",
    link: "/profile",
    read: true,
    readAt: new Date(Date.now() - 43200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    metadata: {
      urgency: "normal",
    },
  },
  {
    id: "notif-006",
    userId: "22222222-2222-2222-2222-222222222222",
    type: "request_received",
    title: "New Booking Application Received",
    body: "Aanya Patel submitted a 2-hour reservation request for Epilog Fusion Pro 48 for ME-401 Capstone.",
    link: "/queue",
    read: true,
    readAt: new Date(Date.now() - 50000000).toISOString(),
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    metadata: {
      resourceTitle: "Epilog Fusion Pro 48 Laser Cutter",
      actorName: "Aanya Patel",
      urgency: "normal",
    },
  },
  {
    id: "notif-007",
    userId: "11111111-1111-1111-1111-111111111111",
    type: "reminder_24h",
    title: "Booking Tomorrow in 24 Hours",
    body: "You have a confirmed reservation for RF & Mixed-Signal Electronics Testbench tomorrow at 14:00.",
    link: "/bookings/bk-rf-004",
    read: true,
    readAt: new Date(Date.now() - 60000000).toISOString(),
    createdAt: new Date(Date.now() - 100000000).toISOString(),
    metadata: {
      resourceTitle: "RF & Mixed-Signal Electronics Testbench",
      bookingId: "bk-rf-004",
      urgency: "normal",
    },
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<NotificationRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("commons_notifications_ledger_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("commons_notifications_ledger_v2", JSON.stringify(notifications));
    }
  }, [notifications]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info("Alert dismissed");
  };

  const sendNotification = (data: {
    userId?: string;
    type: NotificationCategory;
    title: string;
    body: string;
    link: string;
    metadata?: NotificationRecord["metadata"];
  }): NotificationRecord => {
    const newNotif: NotificationRecord = {
      id: `notif-${Date.now()}`,
      userId: data.userId || "11111111-1111-1111-1111-111111111111",
      type: data.type,
      title: data.title,
      body: data.body,
      link: data.link,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: data.metadata,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Dispatch optional structured email non-blockingly
    sendNotificationEmail(newNotif).catch(() => {
      // non-blocking
    });

    return newNotif;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}


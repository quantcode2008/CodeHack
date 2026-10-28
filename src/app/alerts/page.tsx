"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scale,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Check,
  Trash2,
  Inbox,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useNotifications } from "@/context/NotificationContext";
import { type NotificationRecord, type NotificationCategory } from "@/lib/notifications/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type AlertFilter = "all" | "bookings" | "waitlist" | "reminders" | "incidents" | "credentials";

export default function AlertsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  const [activeFilter, setActiveFilter] = React.useState<AlertFilter>("all");

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "bookings") {
        return (
          n.type === "request_received" ||
          n.type === "approved" ||
          n.type === "rejected" ||
          n.type === "cancellation"
        );
      }
      if (activeFilter === "waitlist") return n.type === "waitlisted_promoted";
      if (activeFilter === "reminders") return n.type === "reminder_24h" || n.type === "reminder_1h";
      if (activeFilter === "incidents") return n.type === "overdue" || n.type === "incident_update";
      if (activeFilter === "credentials") return n.type === "credential_reviewed";
      return true;
    });
  }, [notifications, activeFilter]);

  const unreadList = React.useMemo(
    () => filteredNotifications.filter((n) => !n.read),
    [filteredNotifications]
  );
  const readList = React.useMemo(
    () => filteredNotifications.filter((n) => n.read),
    [filteredNotifications]
  );

  const getAlertIcon = (type: NotificationCategory) => {
    switch (type) {
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      case "incident_update":
        return <ShieldAlert className="w-4 h-4 text-danger" />;
      case "waitlisted_promoted":
        return <Scale className="w-4 h-4 text-terracotta" />;
      case "approved":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "rejected":
        return <RotateCcw className="w-4 h-4 text-danger" />;
      case "reminder_1h":
      case "reminder_24h":
        return <Clock className="w-4 h-4 text-[#B07A1E]" />;
      case "credential_reviewed":
        return <ShieldCheck className="w-4 h-4 text-sage-dark" />;
      default:
        return <Bell className="w-4 h-4 text-terracotta" />;
    }
  };

  const getAlertTag = (type: NotificationCategory) => {
    switch (type) {
      case "overdue":
        return { label: "Overdue Alert", style: "bg-[#FCF2F1] text-danger border-[#ECCAC7]" };
      case "waitlisted_promoted":
        return { label: "Waitlist Promoted", style: "bg-[#FDF5F2] text-terracotta border-[#F1D0C4]" };
      case "approved":
        return { label: "Approved", style: "bg-[#F0F5F1] text-[#2F5338] border-[#C6DBCB]" };
      case "rejected":
        return { label: "Declined", style: "bg-[#FCF2F1] text-danger border-[#ECCAC7]" };
      case "reminder_1h":
        return { label: "1h Notice", style: "bg-[#FDF9EE] text-[#8C6114] border-[#EAD9B8]" };
      case "reminder_24h":
        return { label: "24h Notice", style: "bg-[#FDF9EE] text-[#8C6114] border-[#EAD9B8]" };
      case "incident_update":
        return { label: "Incident Update", style: "bg-bone text-ink border-line" };
      case "credential_reviewed":
        return { label: "Credential Verified", style: "bg-[#F4F6F2] text-sage-dark border-[#D4DDCF]" };
      default:
        return { label: "System", style: "bg-bone text-ink-muted border-line" };
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-ink pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-mono-label uppercase text-ink-muted font-bold tracking-wider">
                Notification Feed
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-terracotta text-surface">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <h1 className="font-display text-display-lg text-ink font-normal leading-tight">
              Activity & Dispatch Alerts
            </h1>
            <p className="text-small text-ink-muted leading-relaxed max-w-xl">
              Real-time reservation milestones, automated reminders, waitlist promotions, and custodian review determinations with deep links.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Check className="w-3.5 h-3.5" />}
              onClick={markAllAsRead}
              className="min-h-[44px]"
            >
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filter Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-bone border border-line rounded-editorial text-xs">
          {[
            { id: "all", label: "All Alerts" },
            { id: "bookings", label: "Bookings & Decisions" },
            { id: "waitlist", label: "Waitlist Promotions" },
            { id: "reminders", label: "Reminders" },
            { id: "incidents", label: "Overdue & Incidents" },
            { id: "credentials", label: "Credentials" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as AlertFilter)}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap min-h-[36px]",
                activeFilter === tab.id
                  ? "bg-surface text-ink font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* UNREAD NOTIFICATIONS GROUP                               */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <span className="text-mono-label uppercase text-ink-muted font-bold tracking-wider">
              Unread Alerts ({unreadList.length})
            </span>
            <span className="text-[11px] font-mono text-terracotta font-semibold">Active Attention</span>
          </div>

          {unreadList.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-line rounded-editorial text-xs text-ink-muted space-y-1">
              <CheckCircle2 className="w-6 h-6 text-success/60 mx-auto" />
              <p className="font-semibold text-ink">You are completely caught up</p>
              <p>No unread alerts in this category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unreadList.map((item) => {
                const tag = getAlertTag(item.type);
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-editorial bg-surface border-2 border-terracotta/40 shadow-xs space-y-3 transition-all hover:border-terracotta relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-bone border border-line">
                          {getAlertIcon(item.type)}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border",
                            tag.style
                          )}
                        >
                          {tag.label}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                      </div>

                      <span className="font-mono text-xs text-ink-muted">
                        {new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })} ·{" "}
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display text-lg text-ink font-normal leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-ink-muted leading-relaxed max-w-2xl">
                        {item.body}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/50">
                      <Link
                        href={item.link}
                        onClick={() => markAsRead(item.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-terracotta font-semibold hover:underline"
                      >
                        <span>Deep link to record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className="px-2.5 py-1 text-xs text-ink-muted hover:text-ink font-medium rounded hover:bg-bone transition-colors min-h-[32px]"
                        >
                          Mark as read
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNotification(item.id)}
                          className="p-1.5 text-ink-muted hover:text-danger rounded hover:bg-bone transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* READ NOTIFICATIONS GROUP                                 */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <span className="text-mono-label uppercase text-ink-muted font-bold tracking-wider">
              Read Archive ({readList.length})
            </span>
            <span className="text-[11px] font-mono text-ink-muted">Historical Log</span>
          </div>

          {readList.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted italic">
              No historical read alerts in this view.
            </div>
          ) : (
            <div className="space-y-2.5">
              {readList.map((item) => {
                const tag = getAlertTag(item.type);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-editorial bg-surface/70 border border-line/80 space-y-2 text-xs transition-colors hover:bg-surface"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(item.type)}
                        <span className="font-semibold text-ink">{item.title}</span>
                        <span
                          className={cn(
                            "px-2 py-0.2 rounded text-[10px] font-mono uppercase font-bold border",
                            tag.style
                          )}
                        >
                          {tag.label}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-ink-muted">
                        {new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <p className="text-ink-muted text-xs leading-relaxed max-w-2xl">{item.body}</p>

                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={item.link}
                        className="text-[11px] text-terracotta hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Open related record</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteNotification(item.id)}
                        className="text-ink-muted hover:text-danger p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}


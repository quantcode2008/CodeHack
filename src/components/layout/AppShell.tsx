"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  CalendarClock,
  Bell,
  User,
  Inbox,
  Layers,
  Scroll,
  Palette,
  ShieldCheck,
  ChevronDown,
  Building2,
  Sparkles,
  Smartphone,
  AlertOctagon,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import { useRole, type UserRole } from "@/context/RoleContext";
import { useNotifications } from "@/context/NotificationContext";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { VerificationBanner } from "@/components/common/VerificationBanner";
import { GuidedDemoWidget } from "@/components/common/GuidedDemoWidget";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { role, setRole, roleTitle } = useRole();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = React.useState(false);

  // Define role-specific navigation arrays
  const userNavItems = [
    { href: "/explore", label: "Discover", icon: Compass },
    { href: "/bookings", label: "Bookings", icon: CalendarClock },
    {
      href: "/alerts",
      label: "Alerts",
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
    { href: "/incidents", label: "Incidents", icon: AlertOctagon },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const ownerNavItems = [
    { href: "/owner/resources", label: "My Listings", icon: Layers },
    { href: "/queue", label: "Queue", icon: Inbox, badge: "3" },
    { href: "/incidents", label: "Incidents", icon: AlertOctagon },
    { href: "/admin/credentials", label: "Credentials", icon: ShieldCheck, badge: "2" },
    { href: "/admin/audit", label: "Audit Ledger", icon: Scroll },
    {
      href: "/alerts",
      label: "Alerts",
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const managerNavItems = [
    { href: "/owner/resources", label: "Listings", icon: Layers },
    { href: "/queue", label: "Queue", icon: Inbox, badge: "3" },
    { href: "/incidents", label: "Incidents", icon: AlertOctagon },
    { href: "/admin/credentials", label: "Credentials", icon: ShieldCheck, badge: "2" },
    { href: "/admin/audit", label: "Audit Ledger", icon: Scroll },
    {
      href: "/alerts",
      label: "Alerts",
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/owner/resources", label: "All Listings", icon: Layers },
    { href: "/queue", label: "Queue", icon: Inbox, badge: "3" },
    { href: "/incidents", label: "Incidents", icon: AlertOctagon },
    { href: "/admin/credentials", label: "Credentials", icon: ShieldCheck, badge: "2" },
    { href: "/admin/audit", label: "Audit Ledger", icon: Scroll },
    {
      href: "/alerts",
      label: "Alerts",
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const activeNavItems =
    role === "admin"
      ? adminNavItems
      : role === "owner"
      ? ownerNavItems
      : role === "manager"
      ? managerNavItems
      : userNavItems;

  const roleOptions: { role: UserRole; title: string; desc: string }[] = [
    {
      role: "student",
      title: "Student / User",
      desc: "Discover & request campus labs, rooms, and devices",
    },
    {
      role: "owner",
      title: "Resource Owner",
      desc: "Manage lab listings, review & approve reservation requests",
    },
    {
      role: "manager",
      title: "Lab Manager",
      desc: "Conduct physical check-ins & condition sign-offs",
    },
    {
      role: "admin",
      title: "Campus Admin",
      desc: "Full audit tracking, dispute oversight & governance",
    },
  ];

  const recentAlerts = notifications.slice(0, 4);

  return (
    <div className="min-h-screen bg-bone text-ink flex flex-col lg:flex-row">
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR (≥1024px)                                */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-line bg-surface p-6 sticky top-0 h-screen shrink-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-line/70">
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 rounded-editorial bg-ink text-surface flex items-center justify-center font-display text-h3 group-hover:bg-terracotta transition-colors">
                C
              </div>
              <div>
                <span className="font-display text-h3 text-ink tracking-tight block leading-tight">
                  Commons
                </span>
                <span className="text-mono-label text-ink-muted">
                  Northfield Campus
                </span>
              </div>
            </Link>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="p-2 rounded-full hover:bg-bone text-ink-muted hover:text-ink transition-colors relative min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                aria-label="Toggle notifications dropdown"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-terracotta ring-2 ring-surface animate-pulse" />
                )}
              </button>

              {/* Quick Alerts Dropdown */}
              {notifMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 z-50 bg-surface border border-line rounded-editorial shadow-editorial-raised p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-line/60 pb-2">
                    <span className="text-mono-label uppercase text-ink-muted font-bold">
                      Recent Alerts ({unreadCount} new)
                    </span>
                    <Link
                      href="/alerts"
                      onClick={() => setNotifMenuOpen(false)}
                      className="text-[11px] text-terracotta hover:underline font-semibold"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {recentAlerts.map((a) => (
                      <Link
                        key={a.id}
                        href={a.link}
                        onClick={() => {
                          markAsRead(a.id);
                          setNotifMenuOpen(false);
                        }}
                        className={cn(
                          "block p-2 rounded-md border text-xs transition-colors",
                          !a.read
                            ? "bg-[#FCF2F1]/30 border-terracotta/30 text-ink"
                            : "bg-surface border-line text-ink-muted hover:bg-bone"
                        )}
                      >
                        <strong className="block text-ink text-[11px] truncate">
                          {a.title}
                        </strong>
                        <span className="text-[10px] text-ink-muted line-clamp-1">
                          {a.body}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between p-3 bg-bone/70 hover:bg-bone border border-line rounded-editorial text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Building2 className="w-4 h-4 text-terracotta shrink-0" />
                <div className="truncate">
                  <span className="block text-mono-label uppercase text-ink-muted leading-tight">
                    Active View
                  </span>
                  <span className="text-small font-semibold text-ink truncate block">
                    {roleTitle}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-ink-muted transition-transform",
                  roleMenuOpen && "rotate-180"
                )}
              />
            </button>

            {roleMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-surface border border-line rounded-editorial shadow-editorial-raised p-2 space-y-1">
                <div className="px-2 py-1 text-mono-label text-ink-muted uppercase border-b border-line/60 mb-1">
                  Switch Persona (Demo)
                </div>
                {roleOptions.map((opt) => (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => {
                      setRole(opt.role);
                      setRoleMenuOpen(false);
                    }}
                    className={cn(
                      "w-full text-left p-2.5 rounded-md text-small transition-colors flex flex-col cursor-pointer",
                      role === opt.role
                        ? "bg-bone text-terracotta font-semibold"
                        : "hover:bg-bone/60 text-ink"
                    )}
                  >
                    <span>{opt.title}</span>
                    <span className="text-xs text-ink-muted font-normal">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Role Navigation */}
          <nav className="space-y-1" aria-label="Desktop Sidebar Navigation">
            <div className="px-2 py-1 text-mono-label uppercase text-ink-muted tracking-wider">
              Navigation
            </div>
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-editorial text-body font-medium transition-all group min-h-[44px]",
                    isActive
                      ? "bg-bone text-ink font-semibold border border-line/80 shadow-sm"
                      : "text-ink-muted hover:text-ink hover:bg-bone/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-terracotta" : "text-ink-muted group-hover:text-ink"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge status="active" showDot={false}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Audit & Development Links */}
          <div className="pt-4 border-t border-line/60 space-y-1">
            <div className="px-2 py-1 text-mono-label uppercase text-ink-muted tracking-wider">
              Governance & Dev
            </div>
            <Link
              href="/admin/audit"
              className={cn(
                "flex items-center gap-3 px-3.5 py-2 rounded-editorial text-small font-medium transition-colors min-h-[44px]",
                pathname === "/admin/audit" || pathname === "/audit"
                  ? "bg-bone text-ink font-semibold"
                  : "text-ink-muted hover:text-ink hover:bg-bone/50"
              )}
            >
              <Scroll className="w-4 h-4 text-ink-muted" />
              <span>Audit Ledger</span>
            </Link>
            <Link
              href="/incidents"
              className={cn(
                "flex items-center gap-3 px-3.5 py-2 rounded-editorial text-small font-medium transition-colors min-h-[44px]",
                pathname === "/incidents"
                  ? "bg-bone text-ink font-semibold"
                  : "text-ink-muted hover:text-ink hover:bg-bone/50"
              )}
            >
              <AlertOctagon className="w-4 h-4 text-danger" />
              <span>Incidents & Delays</span>
            </Link>
            <Link
              href="/design"
              className={cn(
                "flex items-center gap-3 px-3.5 py-2 rounded-editorial text-small font-medium transition-colors min-h-[44px]",
                pathname === "/design"
                  ? "bg-terracotta/10 text-terracotta font-semibold"
                  : "text-ink-muted hover:text-terracotta hover:bg-bone/50"
              )}
            >
              <Palette className="w-4 h-4 text-terracotta" />
              <span>Design System Lab</span>
            </Link>
            <Link
              href="/emulator"
              className={cn(
                "flex items-center gap-3 px-3.5 py-2 rounded-editorial text-small font-medium transition-colors min-h-[44px]",
                pathname === "/emulator"
                  ? "bg-ink text-surface font-semibold"
                  : "text-ink-muted hover:text-ink hover:bg-bone/50"
              )}
            >
              <Smartphone className="w-4 h-4 text-ink-muted" />
              <span>Phone Emulator</span>
            </Link>
          </div>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="pt-4 border-t border-line/70 flex items-center justify-between">
          <Avatar
            name="Aanya Patel"
            subtitle="Mechanical Engineering"
            verified
            size="md"
          />
          <Link
            href="/profile"
            aria-label="User Profile"
            className="p-2 text-ink-muted hover:text-ink rounded-full hover:bg-bone transition-colors"
          >
            <Sparkles className="w-4 h-4 text-terracotta" />
          </Link>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE TOP BAR (<1024px)                                 */}
      {/* ======================================================== */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-ink text-surface flex items-center justify-center font-display text-small">
            C
          </div>
          <span className="font-display text-h3 text-ink leading-none">
            Commons
          </span>
        </Link>

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-2">
          {/* Realtime Alert Bell */}
          <Link
            href="/alerts"
            className="p-2 text-ink-muted hover:text-ink relative min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-ink-muted" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-terracotta animate-ping" />
            )}
          </Link>

          {/* Role Pill */}
          <button
            type="button"
            onClick={() => setRole(role === "student" ? "owner" : "student")}
            className="px-2.5 py-1 bg-bone border border-line rounded-full text-mono-label font-medium text-ink flex items-center gap-1.5 min-h-[36px]"
          >
            <span className="w-2 h-2 rounded-full bg-terracotta" />
            <span className="capitalize">{role}</span>
          </button>

          <Link
            href="/emulator"
            aria-label="Phone Emulator"
            className="p-2 text-ink-muted hover:text-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Open Phone Emulator"
          >
            <Smartphone className="w-5 h-5 text-terracotta" />
          </Link>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTENT CANVAS                                      */}
      {/* ======================================================== */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-8 flex flex-col">
        <VerificationBanner />
        <div className="flex-1">{children}</div>
      </main>

      {/* ======================================================== */}
      {/* MOBILE BOTTOM TAB BAR (<1024px)                          */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line px-2 py-1 shadow-editorial-sheet"
      >
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {activeNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-1 min-h-[52px] rounded-lg transition-colors relative",
                  isActive ? "text-terracotta font-semibold" : "text-ink-muted hover:text-ink"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-terracotta text-surface text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-[55px]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta absolute bottom-1" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Guided Demo Tour for Judges */}
      <GuidedDemoWidget />
    </div>
  );
}

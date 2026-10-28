"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Compass, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/70 bg-bone/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Left: Brand Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-editorial bg-ink text-surface flex items-center justify-center font-display text-2xl group-hover:bg-terracotta transition-colors shadow-xs">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl text-ink tracking-tight block leading-none">
              Commons
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Eastbrook Institute
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-8 text-small font-medium text-ink-muted"
        >
          <a
            href="#how-it-works"
            className="hover:text-ink transition-colors py-2"
          >
            How it works
          </a>
          <a
            href="#fair-access"
            className="hover:text-ink transition-colors py-2"
          >
            Fair access
          </a>
          <a
            href="#for-owners"
            className="hover:text-ink transition-colors py-2"
          >
            For owners
          </a>
          <a
            href="#accountability"
            className="hover:text-ink transition-colors py-2"
          >
            Accountability
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium text-ink">
              Sign in
            </Button>
          </Link>
          <Link href="/explore">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse resources
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label="Open mobile menu"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-editorial border border-line bg-surface text-ink hover:bg-bone transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Sheet */}
      <Sheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Navigation"
        description="Eastbrook Resource Registry"
      >
        <div className="flex flex-col space-y-6 pt-2 pb-6">
          <nav className="flex flex-col space-y-3 text-body font-medium">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-editorial hover:bg-bone border border-transparent hover:border-line transition-colors flex items-center justify-between"
            >
              <span>How it works</span>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </a>
            <a
              href="#fair-access"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-editorial hover:bg-bone border border-transparent hover:border-line transition-colors flex items-center justify-between"
            >
              <span>Fair access by design</span>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </a>
            <a
              href="#for-owners"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-editorial hover:bg-bone border border-transparent hover:border-line transition-colors flex items-center justify-between"
            >
              <span>For lab owners</span>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </a>
            <a
              href="#accountability"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-editorial hover:bg-bone border border-transparent hover:border-line transition-colors flex items-center justify-between"
            >
              <span>Accountability & audit trail</span>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </a>
          </nav>

          <div className="pt-4 border-t border-line space-y-3">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="accent" size="lg" className="w-full justify-center">
                Browse campus resources
              </Button>
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="outline" size="lg" className="w-full justify-center">
                Sign in to your account
              </Button>
            </Link>
          </div>
        </div>
      </Sheet>
    </header>
  );
}


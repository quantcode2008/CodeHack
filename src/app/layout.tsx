import type { Metadata } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";
import { RoleProvider } from "@/context/RoleContext";
import { AuditProvider } from "@/context/AuditContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { IncidentProvider } from "@/context/IncidentContext";
import { BookingProvider } from "@/context/BookingContext";
import { OwnerResourceProvider } from "@/context/OwnerResourceContext";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Commons — Trusted Campus Resource Sharing",
  description:
    "An editorial, calm, and high-trust collegiate resource-sharing platform for campus labs, studios, equipment, and precision tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-bone text-ink antialiased min-h-screen selection:bg-terracotta selection:text-surface"
      >
        <RoleProvider>
          <AuditProvider>
            <NotificationProvider>
              <IncidentProvider>
                <BookingProvider>
                  <OwnerResourceProvider>
                    {children}
                    <ToastContainer />
                  </OwnerResourceProvider>
                </BookingProvider>
              </IncidentProvider>
            </NotificationProvider>
          </AuditProvider>
        </RoleProvider>
      </body>
    </html>
  );
}


"use client";
import { ReactNode } from "react";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import ClientLayout from "@/app/(main)/core/ClientLayout";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  // Use client-side state for layout preferences
  const contentLayout = usePreferencesStore((s) => s.contentLayout ?? "centered");
  const variant = usePreferencesStore((s) => s.variant ?? "inset");
  const collapsible = usePreferencesStore((s) => s.collapsible ?? "icon");
  const navbarStyle = usePreferencesStore((s) => s.navbarStyle ?? "scroll");
  const defaultOpen = false;

  const layoutPreferences = {
    contentLayout,
    variant,
    collapsible,
    navbarStyle,
  };

  return (
    <ClientLayout defaultOpen={defaultOpen} layoutPreferences={layoutPreferences}>
      {children}
    </ClientLayout>
  );
}

"use client";
import { createContext, useContext, useRef, useEffect } from "react";
import { getPreferenceCookie, setPreferenceCookie } from "@/lib/preference-cookies";
import { useStore, type StoreApi } from "zustand";
import { createPreferencesStore, PreferencesState } from "./preferences-store";

const PreferencesStoreContext = createContext<StoreApi<PreferencesState> | null>(null);

export const PreferencesStoreProvider = ({
  children,
  themeMode,
  themePreset,
}: {
  children: React.ReactNode;
  themeMode: PreferencesState["themeMode"];
  themePreset: PreferencesState["themePreset"];
}) => {
  const storeRef = useRef<StoreApi<PreferencesState> | null>(null);

  // Initialize store with props/defaults (safe for SSR)
  if (!storeRef.current) {
    storeRef.current = createPreferencesStore({
      themeMode,
      themePreset,
      contentLayout: "centered",
      variant: "inset",
      collapsible: "icon",
      navbarStyle: "scroll",
    });
  }

  // Hydrate from cookies on client only
  useEffect(() => {
    if (!storeRef.current) return;
    // Only run on client
    const cookieHydrated = {
      themeMode: getPreferenceCookie("theme_mode"),
      themePreset: getPreferenceCookie("theme_preset"),
      contentLayout: getPreferenceCookie("content_layout"),
      variant: getPreferenceCookie("sidebar_variant"),
      collapsible: getPreferenceCookie("sidebar_collapsible"),
      navbarStyle: getPreferenceCookie("navbar_style"),
    };
    // Only update if cookie exists
    if (cookieHydrated.themeMode) storeRef.current.setState({ themeMode: cookieHydrated.themeMode as PreferencesState["themeMode"] });
    if (cookieHydrated.themePreset) storeRef.current.setState({ themePreset: cookieHydrated.themePreset as PreferencesState["themePreset"] });
    if (cookieHydrated.contentLayout) storeRef.current.setState({ contentLayout: cookieHydrated.contentLayout as any });
    if (cookieHydrated.variant) storeRef.current.setState({ variant: cookieHydrated.variant as any });
    if (cookieHydrated.collapsible) storeRef.current.setState({ collapsible: cookieHydrated.collapsible as any });
    if (cookieHydrated.navbarStyle) storeRef.current.setState({ navbarStyle: cookieHydrated.navbarStyle as any });
  }, []);

  // Sync store changes to cookies
  useEffect(() => {
    if (!storeRef.current) return;
    const unsub = storeRef.current.subscribe((state, prevState) => {
      if (state.themeMode !== prevState.themeMode) setPreferenceCookie("theme_mode", state.themeMode);
      if (state.themePreset !== prevState.themePreset) setPreferenceCookie("theme_preset", state.themePreset);
      if (state.contentLayout !== prevState.contentLayout) setPreferenceCookie("content_layout", state.contentLayout);
      if (state.variant !== prevState.variant) setPreferenceCookie("sidebar_variant", state.variant);
      if (state.collapsible !== prevState.collapsible) setPreferenceCookie("sidebar_collapsible", state.collapsible);
      if (state.navbarStyle !== prevState.navbarStyle) setPreferenceCookie("navbar_style", state.navbarStyle);
    });
    return () => unsub();
  }, []);

  return <PreferencesStoreContext.Provider value={storeRef.current}>{children}</PreferencesStoreContext.Provider>;
};

export const usePreferencesStore = <T,>(selector: (state: PreferencesState) => T): T => {
  const store = useContext(PreferencesStoreContext);
  if (!store) throw new Error("Missing PreferencesStoreProvider");
  return useStore(store, selector);
};

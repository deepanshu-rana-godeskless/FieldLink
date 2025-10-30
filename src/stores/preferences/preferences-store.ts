
import { createStore } from "zustand/vanilla";
import type { ThemeMode, ThemePreset } from "@/types/preferences/theme";
import type { ContentLayout, SidebarVariant, SidebarCollapsible, NavbarStyle } from "@/types/preferences/layout";

export type PreferencesState = {
  themeMode: ThemeMode;
  themePreset: ThemePreset;
  setThemeMode: (mode: ThemeMode) => void;
  setThemePreset: (preset: ThemePreset) => void;

  contentLayout: ContentLayout;
  variant: SidebarVariant;
  collapsible: SidebarCollapsible;
  navbarStyle: NavbarStyle;
  setContentLayout: (layout: ContentLayout) => void;
  setVariant: (variant: SidebarVariant) => void;
  setCollapsible: (collapsible: SidebarCollapsible) => void;
  setNavbarStyle: (style: NavbarStyle) => void;
};


export const createPreferencesStore = (init?: Partial<PreferencesState>) =>
  createStore<PreferencesState>()((set) => ({
    themeMode: init?.themeMode ?? "light",
    themePreset: init?.themePreset ?? "default",
    setThemeMode: (mode) => set({ themeMode: mode }),
    setThemePreset: (preset) => set({ themePreset: preset }),

    contentLayout: init?.contentLayout ?? "centered",
    variant: init?.variant ?? "inset",
    collapsible: init?.collapsible ?? "icon",
    navbarStyle: init?.navbarStyle ?? "scroll",
    setContentLayout: (layout) => set({ contentLayout: layout }),
    setVariant: (variant) => set({ variant }),
    setCollapsible: (collapsible) => set({ collapsible }),
    setNavbarStyle: (style) => set({ navbarStyle: style }),
  }));

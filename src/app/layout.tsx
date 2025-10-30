
"use client";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/config/app-config";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Use static defaults for themeMode and themePreset for static export compatibility
  const themeMode = "light";
  const themePreset = "default";

  return (
    <html
      lang="en"
      className={""}
      data-theme-preset={themePreset}
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-screen antialiased`}>
        <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
          {children}
          <Toaster />
        </PreferencesStoreProvider>
      </body>
    </html>
  );
}

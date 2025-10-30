"use client";

import { AuthGuard } from "@/components/auth-guard";
import { AppSidebar } from "@/app/(main)/core/_components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { users } from "@/data/users";
import { cn } from "@/lib/utils";
import { AccountSwitcher } from "@/app/(main)/core/_components/sidebar/account-switcher";
import { LayoutControls } from "@/app/(main)/core/_components/sidebar/layout-controls";
import { SearchDialog } from "@/app/(main)/core/_components/sidebar/search-dialog";
import { ThemeSwitcher } from "@/app/(main)/core/_components/sidebar/theme-switcher";
import type { SidebarVariant, SidebarCollapsible, ContentLayout, NavbarStyle } from "@/types/preferences/layout";

interface ClientLayoutProps {
    children: React.ReactNode;
    defaultOpen: boolean;
    layoutPreferences: {
        contentLayout: ContentLayout;
        variant: SidebarVariant;
        collapsible: SidebarCollapsible;
        navbarStyle: NavbarStyle;
    };
}

export default function ClientLayout({ children, defaultOpen, layoutPreferences }: ClientLayoutProps) {
    const { contentLayout, variant, collapsible, navbarStyle } = layoutPreferences;
    return (
        <AuthGuard>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar variant={variant} collapsible={collapsible} />
                <SidebarInset
                    data-content-layout={contentLayout}
                    className={cn(
                        "data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl",
                        "max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto",
                    )}
                >
                    <header
                        data-navbar-style={navbarStyle}
                        className={cn(
                            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
                            "data-[navbar-style=sticky]:bg-background/50 data-[navbar-style=sticky]:sticky data-[navbar-style=sticky]:top-0 data-[navbar-style=sticky]:z-50 data-[navbar-style=sticky]:overflow-hidden data-[navbar-style=sticky]:rounded-t-[inherit] data-[navbar-style=sticky]:backdrop-blur-md",
                        )}
                    >
                        <div className="flex w-full items-center justify-between px-4 lg:px-6">
                            <div className="flex items-center gap-1 lg:gap-2">
                                <SidebarTrigger className="-ml-1" />
                                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                                <SearchDialog />
                            </div>
                            <div className="flex items-center gap-2">
                                <LayoutControls {...layoutPreferences} />
                                <ThemeSwitcher />
                                <AccountSwitcher users={users} />
                            </div>
                        </div>
                    </header>
                    <div className="h-full p-4 md:p-6">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    );
}

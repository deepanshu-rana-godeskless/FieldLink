"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        // Check authentication on every route change
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            console.log("🔐 AuthGuard: Route changed to", pathname, "- Token present:", !!token);

            if (!token) {
                console.log("❌ AuthGuard: No access token found, redirecting to login");
                router.push("/auth/v2/login");
                setIsAuthenticated(false);
            } else {
                console.log("✅ AuthGuard: Access token found, allowing access");
                setIsAuthenticated(true);
            }
        };

        checkAuth();
    }, [pathname, router]); // Re-run on every pathname change

    // Show loading while checking authentication
    if (isAuthenticated === null) {
        return fallback || <div className="flex items-center justify-center h-full"><Spinner className="size-8" /></div>;
    }

    // Show children only if authenticated
    return isAuthenticated ? <>{children}</> : null;
}
// Centralized API base URL resolver for client and server environments
export function getApiBaseUrl(): string {
    // TEMP: Use remote dev API for local development
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        return "https://circledev.godeskless.com/api";
    }
    // Use window.location.origin on the client
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    // Fallback for SSR: use localhost
    return "http://localhost:3000";
}

export async function logoutApi({ token, login_id }: { token: string; login_id: string }) {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/log-out/`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, login_id }),
    });
    return res.json();
}

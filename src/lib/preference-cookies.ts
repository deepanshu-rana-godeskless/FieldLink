// Utility functions for secure cookie management of user preferences
// All cookies are set with Secure, SameSite=Strict, and path=/

export function setPreferenceCookie(key: string, value: string) {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Strict; Secure`;
}

export function getPreferenceCookie(key: string): string | undefined {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [k, v] = cookie.split('=');
        if (k === key) return decodeURIComponent(v);
    }
    return undefined;
}

export function deletePreferenceCookie(key: string) {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
}

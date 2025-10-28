// Auth utility functions for managing authentication state

export const authUtils = {
    // Get token from localStorage
    getToken: () => localStorage.getItem("token"),

    // Get user data from localStorage
    getUser: () => {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => !!localStorage.getItem("token"),
};
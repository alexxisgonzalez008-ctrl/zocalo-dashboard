/**
 * Utility to get the current user ID.
 * TODO: Integrate with NextAuth or your preferred auth provider.
 */
export function getAuthSession() {
    return {
        userId: "user_dev_alex",
        isDemo: true
    };
}

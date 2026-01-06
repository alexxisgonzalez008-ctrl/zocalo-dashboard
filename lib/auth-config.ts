/**
 * Configuración de acceso para la aplicación.
 * Solo los correos electrónicos listados aquí podrán acceder al dashboard.
 */
export const AUTHORIZED_USERS: Record<string, { role: 'admin' | 'viewer' }> = {
    "alexxisgonzalez008@gmail.com": { role: "admin" },
    "entremuros.arq0@gmail.com": { role: "admin" },
};

export function isAuthorized(email: string | null | undefined): boolean {
    if (!email) return false;
    return email.toLowerCase() in AUTHORIZED_USERS;
}

export function getUserRole(email: string | null | undefined): 'admin' | 'viewer' {
    if (!email) return 'viewer';
    const normalizedEmail = email.toLowerCase();
    return AUTHORIZED_USERS[normalizedEmail]?.role || 'viewer';
}

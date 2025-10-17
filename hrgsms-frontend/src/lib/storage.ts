const TOKEN_KEY = "hrgsms_token";
const ROLE_KEY = "hrgsms_role";

export type UserRole = "Admin" | "Manager" | "Reception" | "Staff";

export function setAuth(token: string, role: UserRole) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): UserRole | null {
  return (localStorage.getItem(ROLE_KEY) as UserRole | null) ?? null;
}

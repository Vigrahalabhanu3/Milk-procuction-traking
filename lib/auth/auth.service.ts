import { User, UserRole } from "../types";
import { ApiError, requestJSON } from "../api/client";

export interface AuthSession {
  access: string;
  user: User;
  expiresAt: number;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export function loginPath(role: UserRole, expired = false): string {
  const query = new URLSearchParams();
  if (role === "admin") query.set("role", "admin");
  if (expired) query.set("reason", "expired");
  return `/login${query.size ? `?${query}` : ""}`;
}

export function dashboardPath(role: UserRole): string {
  return role === "admin" ? "/admin/dashboard" : "/farmer/dashboard";
}

export async function login(identifier: string, password: string, role: UserRole): Promise<AuthSession> {
  // Explicitly public: never send a bearer token on either login request.
  const response = await requestJSON<LoginResponse>(`/api/auth/${role}/login/`, {
    body: role === "farmer" ? { farmer_id: identifier.trim(), password } : { email: identifier.trim(), password },
  });
  if (!response || typeof response.access !== "string" || !response.access ||
      !response.user || response.user.role !== role || typeof response.user.name !== "string" ||
      !(typeof response.user.id === "number" || typeof response.user.id === "string")) {
    throw new ApiError(403, "403: This account cannot access this portal.");
  }
  // Refresh is intentionally discarded until the backend provides a refresh API.
  return { access: response.access, user: response.user, expiresAt: Date.now() + 30 * 60 * 1000 };
}

export interface RegisterFarmerInput {
  village?: string;
  name: string;
  farmer_id: string;
  password: string;
  password_confirm: string;
}

export interface RegisterFarmerResponse {
  message: string;
  user: User;
}

export function validateFarmer(input: RegisterFarmerInput): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (!input.name.trim()) errors.name = ["Enter the farmer name."];
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(input.farmer_id)) errors.farmer_id = ["Use 1–32 letters, digits, hyphens, or underscores."];
  if (!input.password) errors.password = ["Enter a password."];
  if (!input.password_confirm) errors.password_confirm = ["Confirm the password."];
  else if (input.password !== input.password_confirm) errors.password_confirm = ["Passwords must match."];
  return errors;
}

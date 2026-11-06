"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "../types";
import { ApiError, requestJSON, requestReportDownload, ReportDownload } from "../api/client";
import { AuthSession, login as serviceLogin, loginPath, RegisterFarmerInput, RegisterFarmerResponse } from "./auth.service";

import { clearSession, restoreSession, saveSession } from "./session-storage";

interface AuthContextType {
  user: User | null;
  access: string | null;
  role: UserRole | null;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (identifier: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  protectedRequest: <T>(path: string, body?: unknown, method?: "GET" | "POST", expectedStatus?: number) => Promise<T>;
  downloadReport: (path: string, fallbackFilename: string) => Promise<ReportDownload>;
  registerFarmer: (input: RegisterFarmerInput) => Promise<RegisterFarmerResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Restore tab-scoped sessions before allowing protected routes to redirect.
  const [session, setSession] = useState<AuthSession | null>(null);
  const current = useRef<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);

  const expire = useCallback((expected: AuthSession) => {
    // An older in-flight request cannot invalidate a newer login.
    if (current.current !== expected) return;
    current.current = null;
    setSession(null);
    setSessionExpired(true);
    clearSession();
    router.replace(loginPath(expected.user.role, true));
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const restored = restoreSession();
      current.current = restored;
      setSession(restored);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(() => expire(session), Math.max(0, session.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [session, expire]);

  const login = useCallback(async (identifier: string, password: string, role: UserRole) => {
    const next = await serviceLogin(identifier, password, role);
    current.current = next;
    setSession(next);
    setSessionExpired(false);
    saveSession(next);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    const role = current.current?.user.role ?? "farmer";
    clearSession();
    current.current = null;
    setSession(null);
    router.replace(loginPath(role));
  }, [router]);

  const protectedRequest = useCallback(async <T,>(path: string, body?: unknown, method: "GET" | "POST" = "POST", expectedStatus?: number): Promise<T> => {
    const active = current.current;
    if (!active) throw new ApiError(401, "401: Please sign in again.");
    if (active.expiresAt <= Date.now()) {
      expire(active);
      throw new ApiError(401, "401: Your session has expired. Please sign in again.");
    }
    return requestJSON<T>(path, { body, method, expectedStatus, access: active.access, onUnauthorized: () => expire(active) });
  }, [expire]);

  const downloadReport = useCallback(async (path: string, fallbackFilename: string) => {
    const active = current.current;
    if (!active) throw new ApiError(401, "401: Please sign in again.");
    if (active.user.role !== "admin") throw new ApiError(403, "403: Only admins can export reports.");
    if (active.expiresAt <= Date.now()) {
      expire(active);
      throw new ApiError(401, "401: Your session has expired. Please sign in again.");
    }
    return requestReportDownload(path, { access: active.access, fallbackFilename, onUnauthorized: () => expire(active) });
  }, [expire]);

  const registerFarmer = useCallback(async (input: RegisterFarmerInput) => {
    if (current.current?.user.role !== "admin") throw new ApiError(403, "403: Only admins can register farmers.");
    // Backend authorization is still required and is enforced using the admin bearer token.
    return protectedRequest<RegisterFarmerResponse>("/api/auth/register/", input);
  }, [protectedRequest]);

  return <AuthContext.Provider value={{ user: session?.user ?? null, access: session?.access ?? null,
    role: session?.user.role ?? null, isLoading, sessionExpired, login, logout, protectedRequest, downloadReport, registerFarmer }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../auth/auth-context";
import { ApiError, FieldErrors } from "../api/client";
import { UserRole } from "../types";

// Share role checks, stale-response protection, loading, and retry behavior across API views.
export function useAuthenticatedQuery<T>(path: string, role: UserRole, options: {
  enabled?: boolean; delay?: number; event?: string; errorMessage: string;
}) {
  const { role: currentRole, user, access, isLoading: restoring, protectedRequest } = useAuth();
  const { enabled = true, delay = 0, event, errorMessage } = options;
  const [revision, setRevision] = useState(0);
  const key = `${user?.id}:${path}:${revision}`;
  const [result, setResult] = useState<{key: string; data?: T; error?: string; fields?: FieldErrors} | null>(null);
  useEffect(() => {
    if (!enabled || restoring || currentRole !== role) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await protectedRequest<T>(path, undefined, "GET");
        if (!cancelled) setResult({key, data});
      } catch (error) {
        if (!cancelled) setResult({key, error: error instanceof ApiError ? error.message : errorMessage, fields: error instanceof ApiError ? error.fields : {}});
      }
    }, delay);
    const refresh = () => setRevision(value => value + 1);
    if (event) window.addEventListener(event, refresh);
    return () => { cancelled = true; window.clearTimeout(timer); if (event) window.removeEventListener(event, refresh); };
  }, [enabled, restoring, currentRole, role, path, key, protectedRequest, access, delay, event, errorMessage]);
  const current = result?.key === key && currentRole === role ? result : null;
  return {data: current?.data, error: current?.error, fields: current?.fields ?? {},
    isLoading: enabled && (restoring || (currentRole === role && !current)),
    reload: () => setRevision(value => value + 1)};
}

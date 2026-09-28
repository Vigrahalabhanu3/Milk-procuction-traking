"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, UserRole } from "../types";
import { getCurrentUser, login as mockLogin, logout as mockLogout, setCurrentUser } from "./mock-auth";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial session load
    const current = getCurrentUser();
    setUser(current);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, expectedRole?: UserRole) => {
      setIsLoading(true);
      try {
        const res = await mockLogin(email, password, expectedRole);
        if (res.success && res.user) {
          setUser(res.user);
          return { success: true };
        } else {
          return { success: false, error: res.error || "Authentication failed" };
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    mockLogout();
    setUser(null);
    router.push("/");
  }, [router]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      setCurrentUser(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

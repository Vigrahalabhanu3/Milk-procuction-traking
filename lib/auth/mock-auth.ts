import { User, UserRole } from "../types";
import { initialUsers } from "../mock/users";

const SESSION_KEY = "dairyflow_session_user";

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export function getMockCredentials() {
  return {
    adminEmail: process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@dairyflow.com",
    adminPassword: process.env.ADMIN_PASSWORD || "Admin@123",
    farmerEmail: process.env.FARMER_EMAIL || process.env.NEXT_PUBLIC_FARMER_EMAIL || "farmer@dairyflow.com",
    farmerPassword: process.env.FARMER_PASSWORD || "Farmer@123",
  };
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export async function login(email: string, password: string, expectedRole?: UserRole): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const creds = getMockCredentials();
  const normalizedEmail = email.trim().toLowerCase();

  // Check Admin
  if (normalizedEmail === creds.adminEmail.toLowerCase() && password === creds.adminPassword) {
    if (expectedRole && expectedRole !== "ADMIN") {
      return { success: false, error: "Please use the admin login portal for administrative access." };
    }
    const adminUser = initialUsers.find((u) => u.role === "ADMIN")!;
    setCurrentUser(adminUser);
    return { success: true, user: adminUser };
  }

  // Check Farmer
  if (normalizedEmail === creds.farmerEmail.toLowerCase() && password === creds.farmerPassword) {
    if (expectedRole && expectedRole !== "FARMER") {
      return { success: false, error: "Please use the farmer login portal." };
    }
    const farmerUser = initialUsers.find((u) => u.role === "FARMER")!;
    setCurrentUser(farmerUser);
    return { success: true, user: farmerUser };
  }

  // Check newly registered farmers or other users in local mock state if any
  if (typeof window !== "undefined") {
    try {
      const storedUsersRaw = localStorage.getItem("dairyflow_registered_users");
      if (storedUsersRaw) {
        const storedUsers: Array<{ user: User; pass: string }> = JSON.parse(storedUsersRaw);
        const match = storedUsers.find(
          (u) => u.user.email.toLowerCase() === normalizedEmail && u.pass === password
        );
        if (match) {
          if (expectedRole && expectedRole !== match.user.role) {
            return { success: false, error: `Invalid role login portal for ${match.user.role}.` };
          }
          setCurrentUser(match.user);
          return { success: true, user: match.user };
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    success: false,
    error: "Invalid email or password.",
  };
}

export function logout(): void {
  setCurrentUser(null);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function requireRole(expectedRole: UserRole): boolean {
  const user = getCurrentUser();
  return user?.role === expectedRole;
}

export type UserRole = "farmer" | "admin";

export interface User {
  id: number | string;
  name: string;
  email: string | null;
  farmer_id: string | null;
  role: UserRole;
}

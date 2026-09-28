export type UserRole = "FARMER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  farmerId?: string; // e.g. FARM001 for farmers
  village?: string;
  address?: string;
  joinedDate?: string;
}

export type FarmerStatus = "Active" | "Inactive" | "Pending";

export interface Farmer {
  id: string;
  farmerId: string; // FARM001
  name: string;
  email: string;
  phone: string;
  village: string;
  address: string;
  status: FarmerStatus;
  joinedDate: string;
  cattleCount: number;
  bankAccount: string;
  ifsc: string;
  milkToday: number;
  totalMilk: number;
  totalEarnings: number;
  pendingEarnings: number;
  averageFat: number;
  averageSnf: number;
  averageGrade: "A+" | "A" | "B" | "C";
  avatar?: string;
}

export type CollectionSession = "Morning" | "Evening";
export type QualityGrade = "A+" | "A" | "B" | "C" | "REJECTED";

export interface MilkCollection {
  id: string;
  collectionCode: string;
  farmerId: string; // reference to Farmer.farmerId
  farmerName: string;
  date: string; // YYYY-MM-DD
  session: CollectionSession;
  quantity: number; // liters
  fat: number; // percentage, e.g. 4.2
  snf: number; // percentage, e.g. 8.5
  clr: number; // corrected lactometer reading, e.g. 29.5
  temperature: number; // celsius, e.g. 5.5
  rate: number; // INR per liter
  amount: number; // quantity * rate
  quality: QualityGrade;
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = "PAID" | "PENDING" | "PROCESSING";

export interface Payment {
  id: string;
  paymentId: string; // PAY-2026-001
  farmerId: string;
  farmerName: string;
  date: string;
  period: string; // e.g. "16 Sep - 30 Sep 2026"
  milkQuantity: number;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  transactionRef?: string;
  paymentMethod?: "Bank Transfer" | "UPI" | "Direct Cash";
}

export interface MilkRate {
  id: string;
  rate: number; // per liter
  minFat: number;
  maxFat: number;
  effectiveDate: string;
  status: "Active" | "Historical" | "Upcoming";
  category: "Cow" | "Buffalo" | "Standard";
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  targetRole: "FARMER" | "ADMIN" | "ALL";
  targetFarmerId?: string; // if null, for all farmers or role
  isRead: boolean;
  createdAt: string;
  type: "collection" | "payment" | "quality" | "announcement" | "system";
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Draft" | "Expired";
  priority: "Normal" | "High" | "Urgent";
  author: string;
}

export interface AuditLog {
  id: string;
  date: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface AdminDashboardStats {
  totalFarmers: number;
  activeFarmers: number;
  todayMilk: number;
  monthlyMilk: number;
  todayPayout: number;
  pendingPayments: number;
  morningCollection: number;
  eveningCollection: number;
  averageFat: number;
  averageSnf: number;
}

export interface FarmerDashboardStats {
  todayMilk: number;
  morningMilk: number;
  eveningMilk: number;
  todayEarnings: number;
  pendingPayment: number;
  totalEarnings: number;
  paidAmount: number;
  averageFat: number;
  averageSnf: number;
  qualityGrade: QualityGrade;
}

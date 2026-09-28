import { User } from "../types";

export const initialUsers: User[] = [
  {
    id: "usr_admin_01",
    name: "Rajendra Prasad",
    email: process.env.ADMIN_EMAIL || "admin@dairyflow.com",
    role: "ADMIN",
    phone: "9876543200",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "usr_farmer_01",
    name: "Ramesh Kumar",
    email: process.env.FARMER_EMAIL || "farmer@dairyflow.com",
    role: "FARMER",
    farmerId: "FARM001",
    phone: "9876543210",
    village: "Green Valley",
    address: "Plot 14, Cow Shelter Road, Green Valley, Dist. Anand, Gujarat",
    joinedDate: "2024-01-15",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
];

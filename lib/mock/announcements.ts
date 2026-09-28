import { Announcement } from "../types";

export const initialAnnouncements: Announcement[] = [
  {
    id: "ann_01",
    title: "Quarterly Quality & Fat Incentive Bonus (₹1.50/L)",
    message: "Cooperative management has announced an additional incentive of ₹1.50 per liter for all farmers maintaining average milk Fat ≥ 4.2% and SNF ≥ 8.5% throughout this month.",
    startDate: "2026-09-20",
    endDate: "2026-10-15",
    status: "Active",
    priority: "High",
    author: "Dairy Operations Directorate",
  },
  {
    id: "ann_02",
    title: "Free Veterinary Health & Vaccination Camp",
    message: "District Veterinary Health Team will visit Village Chilling Center on Saturday from 8:00 AM to 1:00 PM for cattle health checkups and free FMD vaccinations.",
    startDate: "2026-09-25",
    endDate: "2026-10-05",
    status: "Active",
    priority: "Normal",
    author: "Veterinary Welfare Wing",
  },
  {
    id: "ann_03",
    title: "Direct Bank Account Linking for Subsidized Fodder",
    message: "Farmers are requested to verify their active bank IFSC and Aadhaar linkage in their profile to receive timely fodder subsidy disbursements.",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    status: "Active",
    priority: "Normal",
    author: "Finance & Accounts",
  },
];

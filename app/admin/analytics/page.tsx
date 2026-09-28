"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Award, IndianRupee, Milk, Calendar } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");

  // Production data depending on filter
  const productionDaily = [
    { label: "22 Sep", morning: 615, evening: 565, total: 1180 },
    { label: "23 Sep", morning: 630, evening: 580, total: 1210 },
    { label: "24 Sep", morning: 620, evening: 575, total: 1195 },
    { label: "25 Sep", morning: 645, evening: 590, total: 1235 },
    { label: "26 Sep", morning: 635, evening: 585, total: 1220 },
    { label: "27 Sep", morning: 648, evening: 592, total: 1240 },
    { label: "28 Sep", morning: 648, evening: 600, total: 1248 },
  ];

  const productionWeekly = [
    { label: "Week 35", morning: 4280, evening: 3950, total: 8230 },
    { label: "Week 36", morning: 4350, evening: 4020, total: 8370 },
    { label: "Week 37", morning: 4410, evening: 4080, total: 8490 },
    { label: "Week 38", morning: 4500, evening: 4150, total: 8650 },
  ];

  const productionMonthly = [
    { label: "May", morning: 17200, evening: 15600, total: 32800 },
    { label: "Jun", morning: 16900, evening: 15200, total: 32100 },
    { label: "Jul", morning: 17400, evening: 15900, total: 33300 },
    { label: "Aug", morning: 17800, evening: 16100, total: 33900 },
    { label: "Sep", morning: 17050, evening: 15430, total: 32480 },
  ];

  const activeProduction =
    timeRange === "DAILY"
      ? productionDaily
      : timeRange === "WEEKLY"
      ? productionWeekly
      : productionMonthly;

  // Quality data (Fat & SNF trend)
  const qualityTrend = [
    { label: "Day 1", fat: 4.15, snf: 8.48 },
    { label: "Day 2", fat: 4.18, snf: 8.50 },
    { label: "Day 3", fat: 4.16, snf: 8.49 },
    { label: "Day 4", fat: 4.22, snf: 8.53 },
    { label: "Day 5", fat: 4.20, snf: 8.51 },
    { label: "Day 6", fat: 4.25, snf: 8.55 },
    { label: "Day 7", fat: 4.22, snf: 8.52 },
  ];

  const gradePie = [
    { name: "Grade A+ (Premium)", value: 58, color: "#0B5D3B" },
    { name: "Grade A (Standard)", value: 28, color: "#3A8F3D" },
    { name: "Grade B (Fair)", value: 11, color: "#F4C95D" },
    { name: "Grade C / Rejected", value: 3, color: "#D9534F" },
  ];

  // Financial data
  const financialData = [
    { label: "01-15 Aug", totalPayout: 695000, paid: 695000, pending: 0 },
    { label: "16-31 Aug", totalPayout: 710000, paid: 710000, pending: 0 },
    { label: "01-15 Sep", totalPayout: 715000, paid: 715000, pending: 0 },
    { label: "16-28 Sep", totalPayout: 524160, paid: 505910, pending: 18250 },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Advanced Operations Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Deep-dive production curves, chemical quality stability, and cooperative payout flows.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#DDE8DF] self-start sm:self-auto shadow-2xs">
          {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                timeRange === r
                  ? "bg-[#0B5D3B] text-white shadow-xs"
                  : "text-[#6B756E] hover:text-[#17231D]"
              }`}
            >
              {r === "DAILY" ? "Daily" : r === "WEEKLY" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: PRODUCTION ANALYTICS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0B5D3B] uppercase tracking-wider">
          <Milk className="w-4 h-4 text-[#3A8F3D]" />
          <span>1. Procurement & Shift Production Analysis</span>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#17231D]">Intake Volume by Session</h3>
              <p className="text-xs text-[#6B756E]">Shift breakdown: Morning vs. Evening intake (Liters)</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeProduction} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EFE8" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} unit="L" />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="morning" name="Morning Shift" fill="#3A8F3D" radius={[6, 6, 0, 0]} />
                <Bar dataKey="evening" name="Evening Shift" fill="#0B5D3B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* SECTION 2: QUALITY ANALYTICS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0B5D3B] uppercase tracking-wider">
          <Award className="w-4 h-4 text-[#3A8F3D]" />
          <span>2. Quality, Fat & SNF Density Distribution</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 p-5">
            <h3 className="font-bold text-base text-[#17231D] mb-1">Fat % and SNF % Stability Trend</h3>
            <p className="text-xs text-[#6B756E] mb-4">Tested average density levels across all centers</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EFE8" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[3.0, 9.5]} tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="fat" name="Fat %" stroke="#0B5D3B" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="snf" name="SNF %" stroke="#F4C95D" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-4 p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17231D]">Grade Ratios</h3>
              <p className="text-xs text-[#6B756E] mb-2">Quality compliance share</p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gradePie} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value">
                      {gradePie.map((g, i) => (
                        <Cell key={i} fill={g.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#DDE8DF] text-xs">
              {gradePie.map((g) => (
                <div key={g.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                    <span className="text-[#6B756E] text-[11px]">{g.name}</span>
                  </div>
                  <span className="font-bold text-[#17231D]">{g.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION 3: FINANCIAL ANALYTICS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0B5D3B] uppercase tracking-wider">
          <IndianRupee className="w-4 h-4 text-[#3A8F3D]" />
          <span>3. Financial Settlements & Disbursal Velocity</span>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#17231D]">Gross Payout vs Paid vs Pending</h3>
              <p className="text-xs text-[#6B756E]">Fortnightly settlement cycle disbursement comparison (INR)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EFE8" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B756E" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Amount"]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="paid" name="Disbursed (Paid)" fill="#0B5D3B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" name="Pending Settlement" fill="#F4C95D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

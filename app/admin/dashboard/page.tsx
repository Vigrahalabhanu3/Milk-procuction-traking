"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getAdminDashboardStats } from "@/lib/services/stats.service";
import { getCollections } from "@/lib/services/collection.service";
import { getFarmers } from "@/lib/services/farmer.service";
import { AdminDashboardStats, MilkCollection, Farmer } from "@/lib/types";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QualityBadge, StatusBadge } from "@/components/ui/badge";
import { StatCardsSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatVolume, formatDate } from "@/lib/utils";
import {
  Users,
  Milk,
  IndianRupee,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentCollections, setRecentCollections] = useState<MilkCollection[]>([]);
  const [topFarmers, setTopFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const s = await getAdminDashboardStats();
        setStats(s);

        const cols = await getCollections();
        setRecentCollections(cols.slice(0, 6));

        const farmers = await getFarmers();
        const sorted = [...farmers].sort((a, b) => b.milkToday - a.milkToday);
        setTopFarmers(sorted.slice(0, 5));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("dairyflow_update_collections", handleUpdate);
    window.addEventListener("dairyflow_update_farmers", handleUpdate);
    window.addEventListener("dairyflow_update_payments", handleUpdate);

    return () => {
      window.removeEventListener("dairyflow_update_collections", handleUpdate);
      window.removeEventListener("dairyflow_update_farmers", handleUpdate);
      window.removeEventListener("dairyflow_update_payments", handleUpdate);
    };
  }, []);

  // 1. Milk Production Daily Trend (Line Chart)
  const productionLineData = [
    { date: "22 Sep", volume: 1180, payout: 49560 },
    { date: "23 Sep", volume: 1210, payout: 50820 },
    { date: "24 Sep", volume: 1195, payout: 50190 },
    { date: "25 Sep", volume: 1235, payout: 51870 },
    { date: "26 Sep", volume: 1220, payout: 51240 },
    { date: "27 Sep", volume: 1240, payout: 52080 },
    { date: "28 Sep", volume: 1248, payout: 52416 },
  ];

  // 2. Morning vs Evening Session (Bar Chart)
  const sessionComparisonData = [
    { day: "Mon", Morning: 620, Evening: 560 },
    { day: "Tue", Morning: 635, Evening: 575 },
    { day: "Wed", Morning: 625, Evening: 570 },
    { day: "Thu", Morning: 645, Evening: 590 },
    { day: "Fri", Morning: 638, Evening: 582 },
    { day: "Sat", Morning: 646, Evening: 594 },
    { day: "Sun", Morning: 648, Evening: 600 },
  ];

  // 3. Quality Distribution (Doughnut Chart)
  const qualityDistributionData = [
    { name: "Grade A+ (Premium)", value: 58, color: "#0B5D3B" },
    { name: "Grade A (Standard)", value: 28, color: "#3A8F3D" },
    { name: "Grade B (Fair)", value: 11, color: "#F4C95D" },
    { name: "Grade C / Rejected", value: 3, color: "#D9534F" },
  ];

  // 4. Monthly Payments (Bar/Area Chart)
  const paymentsTrendData = [
    { month: "Apr", amount: 1240000 },
    { month: "May", amount: 1310000 },
    { month: "Jun", amount: 1285000 },
    { month: "Jul", amount: 1340000 },
    { month: "Aug", amount: 1395000 },
    { month: "Sep", amount: 1420000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Good Morning, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Here&apos;s today&apos;s dairy operation overview across chilling centers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/collections">
            <Button variant="primary" size="sm" className="shadow-xs">
              + Add Collection
            </Button>
          </Link>
          <Link href="/admin/farmers">
            <Button variant="outline" size="sm">
              + Add Farmer
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Key Statistics Cards (Section 38) */}
      {isLoading ? (
        <StatCardsSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-4">
          <StatCard
            title="Total Farmers"
            value={stats?.totalFarmers ?? 48}
            subvalue="Cooperative members"
            icon={Users}
          />

          <StatCard
            title="Active Farmers"
            value={stats?.activeFarmers ?? 44}
            subvalue="Supplied today"
            icon={Users}
            trend={{ value: "91.6%", positive: true }}
          />

          <StatCard
            title="Today's Milk"
            value={formatVolume(stats?.todayMilk ?? 1248)}
            subvalue="Morning + Evening"
            icon={Milk}
            trend={{ value: "+2.4%", positive: true }}
          />

          <StatCard
            title="Monthly Milk"
            value={formatVolume(stats?.monthlyMilk ?? 32480)}
            subvalue="September 2026"
            icon={Milk}
          />

          <StatCard
            title="Today's Payout"
            value={formatCurrency(stats?.todayPayout ?? 52416)}
            subvalue="Procurement bill"
            icon={IndianRupee}
          />

          <StatCard
            title="Pending Payments"
            value={formatCurrency(stats?.pendingPayments ?? 18250)}
            subvalue="Disbursal scheduled"
            icon={Clock}
            className="bg-amber-50/20 border-amber-200"
          />
        </div>
      )}

      {/* Section 39: 4 Admin Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Milk Production Line Chart */}
        <Card className="lg:col-span-8 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#17231D]">Milk Production Trend</h3>
              <p className="text-xs text-[#6B756E]">Daily milk procurement volume (Liters)</p>
            </div>
            <span className="text-xs font-bold text-[#0B5D3B] bg-[#0B5D3B]/10 px-2.5 py-1 rounded-full">
              Past 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionLineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EFE8" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} unit="L" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-xl border border-[#DDE8DF] shadow-md text-xs space-y-1">
                          <p className="font-bold text-[#17231D]">{payload[0].payload.date}</p>
                          <p className="text-[#0B5D3B] font-semibold">Volume: {payload[0].value} L</p>
                          <p className="text-[#6B756E]">Disbursal: ₹{payload[0].payload.payout.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#0B5D3B"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0B5D3B" }}
                  activeDot={{ r: 6, fill: "#F4C95D" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Quality Distribution Doughnut */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#17231D]">Quality Distribution</h3>
            <p className="text-xs text-[#6B756E] mb-3">Certified Fat/SNF batch ratios</p>

            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {qualityDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-[#0B5D3B]">86%</span>
                <span className="text-[10px] text-[#6B756E] uppercase font-bold">Grade A/A+</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#DDE8DF] text-xs">
            {qualityDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#6B756E] text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-[#17231D]">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Chart 2: Morning vs Evening Bar Chart */}
        <Card className="lg:col-span-6 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#17231D]">Morning vs Evening Session</h3>
              <p className="text-xs text-[#6B756E]">Volume distribution by milking shift (L)</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EFE8" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} unit="L" />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="Morning" fill="#3A8F3D" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Evening" fill="#0B5D3B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Monthly Payments Area Chart */}
        <Card className="lg:col-span-6 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#17231D]">Monthly Procurement Disbursements</h3>
              <p className="text-xs text-[#6B756E]">Total cooperative farmer payouts (INR)</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={paymentsTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3A8F3D" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3A8F3D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EFE8" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B756E" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 100000}L`}
                />
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Disbursed"]} />
                <Area type="monotone" dataKey="amount" stroke="#0B5D3B" strokeWidth={2.5} fill="url(#payoutGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Recent Collections & Top Producing Farmers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Collections */}
        <Card className="lg:col-span-7 p-0 overflow-hidden">
          <div className="p-5 border-b border-[#DDE8DF] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17231D]">Latest Milk Collections</h3>
              <p className="text-xs text-[#6B756E]">Real-time intake from chilling scales</p>
            </div>
            <Link
              href="/admin/collections"
              className="text-xs font-bold text-[#0B5D3B] hover:text-[#07452C] flex items-center gap-1"
            >
              All Collections <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                <tr>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-right">Fat %</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE8DF]">
                {recentCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-[#FAFCF8]">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#17231D] block">{col.farmerName}</span>
                      <span className="text-[10px] text-[#6B756E]">{col.farmerId}</span>
                    </td>
                    <td className="py-3 px-4 text-[#6B756E]">{col.session}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#0B5D3B]">
                      {formatVolume(col.quantity)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#17231D]">{col.fat}%</td>
                    <td className="py-3 px-4 text-right font-bold text-[#17231D]">{formatCurrency(col.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <QualityBadge grade={col.quality} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Producing Farmers */}
        <Card className="lg:col-span-5 p-0 overflow-hidden">
          <div className="p-5 border-b border-[#DDE8DF] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17231D]">Top Daily Producers</h3>
              <p className="text-xs text-[#6B756E]">Highest yielding cooperative members</p>
            </div>
            <Link
              href="/admin/farmers"
              className="text-xs font-bold text-[#0B5D3B] hover:text-[#07452C] flex items-center gap-1"
            >
              Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#DDE8DF]">
            {topFarmers.map((f, i) => (
              <div key={f.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAFCF8]">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0B5D3B]/10 text-[#0B5D3B] text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-[#17231D]">{f.name}</h5>
                    <p className="text-[10px] text-[#6B756E]">
                      {f.farmerId} • {f.village}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-xs text-[#0B5D3B] block">{formatVolume(f.milkToday)}</span>
                  <span className="text-[10px] text-[#6B756E] font-medium">{formatCurrency(f.totalEarnings)} total</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

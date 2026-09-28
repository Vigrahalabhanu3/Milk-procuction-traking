"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Card, StatCard } from "@/components/ui/card";
import { Badge, QualityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCardsSkeleton, Skeleton } from "@/components/ui/skeleton";
import { getFarmerDashboardStats } from "@/lib/services/stats.service";
import { getCollectionsByFarmer } from "@/lib/services/collection.service";
import { getActiveAnnouncements } from "@/lib/services/announcement.service";
import { FarmerDashboardStats, MilkCollection, Announcement } from "@/lib/types";
import { formatCurrency, formatVolume, formatDate } from "@/lib/utils";
import {
  Milk,
  Sun,
  Moon,
  IndianRupee,
  Clock,
  ArrowRight,
  TrendingUp,
  Megaphone,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const farmerId = user?.farmerId || "FARM001";

  const [stats, setStats] = useState<FarmerDashboardStats | null>(null);
  const [recentCollections, setRecentCollections] = useState<MilkCollection[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [chartRange, setChartRange] = useState<"7D" | "30D" | "3M">("7D");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const s = await getFarmerDashboardStats(farmerId);
        setStats(s);

        const cols = await getCollectionsByFarmer(farmerId);
        setRecentCollections(cols.slice(0, 5));

        const anns = await getActiveAnnouncements();
        setAnnouncements(anns);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("dairyflow_update_collections", handleUpdate);
    window.addEventListener("dairyflow_update_payments", handleUpdate);
    window.addEventListener("dairyflow_update_announcements", handleUpdate);

    return () => {
      window.removeEventListener("dairyflow_update_collections", handleUpdate);
      window.removeEventListener("dairyflow_update_payments", handleUpdate);
      window.removeEventListener("dairyflow_update_announcements", handleUpdate);
    };
  }, [farmerId]);

  // Production Chart Data
  const chartData7D = [
    { day: "Mon", milk: 21.0, earnings: 882 },
    { day: "Tue", milk: 23.0, earnings: 966 },
    { day: "Wed", milk: 22.0, earnings: 924 },
    { day: "Thu", milk: 25.0, earnings: 1050 },
    { day: "Fri", milk: 24.0, earnings: 1008 },
    { day: "Sat", milk: 26.0, earnings: 1092 },
    { day: "Sun (Today)", milk: 24.5, earnings: 1029 },
  ];

  const chartData30D = [
    { day: "Week 1", milk: 154.0, earnings: 6468 },
    { day: "Week 2", milk: 161.5, earnings: 6783 },
    { day: "Week 3", milk: 158.0, earnings: 6636 },
    { day: "Week 4", milk: 168.5, earnings: 7077 },
  ];

  const chartData3M = [
    { day: "July", milk: 640.0, earnings: 26880 },
    { day: "August", milk: 675.0, earnings: 28350 },
    { day: "September", milk: 692.0, earnings: 29064 },
  ];

  const activeChartData = chartRange === "7D" ? chartData7D : chartRange === "30D" ? chartData30D : chartData3M;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. WELCOME BANNER WITH SUBTLE FARM SCENERY */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#DDE8DF] bg-white shadow-xs">
        <div className="relative h-36 sm:h-52 w-full">
          <Image
            src="/images/farm-banner.jpg"
            alt="Farm scenery header"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07452C]/95 via-[#07452C]/75 to-transparent" />

          <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-center text-white">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[#F4C95D] text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                {farmerId}
              </span>
              <span className="text-white/60">•</span>
              <span className="text-[11px] sm:text-xs text-white/90 font-medium">Green Valley Chilling Center</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Good Morning, {user?.name?.split(" ")[0] || "Ramesh"} 👋
            </h1>
            <p className="text-[11px] sm:text-sm text-white/80 mt-0.5 sm:mt-1 max-w-lg line-clamp-1 sm:line-clamp-none">
              Here&apos;s your live milk production and cooperative payment overview.
            </p>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE ANNOUNCEMENT (IF AVAILABLE) */}
      {announcements.length > 0 && (
        <div className="rounded-2xl p-3.5 sm:p-5 bg-gradient-to-r from-[#0B5D3B]/10 via-[#3A8F3D]/10 to-[#7CB342]/10 border border-[#3A8F3D]/30 flex items-start gap-3 sm:gap-3.5 shadow-2xs">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#F4C95D]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0B5D3B] text-white">
                Notice
              </span>
              <span className="text-xs font-bold text-[#17231D] truncate">{announcements[0].title}</span>
            </div>
            <p className="text-xs text-[#6B756E] leading-relaxed line-clamp-2 sm:line-clamp-none">{announcements[0].message}</p>
          </div>
        </div>
      )}

      {/* 3. KEY STATISTICS CARDS */}
      {isLoading ? (
        <StatCardsSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {/* Today's Milk */}
          <StatCard
            title="Today's Milk"
            value={formatVolume(stats?.todayMilk ?? 24.5)}
            subvalue="Daily total"
            icon={Milk}
          />

          {/* Morning Session */}
          <StatCard
            title="Morning"
            value={formatVolume(stats?.morningMilk ?? 12.5)}
            subvalue="07:30 AM"
            icon={Sun}
          />

          {/* Evening Session */}
          <StatCard
            title="Evening"
            value={formatVolume(stats?.eveningMilk ?? 12.0)}
            subvalue="06:00 PM"
            icon={Moon}
          />

          {/* Today's Earnings */}
          <StatCard
            title="Today's Earnings"
            value={formatCurrency(stats?.todayEarnings ?? 1029)}
            subvalue="Rate @ ₹42/L"
            icon={IndianRupee}
            trend={{ value: "+4.2%", positive: true }}
          />

          {/* Pending Payment */}
          <StatCard
            title="Pending Payment"
            value={formatCurrency(stats?.pendingPayment ?? 4520)}
            subvalue="Disbursal on 30 Sep"
            icon={Clock}
            className="col-span-2 sm:col-span-1 border-amber-200/80 bg-amber-50/20"
          />
        </div>
      )}

      {/* 4. CHARTS & RECENT COLLECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Production Chart */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-bold text-lg text-[#17231D] tracking-tight">Milk Production</h3>
                <p className="text-xs text-[#6B756E]">Interactive volume & earnings trend</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF]">
                {(["7D", "30D", "3M"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      chartRange === r
                        ? "bg-[#0B5D3B] text-white shadow-xs"
                        : "text-[#6B756E] hover:text-[#17231D]"
                    }`}
                  >
                    {r === "7D" ? "7 Days" : r === "30D" ? "30 Days" : "3 Months"}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="milkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3A8F3D" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3A8F3D" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EFE8" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B756E" }} axisLine={false} tickLine={false} unit="L" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-xl border border-[#DDE8DF] shadow-md text-xs space-y-1">
                            <p className="font-bold text-[#17231D]">{payload[0].payload.day}</p>
                            <p className="text-[#0B5D3B] font-semibold">Volume: {payload[0].value} L</p>
                            <p className="text-[#6B756E]">Earnings: ₹{payload[0].payload.earnings}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="milk"
                    stroke="#0B5D3B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#milkGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#DDE8DF] text-xs text-[#6B756E]">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#3A8F3D]" />
              <span>Average Daily Yield: <strong className="text-[#17231D]">23.8 L</strong></span>
            </div>
            <span>Base Union Procurement Rate: <strong className="text-[#0B5D3B]">₹42.00 / L</strong></span>
          </div>
        </Card>

        {/* Recent Collections Table Card */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-[#17231D] tracking-tight">Recent Collections</h3>
                <p className="text-xs text-[#6B756E]">Latest verified deliveries</p>
              </div>
              <Link
                href="/farmer/collections"
                className="text-xs font-bold text-[#0B5D3B] hover:text-[#07452C] flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentCollections.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF] text-xs hover:border-[#3A8F3D]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#DDE8DF] flex items-center justify-center font-bold text-[#0B5D3B]">
                      {col.session === "Morning" ? (
                        <Sun className="w-4 h-4 text-[#F4C95D]" />
                      ) : (
                        <Moon className="w-4 h-4 text-[#3A8F3D]" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#17231D]">
                        {formatDate(col.date)} • {col.session}
                      </p>
                      <p className="text-[11px] text-[#6B756E]">
                        Fat: {col.fat}% | SNF: {col.snf}%
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-sm text-[#0B5D3B]">{formatVolume(col.quantity)}</p>
                    <p className="text-[11px] font-semibold text-[#6B756E]">{formatCurrency(col.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#6B756E]">
            <span>Average Fat Quality: <strong className="text-[#17231D]">4.2%</strong></span>
            <QualityBadge grade="A+" />
          </div>
        </Card>
      </div>
    </div>
  );
}

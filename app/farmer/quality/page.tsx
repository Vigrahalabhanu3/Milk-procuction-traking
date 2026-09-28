"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getCollectionsByFarmer } from "@/lib/services/collection.service";
import { getFarmerDashboardStats } from "@/lib/services/stats.service";
import { MilkCollection, FarmerDashboardStats } from "@/lib/types";
import { Card, StatCard } from "@/components/ui/card";
import { QualityBadge } from "@/components/ui/badge";
import { StatCardsSkeleton, ResponsiveListSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Award, CheckCircle2, ShieldCheck, AlertCircle, TrendingUp, HelpCircle } from "lucide-react";

export default function FarmerQualityPage() {
  const { user } = useAuth();
  const farmerId = user?.farmerId || "FARM001";

  const [stats, setStats] = useState<FarmerDashboardStats | null>(null);
  const [collections, setCollections] = useState<MilkCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQualityData() {
      try {
        const s = await getFarmerDashboardStats(farmerId);
        setStats(s);

        const cols = await getCollectionsByFarmer(farmerId);
        setCollections(cols);
      } finally {
        setIsLoading(false);
      }
    }
    loadQualityData();
  }, [farmerId]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
          Milk Quality & Lab Tests
        </h1>
        <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
          Certified automated lactometer, fat density, and SNF test ratings.
        </p>
      </div>

      {/* 3 Quality Stat Cards */}
      {isLoading ? (
        <StatCardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            title="Average Fat"
            value={`${stats?.averageFat ?? 4.2}%`}
            subvalue="Target ≥ 4.0% for Grade A"
            icon={Award}
            trend={{ value: "+0.2% this month", positive: true }}
          />

          <StatCard
            title="Average SNF"
            value={`${stats?.averageSnf ?? 8.5}%`}
            subvalue="Solid-Not-Fat density ratio"
            icon={TrendingUp}
            trend={{ value: "Optimal range", positive: true }}
          />

          <Card hover className="p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-[#6B756E] uppercase tracking-wider">Overall Quality</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#3A8F3D]" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#0B5D3B]">Grade A+</span>
              <span className="text-xs text-[#3A8F3D] font-bold">Premium Tier</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6B756E] mt-1">Qualifies for ₹1.50/L bonus slab</p>
          </Card>
        </div>
      )}

      {/* Quality Standards Reference Guide */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-base text-[#17231D] mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0B5D3B]" />
          Union Quality Grading Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#0B5D3B]/30 bg-[#0B5D3B]/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0B5D3B]">Grade A+</span>
              <QualityBadge grade="A+" />
            </div>
            <p className="text-[#6B756E]">Fat ≥ 4.2% & SNF ≥ 8.5%</p>
            <p className="font-semibold text-[#0B5D3B]">Highest procurement tier</p>
          </div>

          <div className="p-3.5 rounded-xl border border-[#3A8F3D]/30 bg-[#3A8F3D]/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#3A8F3D]">Grade A</span>
              <QualityBadge grade="A" />
            </div>
            <p className="text-[#6B756E]">Fat 4.0% - 4.1% & SNF ≥ 8.3%</p>
            <p className="font-semibold text-[#3A8F3D]">Standard cooperative rate</p>
          </div>

          <div className="p-3.5 rounded-xl border border-[#F4C95D]/40 bg-[#F4C95D]/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#976003]">Grade B</span>
              <QualityBadge grade="B" />
            </div>
            <p className="text-[#6B756E]">Fat 3.8% - 3.9% & SNF ≥ 8.1%</p>
            <p className="font-semibold text-[#976003]">Base rate (no bonus)</p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-800">Grade C</span>
              <QualityBadge grade="C" />
            </div>
            <p className="text-[#6B756E]">Fat 3.5% - 3.7% & SNF &lt; 8.0%</p>
            <p className="font-semibold text-amber-800">Review advised</p>
          </div>

          <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-red-700">Rejected</span>
              <QualityBadge grade="REJECTED" />
            </div>
            <p className="text-[#6B756E]">Water adulteration / sour</p>
            <p className="font-semibold text-red-700">Procurement declined</p>
          </div>
        </div>
      </Card>

      {/* Quality History Table / Mobile Cards */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DDE8DF] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#17231D]">Quality Verification History</h3>
            <p className="text-xs text-[#6B756E]">Historical test results measured at milk drop-off</p>
          </div>
          <span className="text-xs text-[#6B756E] font-medium hidden sm:inline-block">Read-Only Official Record</span>
        </div>

        {isLoading ? (
          <div className="p-3 sm:p-6">
            <ResponsiveListSkeleton rows={5} cols={7} />
          </div>
        ) : collections.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B756E]">
            No quality lab test records available.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Shift</th>
                    <th className="py-3.5 px-4 text-right">Lactometer (CLR)</th>
                    <th className="py-3.5 px-4 text-right">Fat %</th>
                    <th className="py-3.5 px-4 text-right">SNF %</th>
                    <th className="py-3.5 px-4 text-right">Temp (°C)</th>
                    <th className="py-3.5 px-4 text-center">Quality Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE8DF]">
                  {collections.slice(0, 15).map((col) => (
                    <tr key={col.id} className="hover:bg-[#FAFCF8]">
                      <td className="py-3 px-4 font-semibold text-[#17231D]">{formatDate(col.date)}</td>
                      <td className="py-3 px-4 text-[#6B756E]">{col.session}</td>
                      <td className="py-3 px-4 text-right font-medium text-[#17231D]">{col.clr}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#0B5D3B]">{col.fat}%</td>
                      <td className="py-3 px-4 text-right font-bold text-[#17231D]">{col.snf}%</td>
                      <td className="py-3 px-4 text-right text-[#6B756E]">{col.temperature}°C</td>
                      <td className="py-3 px-4 text-center">
                        <QualityBadge grade={col.quality} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[#DDE8DF]">
              {collections.slice(0, 15).map((col) => (
                <div key={col.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#17231D]">{formatDate(col.date)}</span>
                      <span className="text-[10px] text-[#6B756E] block">{col.session} Shift</span>
                    </div>
                    <QualityBadge grade={col.quality} />
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF]/60 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-[#6B756E] uppercase font-semibold block">Fat</span>
                      <span className="font-extrabold text-[#0B5D3B]">{col.fat}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#6B756E] uppercase font-semibold block">SNF</span>
                      <span className="font-bold text-[#17231D]">{col.snf}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#6B756E] uppercase font-semibold block">CLR</span>
                      <span className="font-medium text-[#17231D]">{col.clr}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#6B756E] uppercase font-semibold block">Temp</span>
                      <span className="font-medium text-[#6B756E]">{col.temperature}°C</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

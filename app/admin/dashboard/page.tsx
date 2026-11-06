"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, CalendarDays, ClipboardList, IndianRupee, Milk, Plus, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useAdminFarmers } from "@/lib/hooks/use-admin-farmers";
import { useMilkCollections } from "@/lib/hooks/use-milk-collections";
import { useMonthlyEarnings } from "@/lib/hooks/use-monthly-earnings";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataLoader } from "@/components/ui/loading-spinner";
import { formatDate } from "@/lib/utils";

function currentPeriod() { const now = new Date(); const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; return {month, today: `${month}-${String(now.getDate()).padStart(2, "0")}`}; }
const money = (value: string) => Number(value).toLocaleString("en-IN", {style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2});

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [period] = useState(currentPeriod);
  const farmers = useAdminFarmers({pageSize: 1});
  const today = useMilkCollections("admin", {date: period.today, page: 1, page_size: 5});
  const monthly = useMonthlyEarnings("admin", period.month);
  const monthlyData = monthly.data && "results" in monthly.data ? monthly.data : undefined;
  const sections = [farmers, today, monthly];

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="mb-1 text-xs text-[#6B756E]">{formatDate(period.today)}</p><h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">Welcome, {user?.name}</h1><p className="mt-1.5 text-sm text-[#6B756E]">Your farmer accounts, milk collections, and monthly earnings.</p></div><Link href="/admin/add-collection"><Button><Plus className="h-4 w-4" />Add Milk Collection</Button></Link></header>
    {sections.map((section, index) => section.error && <div key={index} role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#D9534F]"><p>{section.error}</p><Button variant="outline" size="sm" onClick={section.reload}>Try Again</Button></div>)}
    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-3">
      <StatCard title="Total Farmers" value={farmers.data?.summary.total ?? "—"} isLoading={farmers.isLoading} subvalue="Registered accounts" icon={Users} />
      <StatCard title="Active Accounts" value={farmers.data?.summary.active ?? "—"} isLoading={farmers.isLoading} subvalue="Accounts enabled to sign in" icon={Users} />
      <StatCard title="Inactive Accounts" value={farmers.data?.summary.inactive ?? "—"} isLoading={farmers.isLoading} subvalue="Accounts currently disabled" icon={Users} />
      <StatCard title="Today's Milk" value={today.data ? `${today.data.summary.quantity_litres} L` : "—"} isLoading={today.isLoading} subvalue="Morning and evening collections" icon={Milk} />
      <StatCard title="Today's Collection Value" value={today.data ? money(today.data.summary.amount) : "—"} isLoading={today.isLoading} subvalue="Value of recorded milk" icon={IndianRupee} />
      <StatCard title="Monthly Earnings" value={monthlyData ? money(monthlyData.summary.earnings) : "—"} isLoading={monthly.isLoading} subvalue={period.month} icon={CalendarDays} />
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card className="overflow-hidden p-0"><div className="flex items-center justify-between gap-3 border-b border-[#DDE8DF] p-5"><div><h2 className="font-bold text-[#17231D]">Today&apos;s collections</h2><p className="mt-1 text-xs text-[#6B756E]">Latest records for {formatDate(period.today)}</p></div><Link href="/admin/collections" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B5D3B]">View All<ArrowRight className="h-3.5 w-3.5" /></Link></div>{today.isLoading ? <DataLoader label="Loading today's collections..." /> : today.error ? <p className="p-8 text-center text-sm text-[#6B756E]">Collection data is unavailable.</p> : !today.data?.results.length ? <p className="p-10 text-center text-sm text-[#6B756E]">No milk collections recorded today.</p> : <div className="divide-y divide-[#E6EDE7]">{today.data.results.map(record => <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-semibold text-[#17231D]">{record.farmer_name}</p><p className="mt-1 text-xs text-[#6B756E]">{record.farmer_id} · {record.shift === "morning" ? "Morning" : "Evening"}</p></div><div className="text-right"><p className="font-bold text-[#0B5D3B]">{record.quantity_litres} L</p><p className="mt-1 text-xs text-[#6B756E]">{money(record.amount)}</p></div></div>)}</div>}</Card>
      <Card className="space-y-4"><h2 className="font-bold text-[#17231D]">Quick actions</h2>{[{href: "/admin/register-farmer", label: "Register Farmer", icon: Users}, {href: "/admin/payments", label: "Monthly Earnings", icon: CalendarDays}, {href: "/admin/notifications", label: "Send Notification", icon: Bell}, {href: "/admin/reports", label: "Reports & Exports", icon: ClipboardList}].map(({href, label, icon: Icon}) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-[#DDE8DF] p-3 text-sm font-semibold text-[#17231D] hover:bg-[#F4F8EF]"><Icon className="h-4 w-4 text-[#3A8F3D]" />{label}<ArrowRight className="ml-auto h-4 w-4 text-[#6B756E]" /></Link>)}<p className="text-xs leading-relaxed text-[#6B756E]">Earnings show collection value, not received payments.</p></Card>
    </div>
  </div>;
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, IndianRupee, Milk, Moon, RefreshCw, Sun, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFarmerDashboard } from "@/lib/hooks/use-farmer-dashboard";
import { DashboardRange, ProductionPoint, productionDateLabel } from "@/lib/services/farmer-dashboard-api";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataLoader, LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDate } from "@/lib/utils";

const formatMoney = (value: string | number, currency: string) => Number(value).toLocaleString("en-IN", {style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2});
const volume = (value: string | number | null | undefined) => value === null || value === undefined ? "—" : `${value} L`;
const percent = (value: string | number | null | undefined) => value === null || value === undefined ? "—" : `${value}%`;

export default function FarmerDashboard() {
  const [range, setRange] = useState<DashboardRange>("7d");
  const { data, error, isLoading, reload } = useFarmerDashboard(range);
  const money = (value: string | number | null | undefined) => value === null || value === undefined ? "—" : formatMoney(value, data?.currency ?? "INR");
  const trend = data?.production.trend.map(point => ({ ...point, volume: Number(point.quantity_litres) })) ?? [];

  return <div className="space-y-4 sm:space-y-6">
    <div className="relative overflow-hidden rounded-2xl border border-[#DDE8DF] bg-white shadow-xs sm:rounded-3xl">
      <div className="relative h-40 w-full sm:h-52"><Image src="/images/farm-banner.jpg" alt="Farm scenery" fill priority sizes="(max-width: 1024px) 100vw, 80vw" className="object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-r from-[#07452C]/95 via-[#07452C]/75 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-5 text-white sm:p-8"><div className="mb-2 flex flex-wrap items-center gap-2">{isLoading ? <LoadingSpinner label="Loading farmer details..." className="text-white [&_svg]:text-white" /> : data && <span className="rounded-full bg-white/20 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-[#F4C95D]">{data.farmer.farmer_id}</span>}<span className="text-xs text-white/80">{data?.farmer.chilling_center ?? "Your dairy overview"}</span></div><h1 className="break-words text-xl font-extrabold tracking-tight sm:text-3xl">{data ? `Welcome, ${data.farmer.name}` : "Welcome to DairyFlow"}</h1><p className="mt-1 text-xs text-white/80 sm:text-sm">Your milk production and collection earnings, all in one place.</p></div>
      </div>
    </div>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"><p className="text-sm text-[#D9534F]">{error}</p><Button variant="outline" onClick={reload}><RefreshCw className="h-4 w-4" />Try Again</Button></div>}

    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
      <StatCard title="Today's Milk" value={volume(data?.today.quantity_litres)} subvalue="Daily total" icon={Milk} isLoading={isLoading} />
      <StatCard title="Morning" value={volume(data?.today.morning_litres)} subvalue={`Shift timing: ${data?.today.morning_time ?? "—"}`} icon={Sun} isLoading={isLoading} />
      <StatCard title="Evening" value={volume(data?.today.evening_litres)} subvalue={`Shift timing: ${data?.today.evening_time ?? "—"}`} icon={Moon} isLoading={isLoading} />
      <StatCard title="Today's Earnings" value={data ? money(data.today.earnings) : "—"} subvalue="Milk collection value" icon={IndianRupee} isLoading={isLoading} />
      <StatCard title="Pending Payment" value={money(data?.payments.pending_amount)} subvalue={`Payout date: ${data?.payments.next_disbursement_date ? productionDateLabel(data.payments.next_disbursement_date, "7d", true) : "—"}`} icon={Clock} isLoading={isLoading} className="col-span-2 border-amber-200/80 bg-amber-50/20 sm:col-span-1" />
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card className="flex min-w-0 flex-col justify-between lg:col-span-7">
        <div><div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold tracking-tight text-[#17231D]">Milk Production</h2><p className="mt-1 text-xs text-[#6B756E]">{range === "3m" ? "Three calendar months, including the current month" : "Daily milk volume and collection earnings"}</p></div><div role="group" aria-label="Production chart range" className="flex items-center gap-1 self-start rounded-xl border border-[#DDE8DF] bg-[#FAFCF8] p-1">{([{value: "7d", label: "7 Days"}, {value: "30d", label: "30 Days"}, {value: "3m", label: "3 Months"}] as const).map(tab => <button key={tab.value} type="button" aria-pressed={range === tab.value} onClick={() => setRange(tab.value)} className={`min-h-9 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${range === tab.value ? "bg-[#0B5D3B] text-white shadow-xs" : "text-[#6B756E] hover:text-[#17231D]"}`}>{tab.label}</button>)}</div></div>
          <div className="h-64 min-w-0 w-full" aria-busy={isLoading}>
            {isLoading ? <DataLoader label="Loading production chart..." className="h-full" /> : error ? <div className="flex h-full items-center justify-center text-sm text-[#6B756E]">Production data is unavailable.</div> : !trend.length ? <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-[#6B756E]"><Milk className="h-8 w-8 text-[#8AA582]" /><p>No production data for this range.</p></div> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{top: 10, right: 10, left: -20, bottom: 0}}><defs><linearGradient id="farmerMilkGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3A8F3D" stopOpacity={0.35} /><stop offset="95%" stopColor="#3A8F3D" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EFE8" /><XAxis dataKey="date" tickFormatter={value => productionDateLabel(String(value), range)} tick={{fontSize: 11, fill: "#6B756E"}} axisLine={false} tickLine={false} /><YAxis tick={{fontSize: 11, fill: "#6B756E"}} axisLine={false} tickLine={false} unit="L" /><Tooltip content={({active, payload}) => {
              const point = payload?.[0]?.payload as ProductionPoint | undefined;
              return active && point ? <div className="space-y-1 rounded-xl border border-[#DDE8DF] bg-white p-3 text-xs shadow-md"><p className="font-bold text-[#17231D]">{productionDateLabel(point.date, range, true)}</p><p className="font-semibold text-[#0B5D3B]">Volume: {point.quantity_litres} L</p><p className="text-[#6B756E]">Morning: {point.morning_litres} L · Evening: {point.evening_litres} L</p><p className="text-[#6B756E]">Earnings: {money(point.earnings)}</p></div> : null;
            }} /><Area type="monotone" dataKey="volume" name="Milk volume" stroke="#0B5D3B" strokeWidth={2.5} fill="url(#farmerMilkGradient)" /></AreaChart></ResponsiveContainer>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#DDE8DF] pt-4 text-xs text-[#6B756E]"><span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-[#3A8F3D]" />Average daily yield: {isLoading ? <LoadingSpinner label="Loading average yield..." /> : <strong className="text-[#17231D]">{volume(data?.production.average_daily_yield_litres)}</strong>}</span><span>Union rate: <strong className="text-[#0B5D3B]">{data?.production.base_union_rate === null || data?.production.base_union_rate === undefined ? "—" : `${money(data.production.base_union_rate)} / L`}</strong></span></div>
      </Card>

      <Card className="flex min-w-0 flex-col justify-between lg:col-span-5">
        <div><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold tracking-tight text-[#17231D]">Recent Collections</h2><p className="mt-1 text-xs text-[#6B756E]">Your latest five recorded deliveries</p></div><Link href="/farmer/collections" className="inline-flex items-center gap-1 text-xs font-bold text-[#0B5D3B] hover:underline">View All<ArrowRight className="h-3.5 w-3.5" /></Link></div>
          {isLoading ? <DataLoader label="Loading recent collections..." /> : error ? <p className="py-8 text-center text-sm text-[#6B756E]">Recent collections are unavailable.</p> : !data?.recent_collections.length ? <p className="py-10 text-center text-sm text-[#6B756E]">No milk collections recorded yet.</p> : <div className="space-y-3">{data.recent_collections.slice(0, 5).map(collection => <article key={collection.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DDE8DF] bg-[#FAFCF8] p-3 text-xs"><div className="flex min-w-0 items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DDE8DF] bg-white">{collection.shift === "morning" ? <Sun className="h-4 w-4 text-amber-600" /> : <Moon className="h-4 w-4 text-[#3A8F3D]" />}</div><div><p className="font-semibold text-[#17231D]">{formatDate(collection.collection_date)} · {collection.shift === "morning" ? "Morning" : "Evening"}</p><p className="mt-1 text-[11px] text-[#6B756E]">Fat: {percent(collection.fat)} · SNF: {percent(collection.snf)}</p></div></div><div className="ml-auto text-right"><p className="text-sm font-bold text-[#0B5D3B]">{collection.quantity_litres} L</p><p className="mt-1 font-semibold text-[#6B756E]">{money(collection.amount)}</p></div></article>)}</div>}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#DDE8DF] pt-4 text-xs text-[#6B756E]">Average fat: {isLoading ? <LoadingSpinner label="Loading average fat..." /> : <strong className="text-[#17231D]">{percent(data?.production.average_fat)}</strong>}</div>
      </Card>
    </div>
  </div>;
}

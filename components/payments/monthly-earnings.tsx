"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Download, IndianRupee, Info, Milk, Moon, RefreshCw, Sun, Users } from "lucide-react";
import { useMonthlyEarnings } from "@/lib/hooks/use-monthly-earnings";
import { validMonth } from "@/lib/services/monthly-earnings-api";
import { UserRole } from "@/lib/types";
import { downloadCSV } from "@/lib/services/report.service";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataLoader, LoadingSpinner } from "@/components/ui/loading-spinner";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { formatDate } from "@/lib/utils";

function currentMonth() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; }

export function MonthlyEarnings({ role }: { role: UserRole }) {
  const admin = role === "admin";
  const [month, setMonth] = useState(currentMonth);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, error, fields, isLoading, reload } = useMonthlyEarnings(role, month, page, pageSize);
  const adminData = data && "results" in data ? data : undefined;
  const farmerData = data && "daily_breakdown" in data ? data : undefined;
  const summary = data?.summary;
  const readyMonth = validMonth(month);
  const monthLabel = readyMonth ? new Date(`${month}-01T12:00:00`).toLocaleDateString("en-IN", {month: "long", year: "numeric"}) : "Choose a month";
  const money = (amount: string) => Number(amount).toLocaleString("en-IN", { style: "currency", currency: data?.currency || "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const hasRows = admin ? !!adminData?.results.length : !!farmerData?.daily_breakdown.length;
  const totalPages = Math.max(1, Math.ceil((adminData?.count ?? 0) / pageSize));

  function exportRows() {
    if (adminData) downloadCSV(`farmer_earnings_${month}_page_${page}`, ["Farmer ID", "Name", "Village", "Days supplied", "Collections", "Morning", "Evening", "Litres", `Earnings (${adminData.currency})`], adminData.results.map(row => [row.farmer_id, row.name, row.village, row.days_supplied, row.collection_count, row.morning_collections, row.evening_collections, row.quantity_litres, row.earnings]));
    else if (farmerData) downloadCSV(`my_earnings_${month}`, ["Date", "Collections", "Morning", "Evening", "Litres", `Earnings (${farmerData.currency})`], farmerData.daily_breakdown.map(row => [row.date, row.collection_count, row.morning_collections, row.evening_collections, row.quantity_litres, row.earnings]));
  }

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3 sm:gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#DDE8DF] bg-white text-[#0B5D3B]"><IndianRupee className="h-6 w-6" /></div><div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B756E]">Milk collection value</p><h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">{admin ? "Farmer Monthly Earnings" : "My Monthly Earnings"}</h1><p className="mt-1.5 text-sm text-[#6B756E]">{admin ? "Monthly earnings and milk supply across farmer accounts." : "Your milk supply and earnings, broken down by date."}</p></div></div><Button variant="outline" disabled={isLoading || !hasRows || !!error} onClick={exportRows}><Download className="h-4 w-4" />{admin ? "Export this page" : "Export CSV"}</Button></header>

    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between"><div className="w-full space-y-2 sm:max-w-xs"><label htmlFor="earnings-month" className="block text-xs font-semibold text-[#53645A]">Earnings month</label><input id="earnings-month" type="month" required value={month} aria-invalid={!readyMonth || !!fields.month?.length} aria-describedby="earnings-month-error" onChange={event => { setMonth(event.target.value); setPage(1); }} className="min-h-12 w-full min-w-0 rounded-xl border border-[#DDE8DF] bg-white px-4 py-3 text-base text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-4 focus:ring-[#3A8F3D]/10 sm:text-sm" /><div id="earnings-month-error">{!readyMonth && <p className="text-xs text-[#D9534F]">Choose a valid month.</p>}{fields.month?.map((message, index) => <p key={index} className="text-xs text-[#D9534F]">{message}</p>)}</div></div><div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end"><p className="text-sm font-semibold text-[#0B5D3B]">{monthLabel}</p><Button variant="outline" onClick={reload} disabled={isLoading || !readyMonth}><RefreshCw className="h-4 w-4" />Refresh</Button></div></Card>

    <div className={`grid gap-3 sm:grid-cols-2 ${admin ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
      {admin && <><StatCard title="Total Farmers" value={adminData?.summary.total_farmers ?? "Unavailable"} subvalue="All farmer accounts" isLoading={isLoading} icon={Users} /><StatCard title="Farmers Supplied" value={adminData?.summary.farmers_with_collections ?? "Unavailable"} subvalue="With collections this month" isLoading={isLoading} icon={Users} /></>}
      {!admin && <StatCard title="Days Supplied" value={summary?.days_supplied ?? "Unavailable"} subvalue="Distinct collection dates" isLoading={isLoading} icon={CalendarDays} />}
      <StatCard title="Total Milk" value={summary ? `${summary.quantity_litres} L` : "Unavailable"} subvalue={monthLabel} isLoading={isLoading} icon={Milk} />
      <StatCard title="Monthly Earnings" value={summary ? money(summary.earnings) : "Unavailable"} subvalue="Milk collection value" isLoading={isLoading} icon={IndianRupee} />
    </div>

    <Card className="p-5 sm:p-6"><div className={`grid grid-cols-1 gap-5 min-[400px]:grid-cols-2 ${admin ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
      {[...(admin ? [{label: "Days with collections", value: summary?.days_supplied, icon: CalendarDays}] : []), {label: "Total collections", value: summary?.collection_count, icon: Milk}, {label: "Morning collections", value: summary?.morning_collections, icon: Sun}, {label: "Evening collections", value: summary?.evening_collections, icon: Moon}].map(({label, value, icon: Icon}) => <div key={label} className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F5EB] text-[#3A8F3D]"><Icon className="h-5 w-5" /></div><div><p className="text-xs text-[#6B756E]">{label}</p>{isLoading ? <LoadingSpinner label={`Loading ${label.toLowerCase()}...`} className="mt-1" /> : <p className="mt-1 text-lg font-bold text-[#17231D]">{value ?? "Unavailable"}</p>}</div></div>)}
    </div><p className="mt-5 border-t border-[#E6EDE7] pt-4 text-xs leading-relaxed text-[#6B756E]">{admin ? "Days with collections counts distinct calendar dates across all farmers. Summary totals cover every page." : "Morning and evening deliveries on the same date count as one day supplied."}</p></Card>

    <div className="flex items-start gap-2.5 rounded-2xl border border-[#DDE8DF] bg-[#F3F7EE] p-4 text-xs leading-relaxed text-[#53645A]"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>Earnings are calculated from saved milk collections. They do not indicate money received or a paid/pending balance.</p></div>

    <Card className="overflow-hidden p-0" aria-busy={isLoading}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDE8DF] p-5"><div><h2 className="font-bold text-[#17231D]">{admin ? "Farmer earnings" : "Daily breakdown"}</h2><p className="mt-1 text-xs text-[#6B756E]">{admin ? `${monthLabel} · Summary covers all pages` : `${monthLabel} · Oldest date first`}</p></div>{adminData && <span className="rounded-full bg-[#EEF5E8] px-3 py-1 text-xs font-semibold text-[#0B5D3B]">{adminData.count} farmers</span>}{farmerData && <div className="text-sm font-semibold text-[#0B5D3B]">{farmerData.farmer.name} <span className="font-mono text-xs">({farmerData.farmer.farmer_id})</span></div>}</div>
      {!readyMonth ? <div className="p-10 text-center text-sm text-[#6B756E]">Choose a month to view earnings.</div> : isLoading ? <DataLoader label="Loading monthly earnings..." className="min-h-72" /> : error ? <div role="alert" className="space-y-4 p-8 text-center"><p className="text-sm text-[#D9534F]">{error}</p>{fields.non_field_errors?.map((message, index) => <p key={index} className="text-xs text-[#D9534F]">{message}</p>)}<Button variant="outline" onClick={reload}>Try Again</Button></div> : !hasRows ? <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center"><Milk className="mb-4 h-10 w-10 text-[#8AA582]" /><h3 className="font-bold text-[#17231D]">{admin ? "No farmers to show" : "No milk collections this month"}</h3><p className="mt-2 text-sm text-[#6B756E]">Choose another month to view available earnings.</p></div> : <>
        <div className="hidden overflow-x-auto lg:block"><table className="w-full text-left text-sm"><thead className="border-b border-[#DDE8DF] bg-[#FAFCF8] text-xs uppercase tracking-wider text-[#6B756E]"><tr>{(admin ? ["Farmer", "Village", "Days supplied", "Collections", "Morning", "Evening", "Litres", "Earnings"] : ["Date", "Collections", "Morning", "Evening", "Litres", "Earnings"]).map(label => <th key={label} scope="col" className="whitespace-nowrap px-4 py-3.5">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#DDE8DF]">
          {adminData?.results.map(row => <tr key={row.id} className="hover:bg-[#FAFCF8]"><td className="px-4 py-4"><p className="font-semibold text-[#17231D]">{row.name}</p><p className="mt-1 font-mono text-xs text-[#0B5D3B]">{row.farmer_id}</p></td><td className="px-4 py-4 text-[#6B756E]">{row.village || "Not provided"}</td>{[row.days_supplied, row.collection_count, row.morning_collections, row.evening_collections].map((value, index) => <td key={index} className="px-4 py-4">{value}</td>)}<td className="whitespace-nowrap px-4 py-4 font-semibold text-[#0B5D3B]">{row.quantity_litres} L</td><td className="whitespace-nowrap px-4 py-4 font-bold">{money(row.earnings)}</td></tr>)}
          {farmerData?.daily_breakdown.map(row => <tr key={row.date} className="hover:bg-[#FAFCF8]"><td className="whitespace-nowrap px-4 py-4 font-semibold">{formatDate(row.date)}</td>{[row.collection_count, row.morning_collections, row.evening_collections].map((value, index) => <td key={index} className="px-4 py-4">{value}</td>)}<td className="px-4 py-4 font-semibold text-[#0B5D3B]">{row.quantity_litres} L</td><td className="px-4 py-4 font-bold">{money(row.earnings)}</td></tr>)}
        </tbody></table></div>
        <div className="grid gap-4 bg-[#FAFCF8] p-4 sm:grid-cols-2 lg:hidden">
          {adminData?.results.map(row => <article key={row.id} className="min-w-0 space-y-4 rounded-2xl border border-[#DDE8DF] bg-white p-4"><div><h3 className="break-words font-bold text-[#17231D]">{row.name}</h3><p className="mt-1 text-xs text-[#6B756E]"><span className="font-mono text-[#0B5D3B]">{row.farmer_id}</span> · {row.village || "Village not provided"}</p></div><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-lg font-bold text-[#0B5D3B]">{row.quantity_litres} L</span><span className="text-lg font-bold">{money(row.earnings)}</span></div><dl className="grid grid-cols-2 gap-3 rounded-xl bg-[#FAFCF8] p-3 text-xs">{[{label: "Days supplied", value: row.days_supplied}, {label: "Collections", value: row.collection_count}, {label: "Morning", value: row.morning_collections}, {label: "Evening", value: row.evening_collections}].map(item => <div key={item.label}><dt className="text-[#6B756E]">{item.label}</dt><dd className="mt-1 font-semibold">{item.value}</dd></div>)}</dl></article>)}
          {farmerData?.daily_breakdown.map(row => <article key={row.date} className="space-y-4 rounded-2xl border border-[#DDE8DF] bg-white p-4"><h3 className="font-bold text-[#17231D]">{formatDate(row.date)}</h3><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-lg font-bold text-[#0B5D3B]">{row.quantity_litres} L</span><span className="text-lg font-bold">{money(row.earnings)}</span></div><dl className="grid grid-cols-3 gap-3 rounded-xl bg-[#FAFCF8] p-3 text-xs">{[{label: "Collections", value: row.collection_count}, {label: "Morning", value: row.morning_collections}, {label: "Evening", value: row.evening_collections}].map(item => <div key={item.label}><dt className="text-[#6B756E]">{item.label}</dt><dd className="mt-1 font-semibold">{item.value}</dd></div>)}</dl></article>)}
        </div>
      </>}
      {adminData && <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#DDE8DF] p-4 text-xs text-[#6B756E]"><span>{adminData.count ? `Showing ${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + adminData.results.length} of ${adminData.count}` : "0 farmers"}</span><div className="flex flex-wrap items-center gap-3"><label htmlFor="earnings-page-size">Per page</label><SelectDropdown id="earnings-page-size" className="w-24" size="sm" value={String(pageSize)} onChange={value => { setPageSize(Number(value)); setPage(1); }} options={[10, 20, 50].map(value => ({value: String(value), label: String(value)}))} /><span>Page {page} of {totalPages}</span><Button variant="outline" size="sm" aria-label="Previous earnings page" disabled={!adminData.previous} onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="sm" aria-label="Next earnings page" disabled={!adminData.next} onClick={() => setPage(value => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div>}
    </Card>
  </div>;
}

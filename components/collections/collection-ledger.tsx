"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Filter, Milk, Moon, Plus, Receipt, RotateCcw, Search, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useMilkCollections } from "@/lib/hooks/use-milk-collections";
import { useFarmerOptions } from "@/lib/hooks/use-farmer-options";
import { MilkCollectionRecord } from "@/lib/services/milk-collections-api";
import { UserRole } from "@/lib/types";
import { downloadCSV } from "@/lib/services/report.service";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataLoader } from "@/components/ui/loading-spinner";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { Modal } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

function money(value: string) {
  return Number(value).toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function reading(value: string | null | undefined, unit = "") {
  return value === null || value === undefined || value === "" ? "Not recorded" : `${value}${unit}`;
}

export function CollectionLedger({ role }: { role: UserRole }) {
  const admin = role === "admin";
  const { user } = useAuth();
  const farmerOptions = useFarmerOptions();
  const [search, setSearch] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [shift, setShift] = useState("");
  const [dateMode, setDateMode] = useState("exact");
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [receipt, setReceipt] = useState<MilkCollectionRecord | null>(null);
  const invalidRange = dateMode === "range" && !!from && !!to && from > to;
  const list = useMilkCollections(role, { search, farmer: farmerId, shift, page, page_size: pageSize,
    ...(dateMode === "exact" ? { date } : { date_from: from, date_to: to }) }, !invalidRange);
  const data = invalidRange ? undefined : list.data;
  const loading = !invalidRange && list.isLoading;
  const hasFilters = !!(search || farmerId || shift || (dateMode === "exact" ? date : from || to));
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / pageSize));
  const fieldClass = "min-h-12 w-full min-w-0 rounded-xl border border-[#DDE8DF] bg-white px-4 py-3 text-base text-[#17231D] placeholder:text-[#929B95] focus:outline-none focus:border-[#3A8F3D] focus:ring-4 focus:ring-[#3A8F3D]/10 sm:text-sm";

  function clear() { setSearch(""); setFarmerId(""); setShift(""); setDate(""); setFrom(""); setTo(""); setDateMode("exact"); setPage(1); }
  function farmerInfo(record: MilkCollectionRecord) {
    const option = farmerOptions.farmers.find(farmer => farmer.id === record.farmer);
    return {
      name: record.farmer_name ?? option?.name ?? (!admin ? user?.name : undefined),
      code: record.farmer_id ?? option?.farmer_id ?? (!admin ? user?.farmer_id : undefined),
    };
  }
  function exportPage() {
    if (!data?.results.length) return;
    downloadCSV(`${role}_milk_collections_page_${page}`, ["ID", "Date", "Farmer", "Farmer ID", "Shift", "Quantity (L)", "Rate (INR/L)", "Amount (INR)", "Fat", "SNF", "CLR", "Temperature", "Notes"],
      data.results.map(record => [record.id, record.collection_date, farmerInfo(record).name ?? "", farmerInfo(record).code ?? "", record.shift, record.quantity_litres, record.rate_per_litre, record.amount, record.fat ?? "", record.snf ?? "", record.clr ?? "", record.temperature ?? "", record.notes ?? ""]));
  }
  function fieldError(key: string) { return list.fields[key]?.map((message, index) => <p key={index} className="mt-1 text-xs text-[#D9534F]">{message}</p>); }
  function shiftBadge(record: MilkCollectionRecord) {
    return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${record.shift === "morning" ? "bg-amber-50 text-amber-800" : "bg-[#EEF4EA] text-[#0B5D3B]"}`}>{record.shift === "morning" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}{record.shift === "morning" ? "Morning" : "Evening"}</span>;
  }

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#DDE8DF] bg-white text-[#0B5D3B]"><Milk className="h-6 w-6" /></div><div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B756E]">{admin ? "Dairy intake" : "Your milk history"}</p><h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">{admin ? "Milk Collections Ledger" : "My Milk Collections"}</h1><p className="mt-1.5 text-sm text-[#6B756E]">{admin ? "View recorded collections across all farmer accounts." : "View your deliveries, quality readings, and collection amounts."}</p></div></div>
      <div className="flex flex-wrap gap-3"><Button variant="outline" onClick={exportPage} disabled={loading || !data?.results.length}><Download className="h-4 w-4" />Export this page</Button>{admin && <Link href="/admin/add-collection"><Button><Plus className="h-4 w-4" />Add Collection</Button></Link>}</div>
    </header>

    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard title="Collections" value={data?.count ?? "Unavailable"} subvalue="Matching current filters" isLoading={loading} icon={Receipt} />
      <StatCard title="Total Milk" value={data ? `${data.summary.quantity_litres} L` : "Unavailable"} subvalue="Across all matching records" isLoading={loading} icon={Milk} />
      <StatCard title="Total Amount" value={data ? money(data.summary.amount) : "Unavailable"} subvalue="Calculated by the server" isLoading={loading} />
    </div>

    <Card className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-bold text-[#17231D]"><Filter className="h-4 w-4 text-[#3A8F3D]" />Find a collection</h2>{hasFilters && <button type="button" onClick={clear} className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-[#0B5D3B]"><RotateCcw className="h-3.5 w-3.5" />Reset filters</button>}</div>
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {admin && <><div className="space-y-2"><label htmlFor="milk-search" className="block text-xs font-semibold text-[#53645A]">Search farmers</label><div className="relative"><Search className="absolute left-3.5 top-4 h-4 w-4 text-[#6B756E]" /><input id="milk-search" type="search" placeholder="Farmer name or ID" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className={`${fieldClass} pl-10`} /></div>{fieldError("search")}</div>
          <div className="space-y-2"><label htmlFor="milk-farmer" className="block text-xs font-semibold text-[#53645A]">Farmer</label><SelectDropdown id="milk-farmer" value={farmerId} searchable disabled={farmerOptions.isLoading || !!farmerOptions.error} placeholder={farmerOptions.isLoading ? "Loading farmers..." : "All farmers"} options={[{ value: "", label: "All farmers" }, ...farmerOptions.farmers.map(farmer => ({ value: String(farmer.id), label: `${farmer.name} (${farmer.farmer_id})` }))]} onChange={value => { setFarmerId(value); setPage(1); }} />{fieldError("farmer")}{farmerOptions.error && <p role="alert" className="text-xs text-[#D9534F]">{farmerOptions.error} <button type="button" className="underline" onClick={farmerOptions.reload}>Retry</button></p>}</div></>}
        <div className="space-y-2"><label htmlFor="milk-shift" className="block text-xs font-semibold text-[#53645A]">Collection shift</label><SelectDropdown id="milk-shift" value={shift} options={[{ value: "", label: "All shifts" }, { value: "morning", label: "Morning shift" }, { value: "evening", label: "Evening shift" }]} onChange={value => { setShift(value); setPage(1); }} />{fieldError("shift")}</div>
        <div className="space-y-2"><label htmlFor="milk-date-mode" className="block text-xs font-semibold text-[#53645A]">Date filter</label><SelectDropdown id="milk-date-mode" value={dateMode} options={[{ value: "exact", label: "Exact date" }, { value: "range", label: "Date range" }]} onChange={value => { setDateMode(value); setPage(1); }} /></div>
        {dateMode === "exact" ? <div className="min-w-0 space-y-2"><label htmlFor="milk-date" className="block text-xs font-semibold text-[#53645A]">Collection date</label><input id="milk-date" type="date" value={date} onChange={event => { setDate(event.target.value); setPage(1); }} className={fieldClass} />{fieldError("date")}</div> : <>
          <div className="min-w-0 space-y-2"><label htmlFor="milk-from" className="block text-xs font-semibold text-[#53645A]">From date</label><input id="milk-from" type="date" value={from} max={to || undefined} onChange={event => { setFrom(event.target.value); setPage(1); }} className={fieldClass} />{fieldError("date_from")}</div>
          <div className="min-w-0 space-y-2"><label htmlFor="milk-to" className="block text-xs font-semibold text-[#53645A]">To date</label><input id="milk-to" type="date" value={to} min={from || undefined} aria-invalid={invalidRange} onChange={event => { setTo(event.target.value); setPage(1); }} className={fieldClass} />{fieldError("date_to")}{invalidRange && <p role="alert" className="text-xs text-[#D9534F]">To date must be on or after the from date.</p>}</div>
        </>}
      </div>
    </Card>

    <Card className="overflow-hidden p-0" aria-busy={loading}>
      <div className="flex items-center justify-between gap-3 border-b border-[#E6EDE7] px-4 py-5 sm:px-6"><div><h2 className="text-base font-bold text-[#17231D]">Collection history</h2><p className="mt-1 text-xs text-[#6B756E]">Morning and evening milk deliveries</p></div>{data && <span className="rounded-full border border-[#DDE8DF] bg-[#F4F8F0] px-3 py-1 text-xs font-semibold text-[#0B5D3B]">{data.count} records</span>}</div>
      {invalidRange ? <div className="p-8 text-center text-sm text-[#6B756E]">Choose a valid date range to view collections.</div> : loading ? <DataLoader label="Loading collections..." className="min-h-72" /> : list.error ? <div role="alert" className="space-y-4 p-8 text-center"><p className="text-sm text-[#D9534F]">{list.error}</p>{fieldError("non_field_errors")}<Button variant="outline" onClick={list.reload}>Try Again</Button></div> : !data?.results.length ? <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center"><div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#DFE9D8] bg-[#EBF2E3]"><Milk className="h-9 w-9 text-[#72966A]" strokeWidth={1.5} /></div><h3 className="text-lg font-bold text-[#17231D]">{hasFilters ? "No matching collections" : "No collections to show yet"}</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6B756E]">{hasFilters ? "Try a different date, shift, or farmer filter." : "Recorded milk deliveries will appear here."}</p>{hasFilters && <Button variant="outline" onClick={clear} className="mt-5">Clear Filters</Button>}</div> : <>
        <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b border-[#DDE8DF] bg-[#FAFCF8] text-xs uppercase tracking-wider text-[#6B756E]"><tr>{["Date", ...(admin ? ["Farmer"] : []), "Shift", "Quantity", "Fat", "SNF", "Rate / L", "Amount", "Details"].map(label => <th key={label} scope="col" className="whitespace-nowrap px-4 py-3.5">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#DDE8DF]">{data.results.map(record => <tr key={record.id} className="hover:bg-[#FAFCF8]"><td className="px-4 py-4 font-semibold text-[#17231D]">{formatDate(record.collection_date)}<span className="mt-1 block text-xs font-normal text-[#6B756E]">#{record.id}</span></td>{admin && <td className="px-4 py-4"><span className="font-semibold">{farmerInfo(record).name ?? "Not provided"}</span><span className="block text-xs text-[#6B756E]">{farmerInfo(record).code ?? ""}</span></td>}<td className="px-4 py-4">{shiftBadge(record)}</td><td className="px-4 py-4 font-bold text-[#0B5D3B]">{record.quantity_litres} L</td><td className="px-4 py-4">{reading(record.fat, "%")}</td><td className="px-4 py-4">{reading(record.snf, "%")}</td><td className="px-4 py-4">{money(record.rate_per_litre)}</td><td className="px-4 py-4 font-bold">{money(record.amount)}</td><td className="px-4 py-4"><Button size="sm" variant="ghost" onClick={() => setReceipt(record)}><Receipt className="h-4 w-4" />View</Button></td></tr>)}</tbody></table></div>
        <div className="grid gap-4 bg-[#FAFCF8] p-4 sm:grid-cols-2 lg:hidden">{data.results.map(record => <article key={record.id} className="min-w-0 space-y-4 rounded-2xl border border-[#DDE8DF] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[#17231D]">{formatDate(record.collection_date)}</p><p className="mt-1 text-xs text-[#6B756E]">#{record.id}</p></div>{shiftBadge(record)}</div>{admin && <p className="break-words text-sm font-semibold">{farmerInfo(record).name ?? "Not provided"} <span className="font-normal text-[#6B756E]">{farmerInfo(record).code}</span></p>}<div className="flex flex-wrap justify-between gap-2"><span className="text-xl font-bold text-[#0B5D3B]">{record.quantity_litres} L</span><span className="font-bold">{money(record.amount)}</span></div><div className="grid grid-cols-3 gap-2 rounded-xl bg-[#FAFCF8] p-3 text-xs">{[{ label: "Fat", value: reading(record.fat, "%") }, { label: "SNF", value: reading(record.snf, "%") }, { label: "Rate / L", value: money(record.rate_per_litre) }].map(item => <div key={item.label}><p className="text-[#6B756E]">{item.label}</p><p className="mt-1 break-words font-semibold">{item.value}</p></div>)}</div><Button variant="outline" className="w-full" onClick={() => setReceipt(record)}><Receipt className="h-4 w-4" />View details</Button></article>)}</div>
      </>}
      {data && <nav aria-label="Collections pagination" className="flex min-w-0 flex-col gap-4 border-t border-[#DDE8DF] p-4 text-xs text-[#6B756E] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-start">
          <span>{data.count ? `Showing ${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + data.results.length} of ${data.count}` : "0 records"}</span>
          <span aria-live="polite" className="whitespace-nowrap font-medium text-[#53645A]">Page {page} of {totalPages}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <label htmlFor="milk-page-size" className="whitespace-nowrap">Per page</label>
            <SelectDropdown id="milk-page-size" className="w-24 shrink-0 [&>button]:min-h-11" size="sm" value={String(pageSize)} options={[10, 20, 50].map(value => ({ value: String(value), label: String(value) }))} onChange={value => { setPageSize(Number(value)); setPage(1); }} />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button size="sm" variant="outline" className="min-h-11 min-w-0 px-3" aria-label="Previous collections page" disabled={!data.previous} onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft className="h-4 w-4 shrink-0" /><span>Previous</span></Button>
            <Button size="sm" variant="outline" className="min-h-11 min-w-0 px-3" aria-label="Next collections page" disabled={!data.next} onClick={() => setPage(value => value + 1)}><span>Next</span><ChevronRight className="h-4 w-4 shrink-0" /></Button>
          </div>
        </div>
      </nav>}
    </Card>

    <Modal isOpen={!!receipt} onClose={() => setReceipt(null)} title="Milk Collection Details" description="Recorded details for this milk delivery" maxWidth="md">
      {receipt && <dl className="divide-y divide-[#E6EDE7]">{[
        { label: "Collection ID", value: String(receipt.id) }, { label: "Farmer", value: farmerInfo(receipt).name ?? "Not provided" }, { label: "Farmer ID", value: farmerInfo(receipt).code ?? "Not provided" },
        { label: "Village", value: receipt.village || "Not provided" }, { label: "Date", value: formatDate(receipt.collection_date) }, { label: "Shift", value: receipt.shift === "morning" ? "Morning" : "Evening" }, { label: "Quantity", value: `${receipt.quantity_litres} L` }, { label: "Rate / L", value: money(receipt.rate_per_litre) }, { label: "Amount", value: money(receipt.amount) },
        { label: "Fat", value: reading(receipt.fat, "%") }, { label: "SNF", value: reading(receipt.snf, "%") }, { label: "CLR", value: reading(receipt.clr) }, { label: "Temperature", value: reading(receipt.temperature, " °C") }, { label: "Notes", value: receipt.notes || "Not recorded" }, ...(receipt.created_at ? [{ label: "Recorded at", value: new Date(receipt.created_at).toLocaleString("en-IN") }] : []),
      ].map(item => <div key={item.label} className="flex justify-between gap-4 py-3 text-sm"><dt className="shrink-0 text-[#6B756E]">{item.label}</dt><dd className="break-words text-right font-semibold">{item.value}</dd></div>)}</dl>}
    </Modal>
  </div>;
}

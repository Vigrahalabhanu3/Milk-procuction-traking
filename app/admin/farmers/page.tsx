"use client";

import { SelectDropdown } from "@/components/ui/select-dropdown";

import { useState } from "react";
import Link from "next/link";
import { Users, UserCheck, UserX, Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataLoader, LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAdminFarmers } from "@/lib/hooks/use-admin-farmers";
import { formatDate } from "@/lib/utils";

export default function AdminFarmersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, error, isLoading, reload } = useAdminFarmers({ search, status, page, pageSize });
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / pageSize));

  function resetFilters() { setSearch(""); setStatus(""); setPage(1); }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17231D]">Farmer Directory & Accounts</h1><p className="mt-1 text-sm text-[#6B756E]">View registered farmers and their account status.</p></div>
      <Link href="/admin/register-farmer"><Button size="sm"><Plus className="h-4 w-4" />Register Farmer</Button></Link>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard title="Total Farmers" isLoading={isLoading} value={data?.summary.total ?? "Unavailable"} subvalue="Registered accounts" icon={Users} />
      <StatCard title="Active Accounts" isLoading={isLoading} value={data?.summary.active ?? "Unavailable"} subvalue="Accounts enabled to sign in" icon={UserCheck} />
      <StatCard title="Inactive Accounts" isLoading={isLoading} value={data?.summary.inactive ?? "Unavailable"} subvalue="Accounts currently disabled" icon={UserX} />
    </div>

    <Card className="space-y-4 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="space-y-1.5"><label htmlFor="farmer-search" className="text-xs font-semibold text-[#17231D]">Search farmers</label><div className="relative"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B756E]" /><input id="farmer-search" type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name or farmer ID" className="w-full rounded-xl border border-[#DDE8DF] bg-[#FAFCF8] py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#3A8F3D]" /></div></div>
        <div className="space-y-1.5"><label htmlFor="account-status" className="text-xs font-semibold text-[#17231D]">Account status</label><SelectDropdown id="account-status" ariaLabel="Status" value={String(status)} onChange={selectedValue => { setStatus(selectedValue as typeof status); setPage(1); }} options={[{ value: "", label: `All accounts` }, { value: "active", label: `Active accounts` }, { value: "inactive", label: `Inactive accounts` }]} /></div>
      </div>
      {(search || status) && <div className="flex items-center justify-between border-t border-[#DDE8DF] pt-3 text-xs text-[#6B756E]"><span aria-live="polite">{data ? `${data.count} matching farmer${data.count === 1 ? "" : "s"}` : isLoading ? <LoadingSpinner label="Searching farmers..." showLabel /> : "Results unavailable"}</span><button type="button" onClick={resetFilters} className="font-semibold text-[#0B5D3B] hover:underline">Reset filters</button></div>}
    </Card>

    <Card className="overflow-hidden p-0" aria-busy={isLoading}>
      <div className="flex items-center justify-between gap-3 border-b border-[#DDE8DF] p-4 sm:px-5"><h2 className="text-sm font-bold text-[#17231D]">Farmer accounts</h2><span className="text-xs text-[#6B756E]" aria-live="polite">{data ? `${data.count} results` : isLoading ? <LoadingSpinner label="Loading results..." /> : "Unavailable"}</span></div>
      {error ? <div role="alert" className="space-y-3 p-6 text-sm text-[#D9534F]"><p>{error}</p><Button variant="outline" size="sm" onClick={reload}>Try Again</Button></div> : isLoading ? <DataLoader label="Loading farmer accounts..." /> : !data?.results.length ? <EmptyState title="No farmers found" description={search || status ? "Try a different name, farmer ID, or account status." : "Register a farmer to get started."} actionText={search || status ? "Clear Filters" : undefined} onAction={resetFilters} /> : <>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-[#DDE8DF] bg-[#FAFCF8] text-xs uppercase tracking-wider text-[#6B756E]"><tr>{["Farmer ID", "Farmer Name", "Village", "Account Status", "Date Joined"].map(title => <th key={title} scope="col" className="whitespace-nowrap px-5 py-3.5 font-semibold">{title}</th>)}</tr></thead><tbody className="divide-y divide-[#E6EDE7]">{data.results.map(farmer => <tr key={farmer.id} className="hover:bg-[#FAFCF8]"><td className="px-5 py-4 font-mono font-semibold text-[#0B5D3B]">{farmer.farmer_id}</td><td className="px-5 py-4 font-semibold text-[#17231D]">{farmer.name}</td><td className="px-5 py-4 text-[#6B756E]">{farmer.village?.trim() || <span aria-label="Village not provided">—</span>}</td><td className="px-5 py-4"><StatusBadge status={farmer.status} /></td><td className="whitespace-nowrap px-5 py-4 text-[#6B756E]">{formatDate(farmer.date_joined)}</td></tr>)}</tbody></table></div>
      </>}
      {data && <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#DDE8DF] p-4 text-xs text-[#6B756E]">
        <span>{data.count ? `Showing ${(page - 1) * pageSize + 1}–${Math.min((page - 1) * pageSize + data.results.length, data.count)} of ${data.count}` : "0 results"}</span>
        <div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2">Per page<SelectDropdown id="farmers-pageSize" ariaLabel="Farmers per page" value={String(pageSize)} onChange={selectedValue => { setPageSize(Number(selectedValue)); setPage(1); }} options={[...[10, 20, 50].map(size => ({ value: String(size), label: `${size}` }))]} className="w-24" size="sm" /></label><span>Page {page} of {totalPages}</span><Button variant="outline" size="sm" aria-label="Previous page" disabled={!data.previous || isLoading} onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="sm" aria-label="Next page" disabled={!data.next || isLoading} onClick={() => setPage(value => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div>
      </div>}
    </Card>
    <p className="text-xs leading-relaxed text-[#6B756E]">Active and inactive refer to account access. Milk supply and producer activity will be available when milk records are connected.</p>
  </div>;
}

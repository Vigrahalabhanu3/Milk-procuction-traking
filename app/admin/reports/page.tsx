"use client";

import { useRef, useState } from "react";
import { Award, CalendarDays, ChevronLeft, ChevronRight, Download, Eye, Filter, IndianRupee, Milk, Printer, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, FieldErrors, saveReportDownload } from "@/lib/api/client";
import { useFarmerOptions } from "@/lib/hooks/use-farmer-options";
import { useReportPreview } from "@/lib/hooks/use-report-preview";
import { isDateReport, ReportFilters, ReportType, reportPath, reportCell, reportColumns, reportFieldLabel, validateReportFilters } from "@/lib/services/reports-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { DataLoader } from "@/components/ui/loading-spinner";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { useToast } from "@/components/ui/toast";

const reports = [
  {type: "daily", title: "Daily Milk Report", description: "Daily morning and evening milk totals, quality averages, and collection value.", icon: Milk},
  {type: "farmer", title: "Farmer Production Report", description: "Farmer-wise supply days, shift counts, litres, quality averages, and earnings.", icon: Users},
  {type: "earnings", title: "Monthly Earnings Report", description: "Monthly collection earnings for all farmer accounts, including zero-collection accounts.", icon: IndianRupee},
  {type: "quality", title: "Milk Quality Report", description: "Recorded fat, SNF, CLR, and temperature for each filtered milk collection.", icon: Award},
  {type: "monthly", title: "Monthly Summary Report", description: "Monthly milk production, farmer participation, quality, and collection earnings.", icon: CalendarDays},
] as const;
function defaults(): ReportFilters {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return {month, date_from: `${month}-01`, date_to: `${month}-${String(now.getDate()).padStart(2, "0")}`, farmer: "", shift: "", search: ""};
}

export default function AdminReportsPage() {
  const { downloadReport } = useAuth();
  const { success } = useToast();
  const farmers = useFarmerOptions();
  const [filters, setFilters] = useState<ReportFilters>(defaults);
  const [active, setActive] = useState<ReportType | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [exporting, setExporting] = useState<ReportType | null>(null);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const exportBusy = useRef(false);
  const validation = active ? validateReportFilters(active, filters) : {};
  const preview = useReportPreview(active ? reportPath(active, filters, page, pageSize) : "", active !== null && !Object.keys(validation).length);
  const data = preview.data;
  const columns = active ? reportColumns[active] : [];
  const rows = active === "monthly" ? Object.entries(data?.summary ?? {}).map(([metric, value]) => ({metric, value})) : data?.results ?? [];
  const title = reports.find(report => report.type === active)?.title ?? "Report";
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / pageSize));
  const fieldClass = "min-h-12 w-full min-w-0 rounded-xl border border-[#DDE8DF] bg-white px-4 py-3 text-base text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-4 focus:ring-[#3A8F3D]/10 sm:text-sm";

  function change(key: keyof ReportFilters, value: string) { setFilters(previous => ({...previous, [key]: value})); setPage(1); setFields({}); setError(""); }
  function fieldError(key: string) { return (fields[key] ?? preview.fields[key])?.map((message, index) => <p key={index} className="mt-1 text-xs text-[#D9534F]">{message}</p>); }
  function view(type: ReportType) {
    const errors = validateReportFilters(type, filters); setFields(errors); setError("");
    if (Object.keys(errors).length) { setError("Please check the report filters."); return; }
    setActive(type); setPage(1);
  }
  async function exportCSV(type: ReportType) {
    if (exportBusy.current) return;
    const errors = validateReportFilters(type, filters); setFields(errors); setError("");
    if (Object.keys(errors).length) { setError("Please check the report filters."); return; }
    exportBusy.current = true; setExporting(type);
    try {
      const period = isDateReport(type) ? `${filters.date_from}_${filters.date_to}` : filters.month;
      const file = await downloadReport(reportPath(type, filters, page, pageSize, true), `${type}_report_${period}.csv`);
      saveReportDownload(file);
      success("Report CSV download started.");
    } catch (error) {
      if (error instanceof ApiError) { setError(error.message); setFields(error.fields); }
      else setError("Unable to download the report. Please try again.");
    } finally { exportBusy.current = false; setExporting(null); }
  }
  function printPreview() {
    const container = document.getElementById("report-preview")?.closest('[role="dialog"]')?.parentElement;
    if (!container) return;
    container.setAttribute("data-report-print", "true");
    document.body.classList.add("printing-report");
    try { window.print(); }
    finally { document.body.classList.remove("printing-report"); container.removeAttribute("data-report-print"); }
  }
  function cell(key: string, value: unknown) {
    if (key === "metric") return reportFieldLabel(String(value));
    if (value === null || value === undefined) return "—";
    if (key === "earnings" && data?.currency) return Number(value).toLocaleString("en-IN", {style: "currency", currency: data.currency, minimumFractionDigits: 2, maximumFractionDigits: 2});
    return reportCell(value);
  }

  return <div className="space-y-6">
    <div className="no-print"><h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">Reports & Exports</h1><p className="mt-1.5 text-sm text-[#6B756E]">Preview report data or download all matching records as CSV.</p></div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#D9534F]">{error}</div>}
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] no-print">
      <Card className="space-y-4 p-5 sm:p-6"><div><h2 className="flex items-center gap-2 text-sm font-bold text-[#17231D]"><Filter className="h-4 w-4 text-[#3A8F3D]" />Date report filters</h2><p className="mt-1 text-xs text-[#6B756E]">Applies to Daily Milk, Farmer Production, and Milk Quality reports.</p></div><div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-2"><label htmlFor="report-from" className="text-xs font-semibold text-[#53645A]">From date *</label><input id="report-from" type="date" required value={filters.date_from} onChange={event => change("date_from", event.target.value)} className={fieldClass} />{fieldError("date_from")}</div>
        <div className="min-w-0 space-y-2"><label htmlFor="report-to" className="text-xs font-semibold text-[#53645A]">To date *</label><input id="report-to" type="date" required value={filters.date_to} onChange={event => change("date_to", event.target.value)} className={fieldClass} />{fieldError("date_to")}</div>
        <div className="space-y-2"><label htmlFor="report-farmer" className="text-xs font-semibold text-[#53645A]">Farmer</label><SelectDropdown id="report-farmer" value={filters.farmer} disabled={farmers.isLoading || !!farmers.error} searchable placeholder={farmers.isLoading ? "Loading farmers..." : "All farmers"} options={[{value: "", label: "All farmers"}, ...farmers.farmers.map(farmer => ({value: String(farmer.id), label: `${farmer.name} (${farmer.farmer_id})`}))]} onChange={value => change("farmer", value)} />{fieldError("farmer")}{farmers.error && <p role="alert" className="text-xs text-[#D9534F]">{farmers.error} <button type="button" className="underline" onClick={farmers.reload}>Retry</button></p>}</div>
        <div className="space-y-2"><label htmlFor="report-shift" className="text-xs font-semibold text-[#53645A]">Shift</label><SelectDropdown id="report-shift" value={filters.shift} options={[{value: "", label: "All shifts"}, {value: "morning", label: "Morning"}, {value: "evening", label: "Evening"}]} onChange={value => change("shift", value)} />{fieldError("shift")}</div>
        <div className="space-y-2 sm:col-span-2"><label htmlFor="report-search" className="text-xs font-semibold text-[#53645A]">Search farmer name or login ID</label><input id="report-search" type="search" value={filters.search} onChange={event => change("search", event.target.value)} placeholder="Farmer name or ID" className={fieldClass} />{fieldError("search")}</div>
      </div></Card>
      <Card className="space-y-4 p-5 sm:p-6"><div><h2 className="flex items-center gap-2 text-sm font-bold text-[#17231D]"><CalendarDays className="h-4 w-4 text-[#3A8F3D]" />Monthly report filter</h2><p className="mt-1 text-xs leading-relaxed text-[#6B756E]">Applies to Monthly Earnings and Monthly Summary. Date-report filters do not apply to these reports.</p></div><div className="space-y-2"><label htmlFor="report-month" className="text-xs font-semibold text-[#53645A]">Reporting month *</label><input id="report-month" type="month" required value={filters.month} onChange={event => change("month", event.target.value)} className={fieldClass} />{fieldError("month")}</div><p className="text-xs leading-relaxed text-[#6B756E]">Earnings are milk collection value, not payment transactions or received balances.</p></Card>
    </div>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 no-print">{reports.map(({type, title, description, icon: Icon}) => <Card key={type} hover className="flex flex-col justify-between p-6"><div><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B5D3B]/10 text-[#3A8F3D]"><Icon className="h-6 w-6" /></div><h2 className="text-lg font-bold text-[#17231D]">{title}</h2><p className="mt-2 text-xs leading-relaxed text-[#6B756E]">{description}</p></div><div className="mt-6 flex gap-2 border-t border-[#DDE8DF] pt-5"><Button variant="outline" size="sm" className="flex-1" onClick={() => view(type)}><Eye className="h-4 w-4" />View</Button><Button size="sm" className="flex-1" disabled={exporting !== null} isLoading={exporting === type} loadingText="Exporting..." onClick={() => exportCSV(type)}><Download className="h-4 w-4" />Export CSV</Button></div></Card>)}</div>

    <Modal isOpen={active !== null} onClose={() => setActive(null)} title={title} description="Preview page data and full-dataset summary totals." maxWidth="2xl">
      <div id="report-preview" className="space-y-4">
        <div className="rounded-xl border border-[#DDE8DF] bg-[#FAFCF8] p-4"><p className="font-bold text-[#0B5D3B]">DairyFlow · {title}</p><p className="mt-1 text-xs text-[#6B756E]">{active && isDateReport(active) ? `${filters.date_from} to ${filters.date_to}` : filters.month}{data?.currency ? ` · ${data.currency}` : ""}</p></div>
        {error && <p role="alert" className="text-sm text-[#D9534F]">{error}</p>}
        {Object.keys(validation).length ? <p role="alert" className="text-sm text-[#D9534F]">Please choose valid report dates.</p> : preview.isLoading ? <DataLoader label="Loading report..." /> : preview.error ? <div role="alert" className="space-y-3"><p className="text-sm text-[#D9534F]">{preview.error}</p>{Object.entries(preview.fields).map(([key, messages]) => <p key={key} className="text-xs text-[#D9534F]">{reportFieldLabel(key)}: {messages.join(" ")}</p>)}<Button variant="outline" onClick={preview.reload}>Try Again</Button></div> : data && <>
          {active !== "monthly" && data.summary && <details open className="rounded-xl border border-[#DDE8DF] p-4"><summary className="cursor-pointer text-sm font-bold text-[#17231D]">Full filtered totals</summary><dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">{Object.entries(data.summary).map(([key, value]) => <div key={key}><dt className="text-[#6B756E]">{reportFieldLabel(key)}</dt><dd className="mt-1 break-words font-semibold text-[#17231D]">{cell(key, value)}</dd></div>)}</dl></details>}
          <div className="max-h-96 overflow-auto rounded-xl border border-[#DDE8DF] print:max-h-none print:overflow-visible"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-[#FAFCF8] text-[#6B756E]"><tr>{columns.map(key => <th scope="col" key={key} className="whitespace-nowrap border-b border-[#DDE8DF] p-3 font-semibold">{reportFieldLabel(key)}</th>)}</tr></thead><tbody className="divide-y divide-[#E6EDE7]">{rows.length ? rows.map((row, index) => <tr key={index} className="hover:bg-[#FAFCF8]">{columns.map(key => <td key={key} className="whitespace-nowrap p-3 text-[#17231D]">{cell(key, (row as Record<string, unknown>)[key])}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-8 text-center text-[#6B756E]">No records match these filters.</td></tr>}</tbody></table></div>
          {active !== "monthly" && <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B756E] no-print"><span>{data.count ?? rows.length} matching rows · Page {page} of {totalPages}</span><div className="flex items-center gap-2"><label htmlFor="report-page-size">Per page</label><SelectDropdown id="report-page-size" className="w-24" size="sm" value={String(pageSize)} options={[20, 50, 100].map(value => ({value: String(value), label: String(value)}))} onChange={value => {setPageSize(Number(value)); setPage(1);}} /><Button variant="outline" size="sm" aria-label="Previous report page" disabled={!data.previous} onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="sm" aria-label="Next report page" disabled={!data.next} onClick={() => setPage(value => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div>}
        </>}
        <p className="text-xs text-[#6B756E] no-print">CSV exports every matching record, not just this preview page. Null quality readings remain empty cells in the downloaded CSV.</p>
        <div className="flex flex-wrap justify-end gap-2 border-t border-[#DDE8DF] pt-4 no-print"><Button variant="outline" onClick={() => setActive(null)}>Close</Button><Button variant="outline" disabled={!data || preview.isLoading || !!preview.error || !!Object.keys(validation).length} onClick={printPreview}><Printer className="h-4 w-4" />Print Preview</Button><Button disabled={exporting !== null || !active} isLoading={active !== null && exporting === active} loadingText="Exporting..." onClick={() => { if (active) void exportCSV(active); }}><Download className="h-4 w-4" />Export all CSV</Button></div>
      </div>
    </Modal>
  </div>;
}

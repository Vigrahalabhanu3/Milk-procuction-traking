"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, FieldErrors } from "@/lib/api/client";
import { collectionPayload, validateCollection } from "@/lib/services/milk-collections-api";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Milk, UserRound, CalendarDays, FlaskConical, Calculator, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useFarmerOptions } from "@/lib/hooks/use-farmer-options";
import { formatCurrency } from "@/lib/utils";

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const emptyFields = { date: "", shift: "", quantity: "", rate: "", fat: "", snf: "", clr: "", temperature: "", notes: "" };
const measurements = [
  { key: "fat", label: "Fat", unit: "%", step: "0.1", max: 100 },
  { key: "snf", label: "SNF", unit: "%", step: "0.1", max: 100 },
  { key: "clr", label: "CLR", unit: "reading", step: "0.1" },
  { key: "temperature", label: "Temperature", unit: "°C", step: "0.1" },
] as const;

export default function AddMilkCollectionPage() {
  const { protectedRequest } = useAuth();
  const router = useRouter();
  const { success } = useToast();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const submitting = useRef(false);
  const [form, setForm] = useState(() => ({ ...emptyFields, date: today() }));
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | "">("");
  const { farmers, count, isLoading, error, reload } = useFarmerOptions();
  const farmer = farmers.find(option => option.id === selectedFarmerId) ?? null;
  const quantity = Number(form.quantity);
  const rate = Number(form.rate);
  const hasEstimate = form.quantity !== "" && form.rate !== "" && quantity > 0 && rate >= 0 && Number.isFinite(quantity * rate);
  const inputClass = "w-full min-w-0 min-h-12 rounded-xl border border-[#DDE8DF] bg-white px-4 py-3 text-base text-[#17231D] placeholder:text-[#929B95] transition-colors focus:outline-none focus:border-[#3A8F3D] focus:ring-4 focus:ring-[#3A8F3D]/10 disabled:cursor-not-allowed disabled:bg-[#F4F7F3] sm:text-sm";

  function update(key: keyof typeof emptyFields, value: string) { setForm(previous => ({ ...previous, [key]: value })); }
  function clear() {
    setForm({ ...emptyFields, date: today() });
    setSelectedFarmerId("");
    setFields({}); setSaveError("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    setSaveError("");
    const errors = validateCollection(form, selectedFarmerId);
    setFields(errors);
    if (Object.keys(errors).length) return;
    submitting.current = true;
    setSaving(true);
    try {
      await protectedRequest("/api/admin/milk-collections/", collectionPayload(form, selectedFarmerId), "POST", 201);
      clear();
      window.dispatchEvent(new Event("dairyflow_update_collections"));
      success("Milk collection saved successfully.");
      router.push("/admin/collections");
    } catch (error) {
      if (error instanceof ApiError) { setFields(error.fields); setSaveError(error.message); }
      else setSaveError("Unable to save the collection. Please try again.");
    } finally { submitting.current = false; setSaving(false); }
  }

  function fieldError(key: string) {
    return fields[key]?.length ? <div id={`error-${key}`} role="alert" className="mt-1 space-y-1 text-xs text-[#D9534F]">{fields[key].map((message, index) => <p key={index}>{message}</p>)}</div> : null;
  }

  return <div className="mx-auto max-w-6xl space-y-6 pb-4">
    <header className="space-y-4">
      <Link href="/admin/collections" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B756E] hover:text-[#0B5D3B]"><ArrowLeft className="h-3.5 w-3.5" />Back to collections</Link>
      <div className="flex items-start gap-3 sm:gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#DDE8DF] bg-white text-[#0B5D3B]"><Milk className="h-6 w-6" /></div><div><h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">Add Milk Collection</h1><p className="mt-1.5 text-sm leading-relaxed text-[#6B756E]">Choose the farmer and shift, then enter the milk measurements.</p></div></div>
    </header>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form className="min-w-0 space-y-5" onSubmit={submit} noValidate aria-busy={saving}>
        {saveError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#D9534F]">{saveError}</div>}
        {fieldError("non_field_errors")}
        <fieldset disabled={saving} className="min-w-0 space-y-5">
        <Card className="space-y-5 rounded-2xl p-5 sm:p-7">
          <div className="flex items-center gap-2.5"><UserRound className="h-5 w-5 text-[#3A8F3D]" /><h2 className="font-bold text-[#17231D]">Farmer & collection details</h2></div>
          <div className="space-y-3 rounded-2xl border border-[#E3EBDF] bg-[#FAFCF8] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor="collection-farmer" className="text-sm font-semibold text-[#17231D]">Farmer name <span aria-hidden="true">*</span></label>{isLoading && <LoadingSpinner label="Loading farmers..." showLabel />}</div>
            <SelectDropdown id="collection-farmer" value={String(selectedFarmerId)}
              options={farmers.map(option => ({ value: String(option.id), label: `${option.name} (${option.farmer_id})`, description: option.village || undefined }))}
              onChange={value => setSelectedFarmerId(value === "" ? "" : Number(value))}
              placeholder={isLoading ? "Loading farmers..." : "Select a farmer"}
              disabled={saving || isLoading || !!error || !farmers.length} searchable invalid={!!fields.farmer?.length} describedBy="farmer-help error-farmer" />
            {fieldError("farmer")}
            <p id="farmer-help" className="text-xs leading-relaxed text-[#6B756E]">{farmer ? `Selected farmer ID: ${farmer.farmer_id}` : "Select the account that supplied this milk."}</p>
            {error && <div role="alert" className="space-y-2 text-sm text-[#D9534F]"><p>{error}</p><Button type="button" variant="outline" size="sm" onClick={reload}>Retry loading farmers</Button></div>}
            {!isLoading && !error && !farmers.length && <p role="status" className="text-sm text-[#6B756E]">No farmers available. <Link href="/admin/register-farmer" className="font-semibold text-[#0B5D3B] underline">Register a farmer</Link></p>}
            {!isLoading && !error && <p className="border-t border-[#E3EBDF] pt-3 text-xs text-[#6B756E]">{count} farmer{count === 1 ? "" : "s"}</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="min-w-0 space-y-2"><label htmlFor="collection-date" className="flex items-center gap-1.5 text-sm font-semibold text-[#17231D]"><CalendarDays className="h-4 w-4 text-[#6B756E]" />Collection date *</label><input id="collection-date" type="date" required value={form.date} onChange={event => update("date", event.target.value)} aria-invalid={!!fields.collection_date?.length} aria-describedby="error-collection_date" className={inputClass} />{fieldError("collection_date")}</div>
            <div className="space-y-2"><label htmlFor="collection-shift" className="text-sm font-semibold text-[#17231D]">Shift *</label><SelectDropdown id="collection-shift" invalid={!!fields.shift?.length} describedBy="error-shift" disabled={saving} value={form.shift} onChange={value => update("shift", value)} placeholder="Select shift" options={[{ value: "Morning", label: "Morning shift" }, { value: "Evening", label: "Evening shift" }]} />{fieldError("shift")}</div>
          </div>
        </Card>

        <Card className="space-y-5 rounded-2xl p-5 sm:p-7">
          <div className="flex items-center gap-2.5"><Milk className="h-5 w-5 text-[#3A8F3D]" /><h2 className="font-bold text-[#17231D]">Volume & rate</h2></div>
          <div className="grid gap-5 sm:grid-cols-2">{[{ key: "quantity", label: "Milk quantity", unit: "Litres", step: "0.01" }, { key: "rate", label: "Rate per litre", unit: "₹ / L", step: "0.01" }].map(({ key, label, unit, step }) => <div key={key} className="space-y-2"><label htmlFor={`collection-${key}`} className="text-sm font-semibold text-[#17231D]">{label} *</label><div className="relative"><input id={`collection-${key}`} type="number" inputMode="decimal" min={key === "quantity" ? "0.01" : "0"} step={step} required placeholder="0.00" value={form[key as "quantity" | "rate"]} onChange={event => update(key as "quantity" | "rate", event.target.value)} aria-invalid={!!fields[key === "quantity" ? "quantity_litres" : "rate_per_litre"]?.length} aria-describedby={`error-${key === "quantity" ? "quantity_litres" : "rate_per_litre"}`} className={`${inputClass} pr-20`} /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-[#6B756E]">{unit}</span></div>{fieldError(key === "quantity" ? "quantity_litres" : "rate_per_litre")}</div>)}</div>
          <p className="text-xs leading-relaxed text-[#6B756E]">Enter the applicable rate manually. An automatic rate source is not connected yet.</p>
        </Card>

        <Card className="space-y-5 rounded-2xl p-5 sm:p-7">
          <div><div className="flex items-center gap-2.5"><FlaskConical className="h-5 w-5 text-[#3A8F3D]" /><h2 className="font-bold text-[#17231D]">Quality readings</h2></div><p className="mt-1.5 text-xs text-[#6B756E]">Enter readings from the milk test, when available.</p></div>
          <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2">{measurements.map(measurement => <div key={measurement.key} className="space-y-2"><label htmlFor={`collection-${measurement.key}`} className="text-sm font-semibold text-[#17231D]">{measurement.label} <span className="text-xs font-normal text-[#6B756E]">({measurement.unit})</span></label><input id={`collection-${measurement.key}`} type="number" inputMode="decimal" min={measurement.key === "temperature" ? undefined : 0} max={"max" in measurement ? measurement.max : undefined} step={measurement.step} placeholder="Enter reading" aria-invalid={!!fields[measurement.key]?.length} aria-describedby={`error-${measurement.key}`} value={form[measurement.key]} onChange={event => update(measurement.key, event.target.value)} className={inputClass} />{fieldError(measurement.key)}</div>)}</div>
          <div className="space-y-2"><label htmlFor="collection-notes" className="text-sm font-semibold text-[#17231D]">Notes <span className="text-xs font-normal text-[#6B756E]">(optional)</span></label><textarea id="collection-notes" rows={3} placeholder="Add any collection notes..." value={form.notes} onChange={event => update("notes", event.target.value)} aria-invalid={!!fields.notes?.length} className={`${inputClass} resize-y`} />{fieldError("notes")}</div>
        </Card>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><Button type="button" variant="outline" onClick={clear}>Clear Form</Button><Button type="submit" isLoading={saving} loadingText="Saving collection..." disabled={isLoading || !!error} className="w-full sm:w-auto">Save Collection</Button></div>
        </fieldset>
      </form>

      <aside className="min-w-0 space-y-4 lg:sticky lg:top-0">
        <Card className="overflow-hidden rounded-2xl p-0">
          <div className="flex items-center gap-2.5 border-b border-[#DDE8DF] px-5 py-4"><Calculator className="h-5 w-5 text-[#3A8F3D]" /><h2 className="font-bold text-[#17231D]">Collection preview</h2></div>
          <dl className="space-y-4 p-5">{[{ label: "Farmer", value: farmer?.name || "Not selected" }, { label: "Farmer ID", value: farmer?.farmer_id || "Not selected" }, { label: "Shift", value: form.shift || "Not selected" }, { label: "Quantity", value: form.quantity ? `${form.quantity} L` : "Not entered" }, { label: "Rate", value: form.rate ? `${formatCurrency(rate)} / L` : "Not entered" }].map(item => <div key={item.label} className="flex items-start justify-between gap-4 text-sm"><dt className="shrink-0 text-[#6B756E]">{item.label}</dt><dd className="min-w-0 break-words text-right font-semibold text-[#17231D]">{item.value}</dd></div>)}</dl>
          <div className="border-t border-[#DDE8DF] bg-[#F0F6EB] p-5"><p className="text-xs font-semibold uppercase tracking-wider text-[#536A57]">Estimated amount</p><p className={`mt-2 break-words font-black tracking-tight text-[#0B5D3B] ${hasEstimate ? "text-3xl" : "py-2 text-base"}`}>{hasEstimate ? (quantity * rate).toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Enter volume & rate"}</p><p className="mt-2 text-xs leading-relaxed text-[#6B756E]">Calculated from your entries. This is an unsaved preview.</p></div>
        </Card>
        <div className="flex gap-2.5 rounded-2xl border border-[#DDE8DF] bg-[#F7FAF4] p-4 text-xs leading-relaxed text-[#6B756E]"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>The final amount is calculated by the server when the collection is saved.</p></div>
      </aside>
    </div>
  </div>;
}

"use client";

import { useRef, useState } from "react";
import { Bell, Send, CheckCircle2, UserRound, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, FieldErrors } from "@/lib/api/client";
import { useFarmerOptions } from "@/lib/hooks/use-farmer-options";
import { DispatchNotification } from "@/lib/services/notifications-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";

export default function AdminNotificationsPage() {
  const { protectedRequest } = useAuth();
  const { success } = useToast();
  const options = useFarmerOptions();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"all" | "specific">("all");
  const [farmerId, setFarmerId] = useState("");
  const [category, setCategory] = useState<DispatchNotification["category"]>("general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const [saved, setSaved] = useState<(DispatchNotification & { recipient: string }) | null>(null);
  const busy = useRef(false);
  const fieldClass = "min-h-12 w-full rounded-xl border border-[#DDE8DF] bg-white px-4 py-3 text-base text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-4 focus:ring-[#3A8F3D]/10 sm:text-sm";

  function fieldError(key: string) {
    return fields[key]?.length ? <div id={`notification-error-${key}`} role="alert" className="mt-1 space-y-1 text-xs text-[#D9534F]">{fields[key].map((text, index) => <p key={index}>{text}</p>)}</div> : null;
  }
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    setError("");
    const errors: FieldErrors = {};
    if (!title.trim()) errors.title = ["Enter a notification title."];
    if (!message.trim()) errors.message = ["Enter a notification message."];
    if (audience === "specific" && (!farmerId || !options.farmers.some(farmer => farmer.id === Number(farmerId)))) errors.farmer = ["Select a farmer."];
    setFields(errors);
    if (Object.keys(errors).length) return;
    const payload: DispatchNotification = { audience, title: title.trim(), message: message.trim(), category, ...(audience === "specific" ? { farmer: Number(farmerId) } : {}) };
    busy.current = true; setSaving(true);
    try {
      await protectedRequest("/api/admin/notifications/", payload, "POST", 201);
      const recipient = audience === "all" ? "All farmers" : options.farmers.find(farmer => farmer.id === Number(farmerId))?.name ?? "Selected farmer";
      setSaved({ ...payload, recipient });
      setOpen(false); setTitle(""); setMessage(""); setAudience("all"); setFarmerId(""); setCategory("general"); setFields({});
      success("Notification saved successfully.");
      window.dispatchEvent(new Event("dairyflow_update_notifications"));
    } catch (error) {
      if (error instanceof ApiError) { setError(error.message); setFields(error.fields); }
      else setError("Unable to save the notification. Please try again.");
    } finally { busy.current = false; setSaving(false); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">Notification Dispatch Center</h1><p className="mt-1 text-sm text-[#6B756E]">Send dashboard notifications to all farmers or one selected farmer.</p></div><Button onClick={() => { setOpen(true); setError(""); setFields({}); }}><Send className="h-4 w-4" />Send New Notification</Button></div>
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[#DDE8DF] p-5"><h2 className="font-bold text-[#17231D]">Last saved notification</h2><p className="mt-1 text-xs text-[#6B756E]">Confirmation of the latest notification saved during this session.</p></div>
      {saved ? <div role="status" className="space-y-4 p-5 sm:p-7"><div className="flex items-center gap-2 text-sm font-semibold text-[#0B5D3B]"><CheckCircle2 className="h-5 w-5" />Notification saved to the database</div><h3 className="break-words text-lg font-bold text-[#17231D]">{saved.title}</h3><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#6B756E]">{saved.message}</p><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#EEF5E8] px-3 py-1 text-[#0B5D3B]">{saved.recipient}</span><span className="rounded-full bg-[#F3F5F1] px-3 py-1 text-[#53645A]">{saved.category === "milk_collection" ? "Milk collection" : "General"}</span></div></div> : <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center"><Bell className="mb-4 h-10 w-10 text-[#8AA582]" /><h3 className="font-bold text-[#17231D]">Keep your farmers informed</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6B756E]">Create a notification for farmers to view in their notifications page.</p></div>}
    </Card>
    <Modal isOpen={open} onClose={() => { if (!busy.current) setOpen(false); }} title="Send Farmer Notification" description="Choose the audience and write the notification details." maxWidth="lg">
      <form onSubmit={send} noValidate aria-busy={saving} className="space-y-5">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-[#D9534F]">{error}</p>}{fieldError("non_field_errors")}
        <fieldset disabled={saving} className="min-w-0 space-y-5">
          <div className="space-y-2"><p className="text-sm font-semibold text-[#17231D]">Audience</p><div role="group" aria-label="Notification audience" className="grid grid-cols-2 gap-3">{[{ value: "all", label: "All farmers", icon: Users }, { value: "specific", label: "Specific farmer", icon: UserRound }].map(({ value, label, icon: Icon }) => <button type="button" key={value} aria-pressed={audience === value} onClick={() => setAudience(value as typeof audience)} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${audience === value ? "border-[#0B5D3B] bg-[#0B5D3B] text-white" : "border-[#DDE8DF] bg-white text-[#6B756E]"}`}><Icon className="h-4 w-4 shrink-0" />{label}</button>)}</div>{fieldError("audience")}</div>
          {audience === "specific" && <div className="space-y-2"><label htmlFor="notification-farmer" className="text-sm font-semibold text-[#17231D]">Select farmer *</label>{options.isLoading && <LoadingSpinner label="Loading farmers..." showLabel />}<SelectDropdown id="notification-farmer" value={farmerId} onChange={setFarmerId} placeholder="Select a farmer" searchable invalid={!!fields.farmer?.length} describedBy="notification-error-farmer" disabled={saving || options.isLoading || !!options.error || !options.farmers.length} options={options.farmers.map(farmer => ({ value: String(farmer.id), label: `${farmer.name} (${farmer.farmer_id})`, description: farmer.village || undefined }))} />{fieldError("farmer")}{options.error && <p role="alert" className="text-xs text-[#D9534F]">{options.error} <button type="button" onClick={options.reload} className="underline">Retry</button></p>}{!options.isLoading && !options.error && !options.farmers.length && <p className="text-xs text-[#6B756E]">No farmers available.</p>}</div>}
          <div className="space-y-2"><label htmlFor="notification-title" className="text-sm font-semibold text-[#17231D]">Title *</label><input id="notification-title" required value={title} onChange={event => setTitle(event.target.value)} placeholder="Enter a notification title" aria-invalid={!!fields.title?.length} aria-describedby="notification-error-title" className={fieldClass} />{fieldError("title")}</div>
          <div className="space-y-2"><label htmlFor="notification-message" className="text-sm font-semibold text-[#17231D]">Message *</label><textarea id="notification-message" required rows={4} value={message} onChange={event => setMessage(event.target.value)} placeholder="Write the notification details..." aria-invalid={!!fields.message?.length} aria-describedby="notification-error-message" className={`${fieldClass} resize-y`} />{fieldError("message")}</div>
          <div className="space-y-2"><label htmlFor="notification-category" className="text-sm font-semibold text-[#17231D]">Category</label><SelectDropdown id="notification-category" value={category} onChange={value => setCategory(value as typeof category)} disabled={saving} invalid={!!fields.category?.length} describedBy="notification-error-category" options={[{ value: "general", label: "General" }, { value: "milk_collection", label: "Milk collection" }]} />{fieldError("category")}</div>
          <div className="flex justify-end gap-3 border-t border-[#DDE8DF] pt-4"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" isLoading={saving} loadingText="Saving notification..."><Send className="h-4 w-4" />Dispatch Notification</Button></div>
        </fieldset>
      </form>
    </Modal>
  </div>;
}

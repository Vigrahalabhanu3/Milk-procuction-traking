"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, FieldErrors } from "@/lib/api/client";
import { RegisterFarmerInput, validateFarmer } from "@/lib/auth/auth.service";

const emptyForm: RegisterFarmerInput = { name: "", village: "", farmer_id: "", password: "", password_confirm: "" };
const inputs = [
  { key: "name", label: "Farmer Name", type: "text", autoComplete: "off" },
  { key: "village", label: "Village", type: "text", autoComplete: "off" },
  { key: "farmer_id", label: "Farmer ID", type: "text", autoComplete: "off" },
  { key: "password", label: "Password", type: "password", autoComplete: "new-password" },
  { key: "password_confirm", label: "Confirm Password", type: "password", autoComplete: "new-password" },
] as const;

export default function RegisterFarmerPage() {
  const { role, registerFarmer } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [fields, setFields] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState<{ id: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const [visible, setVisible] = useState({ password: false, password_confirm: false });

  function resetForm() {
    setForm({ ...emptyForm });
    setFields({});
    setMessage("");
    setCreated(null);
    setVisible({ password: false, password_confirm: false });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    setMessage(""); setCreated(null);
    const input = { ...form, name: form.name.trim(), village: form.village?.trim() || undefined };
    const errors = validateFarmer(input);
    setFields(errors);
    if (Object.keys(errors).length) return;
    busy.current = true; setLoading(true);
    try {
      const response = await registerFarmer(input);
      setCreated({ id: response.user.farmer_id ?? input.farmer_id, message: response.message });
      setForm(value => ({ ...value, password: "", password_confirm: "" }));
      setVisible({ password: false, password_confirm: false });
    } catch (error) {
      if (error instanceof ApiError) { setMessage(error.message); setFields(error.fields); }
      else setMessage("Unable to register the farmer. Please try again.");
    } finally { busy.current = false; setLoading(false); }
  }

  if (role !== "admin") return <p role="alert">403: Only admins can register farmers.</p>;
  function renderInput(key: keyof RegisterFarmerInput) {
    const definition = inputs.find(input => input.key === key)!;
    const isPassword = key === "password" || key === "password_confirm";
    const hasErrors = !!fields[key]?.length;
    return <div className="space-y-2">
      <label htmlFor={`register-${key}`} className="block text-sm font-semibold text-[#17231D]">
        {definition.label} {key === "village" ? <span className="text-xs font-normal text-[#6B756E]">(optional)</span> : <span className="text-[#6B756E]" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <input id={`register-${key}`} name={key}
          type={isPassword && visible[key] ? "text" : definition.type}
          autoComplete={definition.autoComplete} autoCapitalize="none" spellCheck={false}
          value={form[key] ?? ""} required={key !== "village"} disabled={loading}
          placeholder={key === "name" ? "Enter farmer’s full name" : key === "village" ? "Enter village, if known" : key === "farmer_id" ? "e.g. F001" : key === "password" ? "Create a password" : "Re-enter the password"}
          maxLength={key === "farmer_id" ? 32 : undefined}
          pattern={key === "farmer_id" ? "[A-Za-z0-9_-]{1,32}" : undefined}
          aria-invalid={hasErrors} aria-describedby={`${key}-errors${key === "farmer_id" ? " farmer-id-help" : ""}`}
          onChange={event => {
            setForm(value => ({ ...value, [key]: event.target.value }));
            setFields(value => ({ ...value, [key]: [] }));
          }}
          className={`w-full min-h-12 px-4 py-3 rounded-xl border text-sm text-[#17231D] placeholder:text-[#929B95] bg-white transition-colors focus:outline-none focus:ring-4 disabled:bg-[#F4F7F3] disabled:cursor-not-allowed ${isPassword ? "pr-12" : ""} ${hasErrors ? "border-[#D9534F] focus:border-[#D9534F] focus:ring-red-50" : "border-[#DDE8DF] hover:border-[#BCCEC0] focus:border-[#3A8F3D] focus:ring-[#3A8F3D]/10"}`} />
        {isPassword && <button type="button" disabled={loading}
          onClick={() => setVisible(value => ({ ...value, [key]: !value[key] }))}
          aria-label={`${visible[key] ? "Hide" : "Show"} ${definition.label.toLowerCase()}`}
          aria-pressed={visible[key]}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#6B756E] hover:text-[#0B5D3B] focus-visible:outline-2 focus-visible:outline-[#3A8F3D]">
          {visible[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>}
      </div>
      {key === "farmer_id" && <p id="farmer-id-help" className="text-xs leading-relaxed text-[#6B756E]">Used to sign in. Use 1–32 letters, numbers, hyphens (-), or underscores (_).</p>}
      <div id={`${key}-errors`} aria-live="polite">{fields[key]?.map((error, index) => <p key={index} className="text-xs text-[#D9534F]">{error}</p>)}</div>
    </div>;
  }

  return <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
    <div className="space-y-4">
      <Link href="/admin/farmers" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B756E] transition-colors hover:text-[#0B5D3B]">
        <ArrowLeft className="h-3.5 w-3.5" />Back to farmers
      </Link>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#DDE8DF] bg-white text-[#0B5D3B] shadow-xs"><UserPlus className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">Register Farmer</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[#6B756E]">Create a farmer account with login details and an optional village.</p>
        </div>
      </div>
    </div>

    {created && <div role="status" className="flex flex-col gap-4 rounded-2xl border border-[#BBD8C2] bg-[#EDF7EF] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#0B5D3B]" />
        <div><p className="font-bold text-[#0B5D3B]">{created.message}</p>
          <p className="mt-1 text-sm text-[#365D43]">Farmer ID: <strong className="font-mono">{created.id}</strong>. Share this ID and the selected password with the farmer.</p>
        </div>
      </div>
      <Button type="button" variant="outline" onClick={resetForm} className="shrink-0 bg-white">Register Another Farmer</Button>
    </div>}

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px] xl:gap-8">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-[#E6EDE7] px-5 py-5 sm:px-8">
          <h2 className="text-base font-bold text-[#17231D]">Farmer account details</h2>
          <p className="mt-1 text-xs text-[#6B756E]">Fields marked with * are required.</p>
        </div>
        <form onSubmit={submit} noValidate aria-busy={loading}>
          <div className="space-y-7 p-5 sm:p-8">
            {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-[#D9534F]">{message}</p>}
            {fields.non_field_errors?.map((error, index) => <p role="alert" key={index} className="text-sm text-[#D9534F]">{error}</p>)}
            <fieldset disabled={loading} className="min-w-0 space-y-5">
              <legend className="mb-5 flex items-center gap-2.5 text-sm font-bold text-[#17231D]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF2E8] text-xs text-[#0B5D3B]">1</span>Farmer information
              </legend>
              {renderInput("name")}
              {renderInput("farmer_id")}
              {renderInput("village")}
            </fieldset>
            <div className="h-px bg-[#E6EDE7]" />
            <fieldset disabled={loading} className="min-w-0">
              <legend className="mb-2 flex items-center gap-2.5 text-sm font-bold text-[#17231D]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF2E8] text-xs text-[#0B5D3B]">2</span>Login password
              </legend>
              <p className="mb-5 text-xs leading-relaxed text-[#6B756E]">Choose a password for the farmer, then enter it again to confirm.</p>
              <div className="grid gap-5 sm:grid-cols-2">{renderInput("password")}{renderInput("password_confirm")}</div>
              {form.password_confirm && form.password === form.password_confirm && !fields.password_confirm?.length && <p className="mt-3 flex items-center gap-1.5 text-xs text-[#0B5D3B]"><Check className="h-3.5 w-3.5" />Passwords match</p>}
            </fieldset>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-[#E6EDE7] bg-[#FAFCF8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <Button type="button" variant="ghost" disabled={loading} onClick={resetForm} className="text-[#6B756E]">Clear Form</Button>
            <Button type="submit" isLoading={loading} loadingText="Creating account..." className="w-full sm:w-auto">Create Farmer Account<ArrowRight className="h-4 w-4" /></Button>
          </div>
        </form>
      </Card>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-[#DDE8DF] bg-[#F0F5ED] p-5 sm:p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0B5D3B]"><KeyRound className="h-5 w-5" /></div>
          <h2 className="font-bold text-[#17231D]">Helping the farmer sign in</h2>
          <ol className="mt-4 space-y-4 text-sm leading-relaxed text-[#53645A]">
            <li className="flex gap-2.5"><span className="font-semibold text-[#0B5D3B]">1.</span><span>Create the account using this form.</span></li>
            <li className="flex gap-2.5"><span className="font-semibold text-[#0B5D3B]">2.</span><span>Give the farmer their ID and password separately.</span></li>
            <li className="flex gap-2.5"><span className="font-semibold text-[#0B5D3B]">3.</span><span>Ask them to open <strong className="font-semibold text-[#17231D]">Farmer Login</strong> and sign in.</span></li>
          </ol>
        </div>
        <div className="flex items-start gap-2.5 px-1 py-2 text-xs leading-relaxed text-[#6B756E]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3A8F3D]" /><p>You’ll stay signed in as admin after creating the farmer’s account.</p></div>
      </aside>
    </div>
  </div>;
}

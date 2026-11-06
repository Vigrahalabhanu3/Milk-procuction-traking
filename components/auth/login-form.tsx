"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, FieldErrors } from "@/lib/api/client";
import { dashboardPath } from "@/lib/auth/auth.service";
import { UserRole } from "@/lib/types";

export function LoginForm({ role, onBusyChange }: { role: UserRole; onBusyChange?: (busy: boolean) => void }) {
  const { login, sessionExpired } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const field = role === "farmer" ? "farmer_id" : "email";
  const Icon = role === "farmer" ? UserRound : Mail;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    setFields({});
    setMessage("");
    const errors: FieldErrors = {};
    if (!identifier.trim()) errors[field] = [`Enter your ${role === "farmer" ? "farmer ID" : "email"}.`];
    if (!password) errors.password = ["Enter your password."];
    if (Object.keys(errors).length) { setFields(errors); return; }
    busy.current = true;
    setLoading(true);
    onBusyChange?.(true);
    try {
      await login(identifier, password, role);
      setPassword("");
      router.replace(dashboardPath(role));
    } catch (error) {
      if (error instanceof ApiError) { setFields(error.fields); setMessage(error.message); }
      else setMessage("Unable to sign in. Please try again.");
    } finally {
      busy.current = false;
      setLoading(false);
      onBusyChange?.(false);
    }
  }

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-[#DDE8DF] text-base sm:text-sm text-[#17231D] focus:outline-none focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/20 bg-[#FAFCF8] min-h-[48px]";
  return <div className="space-y-5">
    {(message || sessionExpired || search.get("reason") === "expired") && <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#D9534F]">
      {message || "401: Your session has expired. Please sign in again."}
    </div>}
    {fields.non_field_errors?.map((text, i) => <p key={i} role="alert" className="text-sm text-[#D9534F]">{text}</p>)}
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="login-identifier" className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">{role === "farmer" ? "Farmer ID" : "Email"}</label>
        <div className="relative">
          <Icon className="absolute left-3.5 top-4 w-4 h-4 text-[#6B756E]" />
          <input id="login-identifier" name={field} type={role === "admin" ? "email" : "text"} autoComplete="username" value={identifier}
            onChange={e => setIdentifier(e.target.value)} placeholder={role === "farmer" ? "F001" : "Enter your email"}
            disabled={loading} required aria-invalid={!!fields[field]?.length} aria-describedby={fields[field]?.length ? "identifier-errors" : undefined} className={inputClass} />
        </div>
        <div id="identifier-errors">{fields[field]?.map((text, i) => <p key={i} className="text-xs text-[#D9534F]">{text}</p>)}</div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-[#17231D]">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-4 w-4 h-4 text-[#6B756E]" />
          <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password}
            onChange={e => setPassword(e.target.value)} disabled={loading} required aria-invalid={!!fields.password?.length}
            aria-describedby={fields.password?.length ? "password-errors" : undefined} className={`${inputClass} pr-12`} />
          <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-[#6B756E]">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div id="password-errors">{fields.password?.map((text, i) => <p key={i} className="text-xs text-[#D9534F]">{text}</p>)}</div>
      </div>
      <Button type="submit" size="lg" isLoading={loading} loadingText="Signing in..." className="w-full">Sign In</Button>
    </form>
    {role === "farmer" && <p className="text-xs sm:text-sm text-[#6B756E] border-t border-[#DDE8DF] pt-4">Use the farmer ID and password provided by your administrator. Contact them if you need access or a password change.</p>}
  </div>;
}

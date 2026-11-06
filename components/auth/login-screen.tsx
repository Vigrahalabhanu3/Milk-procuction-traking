"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, UserRound } from "lucide-react";
import { LoginForm } from "./login-form";
import { loginPath } from "@/lib/auth/auth.service";

export function LoginScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const role = params.get("role") === "admin" ? "admin" : "farmer";
  const [busy, setBusy] = useState(false);

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">Welcome back</h1><p className="mt-1.5 text-sm text-[#6B756E]">Choose your account type to sign in.</p></div>
    <div role="group" aria-label="Login account type" className="grid grid-cols-2 gap-1 rounded-2xl border border-[#DDE8DF] bg-[#F4F8F0] p-1.5">
      {([{role: "farmer", label: "Farmer Login", icon: UserRound}, {role: "admin", label: "Admin Login", icon: ShieldCheck}] as const).map(tab => <button key={tab.role} type="button" aria-pressed={role === tab.role} disabled={busy} onClick={() => router.replace(loginPath(tab.role))} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#3A8F3D] disabled:cursor-wait ${role === tab.role ? "bg-[#0B5D3B] text-white shadow-sm" : "text-[#6B756E] hover:bg-white hover:text-[#0B5D3B]"}`}><tab.icon className="h-4 w-4" />{tab.label}</button>)}
    </div>
    <div><h2 className="text-base font-bold text-[#17231D]">{role === "farmer" ? "Farmer Login" : "Admin Login"}</h2><p className="mt-1 text-xs text-[#6B756E]">{role === "farmer" ? "Enter the farmer ID and password provided by your administrator." : "Enter your admin email and password."}</p></div>
    <LoginForm key={role} role={role} onBusyChange={setBusy} />
  </div>;
}

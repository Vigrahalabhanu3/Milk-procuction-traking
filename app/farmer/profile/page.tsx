"use client";

import { UserRound, LogOut, Hash, Mail, IdCard, Sprout, ArrowUpRight, UserCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataLoader } from "@/components/ui/loading-spinner";

export default function FarmerProfilePage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <Card className="mx-auto max-w-4xl"><DataLoader label="Loading your profile..." /></Card>;
  if (!user) return <p className="text-sm text-[#6B756E]">Sign in to view your profile.</p>;

  const accountType = user.role === "farmer" ? "Farmer" : "Admin";
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
  // Only display details supplied by the authenticated user's API response.
  const details = [
    { label: "Full name", value: user.name, icon: UserRound },
    { label: "Farmer ID", value: user.farmer_id, icon: IdCard, mono: true },
    { label: "Account type", value: accountType, icon: UserCircle2 },
    { label: "Email address", value: user.email, icon: Mail },
    { label: "Account ID", value: String(user.id), icon: Hash, mono: true },
  ].filter(detail => typeof detail.value === "string" && detail.value.trim() !== "");

  return <div className="mx-auto max-w-4xl space-y-5 pb-6 sm:space-y-6">
    <header className="flex items-end justify-between gap-4">
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B756E]">Your account</p>
        <h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">My Profile</h1>
      </div>
      <span className="hidden rounded-full border border-[#DDE8DF] bg-white px-3 py-1.5 text-xs font-medium text-[#6B756E] sm:inline-flex">DairyFlow · {accountType} portal</span>
    </header>

    <section aria-label="Profile overview" className="overflow-hidden rounded-3xl border border-[#DDE8DF] bg-white shadow-sm shadow-[#0B5D3B]/5">
      <div className="relative isolate h-36 overflow-hidden bg-gradient-to-br from-[#07452C] via-[#0B5D3B] to-[#28794C] sm:h-44">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-12 -top-28 h-80 w-80 rounded-full border border-white/10 bg-white/[0.03]" />
          <div className="absolute -right-20 -top-16 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-56 left-1/3 h-72 w-[650px] -rotate-12 rounded-[50%] bg-[#87AE62]/10" />
          <Sprout strokeWidth={0.7} className="absolute right-7 top-3 h-36 w-36 -rotate-12 text-white/[0.08] sm:right-14 sm:h-44 sm:w-44" />
        </div>
        <div className="relative flex items-center justify-between gap-4 px-5 pt-6 sm:px-8 sm:pt-7">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-white/85"><Sprout className="h-4 w-4 text-[#D8EAB5]" />Rooted in better farming</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90">{accountType} account</span>
        </div>
      </div>

      <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-11 mb-4 inline-flex rounded-[24px] bg-white p-1.5 sm:-mt-12">
          <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-[19px] border border-[#DDE8DF] bg-gradient-to-br from-[#EFF5E8] to-[#DEEAD7] text-2xl font-black tracking-tight text-[#0B5D3B] sm:h-24 sm:w-24 sm:text-3xl">{initials}</div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h2 className="break-words text-2xl font-bold tracking-tight text-[#17231D] sm:text-3xl">{user.name}</h2>
            <p className="mt-1.5 text-sm text-[#6B756E]">Your personal space at DairyFlow.</p>
          </div>
          {user.farmer_id && <div className="inline-flex max-w-full items-center gap-3 self-start rounded-2xl border border-[#DDE8DF] bg-[#F7FAF4] px-4 py-3 sm:self-auto">
            <IdCard aria-hidden="true" className="h-5 w-5 shrink-0 text-[#3A8F3D]" />
            <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B756E]">Farmer ID</p><p className="break-all font-mono text-sm font-bold text-[#0B5D3B]">{user.farmer_id}</p></div>
          </div>}
        </div>
      </div>
    </section>

    <Card className="rounded-3xl p-5 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><h2 className="text-base font-bold tracking-tight text-[#17231D] sm:text-lg">Account details</h2><p className="mt-1 text-xs leading-relaxed text-[#6B756E] sm:text-sm">Your registered information, all in one place.</p></div>
        <div aria-hidden="true" className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F5EB] text-[#3A8F3D] sm:flex"><UserCircle2 className="h-5 w-5" /></div>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {details.map(({ label, value, icon: Icon, mono }) => <div key={label} className="flex min-w-0 items-start gap-3.5 rounded-2xl border border-[#E4ECE0] bg-[#FAFCF8] p-4 transition-colors hover:border-[#C7D9C4] sm:p-5">
          <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E4ECE0] bg-white text-[#3A8F3D]"><Icon className="h-[18px] w-[18px]" /></div>
          <div className="min-w-0 flex-1"><dt className="mb-1 text-xs font-medium text-[#6B756E]">{label}</dt><dd className={`break-words text-sm font-semibold leading-relaxed text-[#17231D] sm:text-base ${mono ? "font-mono" : ""}`}>{value}</dd></div>
        </div>)}
      </dl>
    </Card>

    <div className="flex flex-col gap-4 rounded-2xl border border-[#DDE8DF] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div className="flex items-start gap-3">
        <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F6F2] text-[#6B756E]"><LogOut className="h-[18px] w-[18px]" /></div>
        <div><h2 className="text-sm font-semibold text-[#17231D]">Using a shared device?</h2><p className="mt-1 text-xs leading-relaxed text-[#6B756E]">Sign out when you’re done to keep your account private.</p></div>
      </div>
      <Button type="button" variant="outline" onClick={logout} className="w-full shrink-0 border-red-100 bg-red-50/50 text-red-700 hover:border-red-200 hover:bg-red-50 sm:w-auto">Sign Out<ArrowUpRight className="h-4 w-4" /></Button>
    </div>
  </div>;
}

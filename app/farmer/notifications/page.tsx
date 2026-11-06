"use client";

import { useState } from "react";
import { Bell, ChevronLeft, ChevronRight, Milk, RefreshCw, Users, UserRound } from "lucide-react";
import { useFarmerNotifications } from "@/lib/hooks/use-farmer-notifications";
import { notificationPagePath } from "@/lib/services/notifications-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataLoader } from "@/components/ui/loading-spinner";

export default function FarmerNotificationsPage() {
  const [path, setPath] = useState("/api/farmer/notifications/");
  const { data, error, isLoading, reload } = useFarmerNotifications(path);
  const next = notificationPagePath(data?.next ?? null);
  const previous = notificationPagePath(data?.previous ?? null);

  return <div className="mx-auto max-w-4xl space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#DDE8DF] bg-white text-[#0B5D3B]"><Bell className="h-6 w-6" /></div><div><h1 className="text-2xl font-black tracking-tight text-[#17231D] sm:text-3xl">Notifications</h1><p className="mt-1.5 text-sm text-[#6B756E]">Updates from your dairy, including notifications sent just to you.</p></div></div><Button variant="outline" onClick={reload} disabled={isLoading} className="self-start sm:self-auto"><RefreshCw className="h-4 w-4" />Refresh</Button></header>
    <Card className="overflow-hidden p-0" aria-busy={isLoading}>
      <div className="flex items-center justify-between gap-3 border-b border-[#DDE8DF] p-5"><h2 className="font-bold text-[#17231D]">Your updates</h2>{data && <span className="rounded-full bg-[#EEF5E8] px-3 py-1 text-xs font-semibold text-[#0B5D3B]">{data.count} notification{data.count === 1 ? "" : "s"}</span>}</div>
      {isLoading ? <DataLoader label="Loading notifications..." className="min-h-64" /> : error ? <div role="alert" className="space-y-4 p-8 text-center"><p className="text-sm text-[#D9534F]">{error}</p><Button variant="outline" onClick={reload}>Try Again</Button></div> : !data?.results.length ? <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><Bell className="mb-4 h-10 w-10 text-[#8AA582]" /><h3 className="font-bold text-[#17231D]">No notifications yet</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6B756E]">Notifications from your dairy will appear here.</p></div> : <div className="divide-y divide-[#E6EDE7]">{data.results.map(notification => <article key={notification.id} className="flex items-start gap-3 p-4 sm:gap-4 sm:p-6"><div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#DDE8DF] bg-[#F2F7EC] text-[#3A8F3D]">{notification.category === "milk_collection" ? <Milk className="h-5 w-5" /> : <Bell className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]"><span className="rounded-full bg-[#EEF5E8] px-2.5 py-1 font-medium text-[#0B5D3B]">{notification.category === "milk_collection" ? "Milk collection" : notification.category === "general" ? "General" : notification.category.replaceAll("_", " ")}</span><span className="inline-flex items-center gap-1 text-[#6B756E]">{notification.audience === "all" ? <Users className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}{notification.audience === "all" ? "All farmers" : "For you"}</span></div><h3 className="break-words text-sm font-bold text-[#17231D] sm:text-base">{notification.title}</h3><p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#6B756E]">{notification.message}</p><time dateTime={notification.created_at} className="mt-3 block text-xs text-[#7A867E]">{new Date(notification.created_at).toLocaleString("en-IN", {day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"})}</time></div></article>)}</div>}
      {data && (next || previous) && <nav aria-label="Notifications pagination" className="grid grid-cols-2 gap-2 border-t border-[#DDE8DF] p-4 sm:flex sm:justify-between"><Button className="min-h-11 min-w-0" aria-label="Previous notifications page" variant="outline" size="sm" disabled={!previous} onClick={() => { if (previous) setPath(previous); }}><ChevronLeft className="h-4 w-4" />Previous</Button><Button className="min-h-11 min-w-0" aria-label="Next notifications page" variant="outline" size="sm" disabled={!next} onClick={() => { if (next) setPath(next); }}>Next<ChevronRight className="h-4 w-4" /></Button></nav>}
    </Card>
  </div>;
}

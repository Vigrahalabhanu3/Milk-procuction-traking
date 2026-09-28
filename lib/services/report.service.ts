import { getCollections } from "./collection.service";
import { getFarmers } from "./farmer.service";
import { getPayments } from "./payment.service";

export interface DailyReportRow {
  date: string;
  totalMorningLiters: number;
  totalEveningLiters: number;
  totalLiters: number;
  avgFat: number;
  avgSnf: number;
  totalPayout: number;
  activeFarmersCount: number;
}

export interface FarmerProductionReportRow {
  farmerId: string;
  name: string;
  village: string;
  totalCollections: number;
  totalMilk: number;
  avgFat: number;
  avgSnf: number;
  totalEarnings: number;
}

export async function generateDailyMilkReport(): Promise<DailyReportRow[]> {
  const collections = await getCollections();
  const groupedByDate: Record<string, typeof collections> = {};

  for (const c of collections) {
    if (!groupedByDate[c.date]) groupedByDate[c.date] = [];
    groupedByDate[c.date].push(c);
  }

  const rows: DailyReportRow[] = [];

  for (const [date, items] of Object.entries(groupedByDate)) {
    const morningItems = items.filter((i) => i.session === "Morning");
    const eveningItems = items.filter((i) => i.session === "Evening");

    const totalMorningLiters = morningItems.reduce((acc, i) => acc + i.quantity, 0);
    const totalEveningLiters = eveningItems.reduce((acc, i) => acc + i.quantity, 0);
    const totalLiters = totalMorningLiters + totalEveningLiters;

    const avgFat = items.length ? items.reduce((acc, i) => acc + i.fat, 0) / items.length : 0;
    const avgSnf = items.length ? items.reduce((acc, i) => acc + i.snf, 0) / items.length : 0;
    const totalPayout = items.reduce((acc, i) => acc + i.amount, 0);

    const uniqueFarmers = new Set(items.map((i) => i.farmerId));

    rows.push({
      date,
      totalMorningLiters: Number(totalMorningLiters.toFixed(1)),
      totalEveningLiters: Number(totalEveningLiters.toFixed(1)),
      totalLiters: Number(totalLiters.toFixed(1)),
      avgFat: Number(avgFat.toFixed(2)),
      avgSnf: Number(avgSnf.toFixed(2)),
      totalPayout: Math.round(totalPayout),
      activeFarmersCount: uniqueFarmers.size,
    });
  }

  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function generateFarmerProductionReport(): Promise<FarmerProductionReportRow[]> {
  const farmers = await getFarmers();
  const collections = await getCollections();

  return farmers.map((f) => {
    const farmerCols = collections.filter((c) => c.farmerId.toLowerCase() === f.farmerId.toLowerCase());
    const totalMilk = farmerCols.reduce((acc, c) => acc + c.quantity, 0);
    const totalEarnings = farmerCols.reduce((acc, c) => acc + c.amount, 0);
    const avgFat = farmerCols.length ? farmerCols.reduce((acc, c) => acc + c.fat, 0) / farmerCols.length : f.averageFat;
    const avgSnf = farmerCols.length ? farmerCols.reduce((acc, c) => acc + c.snf, 0) / farmerCols.length : f.averageSnf;

    return {
      farmerId: f.farmerId,
      name: f.name,
      village: f.village,
      totalCollections: farmerCols.length,
      totalMilk: Number((totalMilk || f.totalMilk).toFixed(1)),
      avgFat: Number(avgFat.toFixed(2)),
      avgSnf: Number(avgSnf.toFixed(2)),
      totalEarnings: Math.round(totalEarnings || f.totalEarnings),
    };
  });
}

// Client-side CSV download helper
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  if (typeof window === "undefined") return;

  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map((row) =>
      row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

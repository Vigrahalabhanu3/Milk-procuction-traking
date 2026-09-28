import { MilkRate } from "../types";
import { initialMilkRates } from "../mock/milk-rates";
import { getStoredData, setStoredData } from "./storage";
import { createAuditLog } from "./audit.service";

const KEY = "milk_rates";

export async function getMilkRates(): Promise<MilkRate[]> {
  const rates = getStoredData<MilkRate[]>(KEY, initialMilkRates);
  return rates;
}

export async function getActiveMilkRate(category: "Cow" | "Buffalo" = "Cow"): Promise<number> {
  const rates = await getMilkRates();
  const active = rates.find((r) => r.status === "Active" && r.category === category);
  return active ? active.rate : 42.0;
}

export async function createMilkRate(data: Omit<MilkRate, "id">): Promise<MilkRate> {
  const rates = await getMilkRates();
  const newRate: MilkRate = {
    ...data,
    id: `rate_${Date.now()}`,
  };

  // If new rate is set to Active, mark other rates of same category as Historical
  let updatedRates = rates;
  if (data.status === "Active") {
    updatedRates = rates.map((r) => (r.category === data.category && r.status === "Active" ? { ...r, status: "Historical" as const } : r));
  }

  updatedRates = [newRate, ...updatedRates];
  setStoredData(KEY, updatedRates);

  await createAuditLog({
    action: "Added Milk Procurement Rate",
    entity: `${data.category} Milk`,
    entityId: newRate.id,
    oldValue: "—",
    newValue: `₹${data.rate}/L (Effective: ${data.effectiveDate})`,
  });

  return newRate;
}

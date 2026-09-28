import { MilkCollection, QualityGrade } from "../types";
import { initialCollections } from "../mock/collections";
import { getStoredData, setStoredData } from "./storage";
import { createAuditLog } from "./audit.service";
import { getFarmers, updateFarmer } from "./farmer.service";

const KEY = "collections";

export async function getCollections(): Promise<MilkCollection[]> {
  const collections = getStoredData<MilkCollection[]>(KEY, initialCollections);
  return [...collections].sort((a, b) => new Date(b.date + "T" + (b.session === "Morning" ? "08:00" : "18:00")).getTime() - new Date(a.date + "T" + (a.session === "Morning" ? "08:00" : "18:00")).getTime());
}

export async function getCollectionsByFarmer(farmerId: string): Promise<MilkCollection[]> {
  const collections = await getCollections();
  return collections.filter((c) => c.farmerId.toLowerCase() === farmerId.toLowerCase());
}

export async function createCollection(data: {
  farmerId: string;
  farmerName: string;
  date: string;
  session: "Morning" | "Evening";
  quantity: number;
  fat: number;
  snf: number;
  clr: number;
  temperature: number;
  rate: number;
  quality: QualityGrade;
  notes?: string;
}): Promise<MilkCollection> {
  const collections = await getCollections();
  const id = `col_${Date.now()}`;
  const code = `COL-2026-${String(collections.length + 1).padStart(4, "0")}`;
  const amount = Number((data.quantity * data.rate).toFixed(1));

  const newCollection: MilkCollection = {
    id,
    collectionCode: code,
    farmerId: data.farmerId,
    farmerName: data.farmerName,
    date: data.date,
    session: data.session,
    quantity: data.quantity,
    fat: data.fat,
    snf: data.snf,
    clr: data.clr,
    temperature: data.temperature,
    rate: data.rate,
    amount,
    quality: data.quality,
    notes: data.notes || "Recorded via Chilling Station Terminal.",
    createdAt: new Date().toISOString(),
  };

  const updated = [newCollection, ...collections];
  setStoredData(KEY, updated);

  // Update farmer's live milk today / total milk if for today
  try {
    const farmers = await getFarmers();
    const farmer = farmers.find((f) => f.farmerId === data.farmerId);
    if (farmer) {
      const isToday = data.date === new Date().toISOString().split("T")[0] || data.date === "2026-09-28";
      await updateFarmer(farmer.id, {
        milkToday: isToday ? Number((farmer.milkToday + data.quantity).toFixed(1)) : farmer.milkToday,
        totalMilk: Number((farmer.totalMilk + data.quantity).toFixed(1)),
        totalEarnings: Number((farmer.totalEarnings + amount).toFixed(1)),
        pendingEarnings: Number((farmer.pendingEarnings + amount).toFixed(1)),
      });
    }
  } catch (err) {
    console.error("Error updating farmer totals:", err);
  }

  await createAuditLog({
    action: "Added Milk Collection",
    entity: `${data.farmerName} (${data.farmerId})`,
    entityId: code,
    oldValue: "—",
    newValue: `${data.quantity} L (${data.session}, Fat ${data.fat}%) - ₹${amount}`,
  });

  return newCollection;
}

export async function updateCollection(
  id: string,
  data: Partial<Omit<MilkCollection, "id" | "collectionCode" | "createdAt">>
): Promise<MilkCollection | null> {
  const collections = await getCollections();
  const index = collections.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const current = collections[index];
  const quantity = data.quantity !== undefined ? data.quantity : current.quantity;
  const rate = data.rate !== undefined ? data.rate : current.rate;
  const amount = Number((quantity * rate).toFixed(1));

  const updatedRecord: MilkCollection = {
    ...current,
    ...data,
    quantity,
    rate,
    amount,
  };

  const updatedList = [...collections];
  updatedList[index] = updatedRecord;
  setStoredData(KEY, updatedList);

  await createAuditLog({
    action: "Updated Milk Collection",
    entity: `${current.farmerName} (${current.farmerId})`,
    entityId: current.collectionCode,
    oldValue: `${current.quantity} L @ ₹${current.rate}/L = ₹${current.amount}`,
    newValue: `${updatedRecord.quantity} L @ ₹${updatedRecord.rate}/L = ₹${updatedRecord.amount}`,
  });

  return updatedRecord;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const collections = await getCollections();
  const target = collections.find((c) => c.id === id);
  if (!target) return false;

  const filtered = collections.filter((c) => c.id !== id);
  setStoredData(KEY, filtered);

  await createAuditLog({
    action: "Deleted Milk Collection",
    entity: `${target.farmerName} (${target.farmerId})`,
    entityId: target.collectionCode,
    oldValue: `${target.quantity} L (${target.session}, ₹${target.amount})`,
    newValue: "Record Deleted",
  });

  return true;
}

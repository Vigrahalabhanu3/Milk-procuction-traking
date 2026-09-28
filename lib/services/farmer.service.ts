import { Farmer, FarmerStatus } from "../types";
import { initialFarmers } from "../mock/farmers";
import { getStoredData, setStoredData } from "./storage";
import { createAuditLog } from "./audit.service";

const KEY = "farmers";

export async function getFarmers(): Promise<Farmer[]> {
  const farmers = getStoredData<Farmer[]>(KEY, initialFarmers);
  return farmers;
}

export async function getFarmerById(idOrFarmerId: string): Promise<Farmer | null> {
  const farmers = await getFarmers();
  const found = farmers.find(
    (f) => f.id === idOrFarmerId || f.farmerId.toLowerCase() === idOrFarmerId.toLowerCase()
  );
  return found || null;
}

export async function createFarmer(data: {
  name: string;
  email: string;
  phone: string;
  village: string;
  address: string;
  cattleCount?: number;
  bankAccount?: string;
  ifsc?: string;
}): Promise<Farmer> {
  const farmers = await getFarmers();
  const nextNumber = farmers.length + 1;
  const farmerId = `FARM${String(nextNumber).padStart(3, "0")}`;

  const newFarmer: Farmer = {
    id: `f_${Date.now()}`,
    farmerId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    village: data.village,
    address: data.address,
    status: "Active",
    joinedDate: new Date().toISOString().split("T")[0],
    cattleCount: data.cattleCount || 4,
    bankAccount: data.bankAccount || `9182736451${String(nextNumber).padStart(3, "0")}`,
    ifsc: data.ifsc || "SBIN0001420",
    milkToday: 0,
    totalMilk: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    averageFat: 4.1,
    averageSnf: 8.4,
    averageGrade: "A",
  };

  const updated = [newFarmer, ...farmers];
  setStoredData(KEY, updated);

  await createAuditLog({
    action: "Registered Farmer",
    entity: `${newFarmer.name} (${newFarmer.farmerId})`,
    entityId: newFarmer.farmerId,
    oldValue: "—",
    newValue: `Registered in ${newFarmer.village}`,
  });

  return newFarmer;
}

export async function updateFarmer(id: string, data: Partial<Farmer>): Promise<Farmer | null> {
  const farmers = await getFarmers();
  const index = farmers.findIndex((f) => f.id === id || f.farmerId === id);
  if (index === -1) return null;

  const current = farmers[index];
  const updatedFarmer: Farmer = { ...current, ...data };
  const updatedList = [...farmers];
  updatedList[index] = updatedFarmer;
  setStoredData(KEY, updatedList);

  await createAuditLog({
    action: "Updated Farmer Profile",
    entity: `${current.name} (${current.farmerId})`,
    entityId: current.farmerId,
    oldValue: `Status: ${current.status}, Village: ${current.village}`,
    newValue: `Status: ${updatedFarmer.status}, Village: ${updatedFarmer.village}`,
  });

  return updatedFarmer;
}

export async function setFarmerStatus(id: string, status: FarmerStatus): Promise<Farmer | null> {
  return updateFarmer(id, { status });
}

export async function deleteFarmer(id: string): Promise<boolean> {
  const farmers = await getFarmers();
  const target = farmers.find((f) => f.id === id || f.farmerId === id);
  if (!target) return false;

  const filtered = farmers.filter((f) => f.id !== id && f.farmerId !== id);
  setStoredData(KEY, filtered);

  await createAuditLog({
    action: "Deleted Farmer Record",
    entity: `${target.name} (${target.farmerId})`,
    entityId: target.farmerId,
    oldValue: `Active Farmer (${target.village})`,
    newValue: "Record Deleted",
  });

  return true;
}

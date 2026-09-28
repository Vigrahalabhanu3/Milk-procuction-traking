import { Payment, PaymentStatus } from "../types";
import { initialPayments } from "../mock/payments";
import { getStoredData, setStoredData } from "./storage";
import { createAuditLog } from "./audit.service";

const KEY = "payments";

export async function getPayments(): Promise<Payment[]> {
  const payments = getStoredData<Payment[]>(KEY, initialPayments);
  return [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPaymentsByFarmer(farmerId: string): Promise<Payment[]> {
  const payments = await getPayments();
  return payments.filter((p) => p.farmerId.toLowerCase() === farmerId.toLowerCase());
}

export async function updatePayment(id: string, data: Partial<Payment>): Promise<Payment | null> {
  const payments = await getPayments();
  const index = payments.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = payments[index];
  const updatedRecord: Payment = { ...current, ...data };
  const updatedList = [...payments];
  updatedList[index] = updatedRecord;
  setStoredData(KEY, updatedList);

  await createAuditLog({
    action: "Updated Payment Details",
    entity: `${current.farmerName} (${current.farmerId})`,
    entityId: current.paymentId,
    oldValue: `Status: ${current.status}, Amount: ₹${current.amount}`,
    newValue: `Status: ${updatedRecord.status}, Amount: ₹${updatedRecord.amount}`,
  });

  return updatedRecord;
}

export async function markPaymentStatus(id: string, status: PaymentStatus): Promise<Payment | null> {
  const payments = await getPayments();
  const current = payments.find((p) => p.id === id);
  if (!current) return null;

  const paidAt = status === "PAID" ? new Date().toISOString() : undefined;
  const transactionRef = status === "PAID" ? (current.transactionRef || `TXN${Date.now().toString().slice(-8)}`) : undefined;
  const paymentMethod = status === "PAID" ? (current.paymentMethod || "Bank Transfer") : undefined;

  return updatePayment(id, {
    status,
    paidAt,
    transactionRef,
    paymentMethod,
  });
}

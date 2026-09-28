import { Payment, PaymentStatus } from "../types";
import { initialFarmers } from "./farmers";

function generatePayments(): Payment[] {
  const payments: Payment[] = [];
  let idCounter = 1;

  // Specific payments for Ramesh Kumar (FARM001) to align with:
  // Paid: ₹38,000, Pending: ₹7,280 (Total ₹45,280)
  const rameshPayments: Array<{
    date: string;
    period: string;
    milk: number;
    amount: number;
    status: PaymentStatus;
    method?: "Bank Transfer" | "UPI" | "Direct Cash";
    ref?: string;
  }> = [
    {
      date: "2026-09-28",
      period: "16 Sep - 28 Sep 2026",
      milk: 173.3,
      amount: 7280.0,
      status: "PENDING",
    },
    {
      date: "2026-09-16",
      period: "01 Sep - 15 Sep 2026",
      milk: 238.1,
      amount: 10000.0,
      status: "PAID",
      method: "Bank Transfer",
      ref: "NEFT2609164821",
    },
    {
      date: "2026-09-01",
      period: "16 Aug - 31 Aug 2026",
      milk: 285.7,
      amount: 12000.0,
      status: "PAID",
      method: "Bank Transfer",
      ref: "NEFT2609019910",
    },
    {
      date: "2026-08-16",
      period: "01 Aug - 15 Aug 2026",
      milk: 238.1,
      amount: 10000.0,
      status: "PAID",
      method: "Bank Transfer",
      ref: "NEFT2608163012",
    },
    {
      date: "2026-08-01",
      period: "16 Jul - 31 Jul 2026",
      milk: 142.8,
      amount: 6000.0,
      status: "PAID",
      method: "Bank Transfer",
      ref: "NEFT2608018442",
    },
  ];

  for (const p of rameshPayments) {
    payments.push({
      id: `pay_${idCounter}`,
      paymentId: `PAY-2026-${String(idCounter).padStart(4, "0")}`,
      farmerId: "FARM001",
      farmerName: "Ramesh Kumar",
      date: p.date,
      period: p.period,
      milkQuantity: p.milk,
      amount: p.amount,
      status: p.status,
      paidAt: p.status === "PAID" ? `${p.date}T10:30:00Z` : undefined,
      transactionRef: p.ref,
      paymentMethod: p.method,
    });
    idCounter++;
  }

  // Generate cycles for the other 19 farmers
  const periods = [
    { period: "16 Sep - 28 Sep 2026", date: "2026-09-28", defaultStatus: "PENDING" as PaymentStatus },
    { period: "01 Sep - 15 Sep 2026", date: "2026-09-16", defaultStatus: "PAID" as PaymentStatus },
    { period: "16 Aug - 31 Aug 2026", date: "2026-09-01", defaultStatus: "PAID" as PaymentStatus },
    { period: "01 Aug - 15 Aug 2026", date: "2026-08-16", defaultStatus: "PAID" as PaymentStatus },
    { period: "16 Jul - 31 Jul 2026", date: "2026-08-01", defaultStatus: "PAID" as PaymentStatus },
    { period: "01 Jul - 15 Jul 2026", date: "2026-07-16", defaultStatus: "PAID" as PaymentStatus },
  ];

  for (const farmer of initialFarmers.slice(1)) {
    for (const p of periods) {
      const milkFactor = farmer.milkToday > 0 ? farmer.milkToday * 6.5 : 120;
      const milk = Number((milkFactor + (idCounter % 7) * 4).toFixed(1));
      const amount = Number((milk * 42).toFixed(0));

      let status = p.defaultStatus;
      if (p.defaultStatus === "PENDING" && idCounter % 4 === 0) {
        status = "PROCESSING";
      }

      payments.push({
        id: `pay_${idCounter}`,
        paymentId: `PAY-2026-${String(idCounter).padStart(4, "0")}`,
        farmerId: farmer.farmerId,
        farmerName: farmer.name,
        date: p.date,
        period: p.period,
        milkQuantity: milk,
        amount,
        status,
        paidAt: status === "PAID" ? `${p.date}T11:00:00Z` : undefined,
        transactionRef: status === "PAID" ? `TXN${26090000 + idCounter}` : undefined,
        paymentMethod: status === "PAID" ? "Bank Transfer" : undefined,
      });
      idCounter++;
    }
  }

  return payments;
}

export const initialPayments: Payment[] = generatePayments();

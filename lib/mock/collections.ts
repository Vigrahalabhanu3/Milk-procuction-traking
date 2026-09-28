import { MilkCollection, QualityGrade } from "../types";
import { initialFarmers } from "./farmers";

// Seeded generator to produce 100+ realistic collections
function generateCollections(): MilkCollection[] {
  const collections: MilkCollection[] = [];
  let idCounter = 1;

  // Exact data requested for Ramesh Kumar (FARM001) on 28 Sep and 27 Sep 2026
  const rameshSpecial = [
    {
      date: "2026-09-28",
      session: "Evening" as const,
      quantity: 12.0,
      fat: 4.1,
      snf: 8.4,
      clr: 29.0,
      temperature: 5.6,
      rate: 42.0,
      quality: "A" as QualityGrade,
    },
    {
      date: "2026-09-28",
      session: "Morning" as const,
      quantity: 12.5,
      fat: 4.2,
      snf: 8.5,
      clr: 29.5,
      temperature: 5.2,
      rate: 42.0,
      quality: "A+" as QualityGrade,
    },
    {
      date: "2026-09-27",
      session: "Evening" as const,
      quantity: 11.5,
      fat: 4.0,
      snf: 8.3,
      clr: 28.5,
      temperature: 6.0,
      rate: 41.0,
      quality: "B" as QualityGrade,
    },
    {
      date: "2026-09-27",
      session: "Morning" as const,
      quantity: 11.8,
      fat: 4.3,
      snf: 8.6,
      clr: 30.0,
      temperature: 5.0,
      rate: 43.0,
      quality: "A+" as QualityGrade,
    },
  ];

  for (const s of rameshSpecial) {
    const amount = Number((s.quantity * s.rate).toFixed(1));
    collections.push({
      id: `col_${idCounter}`,
      collectionCode: `COL-2026-${String(idCounter).padStart(4, "0")}`,
      farmerId: "FARM001",
      farmerName: "Ramesh Kumar",
      date: s.date,
      session: s.session,
      quantity: s.quantity,
      fat: s.fat,
      snf: s.snf,
      clr: s.clr,
      temperature: s.temperature,
      rate: s.rate,
      amount,
      quality: s.quality,
      notes: "Normal collection checked at Chilling Center 01.",
      createdAt: `${s.date}T${s.session === "Morning" ? "07:30:00" : "18:00:00"}Z`,
    });
    idCounter++;
  }

  // Generate today (2026-09-28) morning collections for active farmers to reach today's aggregate
  const activeFarmers = initialFarmers.filter((f) => f.status === "Active" && f.farmerId !== "FARM001");

  for (const farmer of activeFarmers) {
    // Morning session today
    const morningQty = Number((farmer.milkToday * 0.52).toFixed(1));
    const rate = 42.0;
    const morningAmt = Number((morningQty * rate).toFixed(1));
    collections.push({
      id: `col_${idCounter}`,
      collectionCode: `COL-2026-${String(idCounter).padStart(4, "0")}`,
      farmerId: farmer.farmerId,
      farmerName: farmer.name,
      date: "2026-09-28",
      session: "Morning",
      quantity: morningQty,
      fat: farmer.averageFat,
      snf: farmer.averageSnf,
      clr: 29.5,
      temperature: 5.4,
      rate,
      amount: morningAmt,
      quality: farmer.averageGrade,
      notes: "Morning batch accepted.",
      createdAt: "2026-09-28T07:45:00Z",
    });
    idCounter++;

    // Evening session today
    const eveningQty = Number((farmer.milkToday * 0.48).toFixed(1));
    const eveningAmt = Number((eveningQty * rate).toFixed(1));
    collections.push({
      id: `col_${idCounter}`,
      collectionCode: `COL-2026-${String(idCounter).padStart(4, "0")}`,
      farmerId: farmer.farmerId,
      farmerName: farmer.name,
      date: "2026-09-28",
      session: "Evening",
      quantity: eveningQty,
      fat: farmer.averageFat,
      snf: farmer.averageSnf,
      clr: 29.2,
      temperature: 5.8,
      rate,
      amount: eveningAmt,
      quality: farmer.averageGrade,
      notes: "Evening batch accepted.",
      createdAt: "2026-09-28T18:15:00Z",
    });
    idCounter++;
  }

  // Generate dates from 2026-09-26 back to 2026-09-20 (past 7 days)
  const pastDates = [
    "2026-09-26",
    "2026-09-25",
    "2026-09-24",
    "2026-09-23",
    "2026-09-22",
    "2026-09-21",
    "2026-09-20",
  ];

  const sessions: ("Morning" | "Evening")[] = ["Morning", "Evening"];

  for (const date of pastDates) {
    // Pick 10 farmers per date to produce a realistic distribution of 100+ records
    for (let i = 0; i < 8; i++) {
      const farmer = initialFarmers[i % initialFarmers.length];
      if (farmer.status !== "Active") continue;

      for (const session of sessions) {
        const base = farmer.milkToday > 0 ? farmer.milkToday / 2 : 12;
        // variance
        const qty = Number((base + ((idCounter % 5) - 2) * 0.4).toFixed(1));
        const rate = 42.0;
        const amount = Number((qty * rate).toFixed(1));
        const fat = Number((farmer.averageFat + ((idCounter % 3) - 1) * 0.1).toFixed(1));
        const snf = Number((farmer.averageSnf + ((idCounter % 3) - 1) * 0.1).toFixed(1));

        let grade: QualityGrade = "A";
        if (fat >= 4.2 && snf >= 8.5) grade = "A+";
        else if (fat < 4.0 || snf < 8.3) grade = "B";

        collections.push({
          id: `col_${idCounter}`,
          collectionCode: `COL-2026-${String(idCounter).padStart(4, "0")}`,
          farmerId: farmer.farmerId,
          farmerName: farmer.name,
          date,
          session,
          quantity: Math.max(qty, 6),
          fat: Math.max(fat, 3.6),
          snf: Math.max(snf, 8.0),
          clr: 29.0,
          temperature: 5.5,
          rate,
          amount,
          quality: grade,
          notes: "Routine collection processed.",
          createdAt: `${date}T${session === "Morning" ? "07:30:00" : "18:00:00"}Z`,
        });
        idCounter++;
      }
    }
  }

  return collections;
}

export const initialCollections: MilkCollection[] = generateCollections();

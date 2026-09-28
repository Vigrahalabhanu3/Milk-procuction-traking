"use client";

import React, { useState, useEffect } from "react";
import { getMilkRates, createMilkRate } from "@/lib/services/milk-rate.service";
import { MilkRate } from "@/lib/types";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { TrendingUp, Plus, Calendar, Award, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AdminMilkRatesPage() {
  const { success, error: toastError } = useToast();
  const [rates, setRates] = useState<MilkRate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [rateVal, setRateVal] = useState<number>(43.0);
  const [minFat, setMinFat] = useState<number>(3.5);
  const [maxFat, setMaxFat] = useState<number>(5.5);
  const [category, setCategory] = useState<"Cow" | "Buffalo" | "Standard">("Cow");
  const [status, setStatus] = useState<"Active" | "Upcoming" | "Historical">("Active");
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");

  const loadRates = async () => {
    const list = await getMilkRates();
    setRates(list);
  };

  useEffect(() => {
    loadRates();
  }, []);

  const activeCowRate = rates.find((r) => r.status === "Active" && r.category === "Cow")?.rate ?? 42.0;
  const activeBuffaloRate = rates.find((r) => r.status === "Active" && r.category === "Buffalo")?.rate ?? 54.0;

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMilkRate({
        rate: rateVal,
        minFat,
        maxFat,
        effectiveDate,
        status,
        category,
        notes: notes || "Procurement rate revision approved by cooperative board.",
      });
      setIsModalOpen(false);
      await loadRates();
      success("New milk procurement rate published successfully.");
    } catch {
      toastError("Failed to add milk rate.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Milk Procurement Rates
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Dynamic fat-density slabs and cooperative union pricing charts.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="gap-2 shadow-xs">
          <Plus className="w-4 h-4" />
          + Add Milk Rate
        </Button>
      </div>

      {/* Current Active Rate Displays (Section 47) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover className="bg-gradient-to-br from-[#0B5D3B] to-[#07452C] text-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Current Cow Milk Rate</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[#F4C95D] text-[10px] font-extrabold uppercase">
              Active Base Slab
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">₹{activeCowRate}</span>
            <span className="text-sm font-semibold text-white/80">/ Liter</span>
          </div>
          <p className="text-xs text-white/70 mt-2">Fat 3.5% - 5.5% (Min SNF 8.5%)</p>
        </Card>

        <Card hover className="p-6 bg-white border border-[#DDE8DF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B756E] uppercase tracking-wider">Buffalo Milk Rate</span>
            <span className="px-2 py-0.5 rounded-full bg-[#3A8F3D]/10 text-[#3A8F3D] text-[10px] font-extrabold uppercase">
              Active High Fat
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#0B5D3B]">₹{activeBuffaloRate}</span>
            <span className="text-sm font-semibold text-[#6B756E]">/ Liter</span>
          </div>
          <p className="text-xs text-[#6B756E] mt-2">Fat 6.0% - 8.5% (Rich fat density)</p>
        </Card>

        <Card hover className="p-6 bg-white border border-[#DDE8DF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B756E] uppercase tracking-wider">Quality Incentive Bonus</span>
            <Award className="w-5 h-5 text-[#F4C95D]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#3A8F3D]">+₹1.50</span>
            <span className="text-sm font-semibold text-[#6B756E]">/ Liter</span>
          </div>
          <p className="text-xs text-[#6B756E] mt-2">Applied to Grade A+ certified milk batches</p>
        </Card>
      </div>

      {/* Milk Rate History Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-[#DDE8DF] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#17231D]">Milk Rate History & Slabs</h3>
            <p className="text-xs text-[#6B756E]">Board resolutions and effective dates</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
              <tr>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Rate (INR)</th>
                <th className="py-3.5 px-4 text-center">Fat Slab</th>
                <th className="py-3.5 px-4">Effective Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Resolution Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8DF]">
              {rates.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAFCF8]">
                  <td className="py-3.5 px-4 font-bold text-[#17231D]">{r.category} Milk</td>
                  <td className="py-3.5 px-4 font-black text-sm text-[#0B5D3B]">₹{r.rate.toFixed(2)} / L</td>
                  <td className="py-3.5 px-4 text-center font-medium text-[#17231D]">
                    {r.minFat}% - {r.maxFat}%
                  </td>
                  <td className="py-3.5 px-4 text-[#6B756E] font-medium">{formatDate(r.effectiveDate)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3.5 px-4 text-[#6B756E] max-w-xs truncate">{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Rate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Milk Procurement Rate"
        description="Configure new procurement pricing slab with effective date."
      >
        <form onSubmit={handleCreateRate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Milk Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-semibold"
              >
                <option value="Cow">Cow Milk</option>
                <option value="Buffalo">Buffalo Milk</option>
                <option value="Standard">Standard Mixed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Procurement Rate (₹/L) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={rateVal}
                onChange={(e) => setRateVal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Min Fat %</label>
              <input
                type="number"
                step="0.1"
                required
                value={minFat}
                onChange={(e) => setMinFat(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Max Fat %</label>
              <input
                type="number"
                step="0.1"
                required
                value={maxFat}
                onChange={(e) => setMaxFat(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Effective Date</label>
              <input
                type="date"
                required
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              >
                <option value="Active">Active (Replace current)</option>
                <option value="Upcoming">Upcoming (Schedule)</option>
                <option value="Historical">Historical</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Resolution Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Approved in board meeting #42"
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Rate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

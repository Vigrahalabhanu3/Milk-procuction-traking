"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/lib/services/collection.service";
import { getFarmers } from "@/lib/services/farmer.service";
import { getActiveMilkRate } from "@/lib/services/milk-rate.service";
import { downloadCSV } from "@/lib/services/report.service";
import { MilkCollection, Farmer, QualityGrade } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QualityBadge } from "@/components/ui/badge";
import { Modal, ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ResponsiveListSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatVolume, formatDate } from "@/lib/utils";
import {
  Plus,
  Download,
  Search,
  Edit2,
  Trash2,
  Sun,
  Moon,
  Milk,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Filter,
  Receipt,
  Printer,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function AdminCollectionsPage() {
  const { success, error: toastError } = useToast();
  const [collections, setCollections] = useState<MilkCollection[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [activeRate, setActiveRate] = useState<number>(42.0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState<string>("ALL");
  const [qualityFilter, setQualityFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCol, setSelectedCol] = useState<MilkCollection | null>(null);
  const [receiptCol, setReceiptCol] = useState<MilkCollection | null>(null);

  // Add/Edit Form Data
  const [formData, setFormData] = useState({
    farmerId: "",
    farmerName: "",
    date: new Date().toISOString().split("T")[0],
    session: "Morning" as "Morning" | "Evening",
    quantity: 12.5,
    fat: 4.2,
    snf: 8.5,
    clr: 29.5,
    temperature: 5.2,
    rate: 42.0,
    quality: "A+" as QualityGrade,
    notes: "",
  });

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [cols, fs, r] = await Promise.all([
        getCollections(),
        getFarmers(),
        getActiveMilkRate("Cow"),
      ]);
      setCollections(cols);
      setFarmers(fs);
      setActiveRate(r);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Filtered & Paginated
  const filtered = useMemo(() => {
    return collections.filter((c) => {
      if (sessionFilter !== "ALL" && c.session !== sessionFilter) return false;
      if (qualityFilter !== "ALL" && c.quality !== qualityFilter) return false;
      if (dateFilter && c.date !== dateFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          c.farmerName.toLowerCase().includes(q) ||
          c.farmerId.toLowerCase().includes(q) ||
          c.collectionCode.toLowerCase().includes(q) ||
          c.date.includes(q)
        );
      }
      return true;
    });
  }, [collections, sessionFilter, qualityFilter, dateFilter, searchTerm]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  // Automated quality grade calculator
  const calculateGrade = (fat: number, snf: number): QualityGrade => {
    if (fat >= 4.2 && snf >= 8.5) return "A+";
    if (fat >= 4.0 && snf >= 8.3) return "A";
    if (fat >= 3.8 && snf >= 8.1) return "B";
    if (fat >= 3.5) return "C";
    return "REJECTED";
  };

  const handleOpenAdd = () => {
    const firstFarmer = farmers[0];
    const initialFat = 4.2;
    const initialSnf = 8.5;
    setFormData({
      farmerId: firstFarmer?.farmerId || "FARM001",
      farmerName: firstFarmer?.name || "Ramesh Kumar",
      date: new Date().toISOString().split("T")[0],
      session: "Morning",
      quantity: 12.5,
      fat: initialFat,
      snf: initialSnf,
      clr: 29.5,
      temperature: 5.2,
      rate: activeRate,
      quality: calculateGrade(initialFat, initialSnf),
      notes: "Chilling Center 01 reception.",
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (col: MilkCollection) => {
    setSelectedCol(col);
    setFormData({
      farmerId: col.farmerId,
      farmerName: col.farmerName,
      date: col.date,
      session: col.session,
      quantity: col.quantity,
      fat: col.fat,
      snf: col.snf,
      clr: col.clr,
      temperature: col.temperature,
      rate: col.rate,
      quality: col.quality,
      notes: col.notes || "",
    });
    setEditModalOpen(true);
  };

  const handleOpenDelete = (col: MilkCollection) => {
    setSelectedCol(col);
    setDeleteDialogOpen(true);
  };

  const handleFarmerSelect = (farmerId: string) => {
    const target = farmers.find((f) => f.farmerId === farmerId);
    if (target) {
      setFormData((prev) => ({
        ...prev,
        farmerId: target.farmerId,
        farmerName: target.name,
      }));
    }
  };

  const handleFatSnfChange = (newFat: number, newSnf: number) => {
    const grade = calculateGrade(newFat, newSnf);
    setFormData((prev) => ({
      ...prev,
      fat: newFat,
      snf: newSnf,
      quality: grade,
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmerId || formData.quantity <= 0) {
      toastError("Please enter valid farmer and milk volume.");
      return;
    }

    try {
      await createCollection({
        farmerId: formData.farmerId,
        farmerName: formData.farmerName,
        date: formData.date,
        session: formData.session,
        quantity: formData.quantity,
        fat: formData.fat,
        snf: formData.snf,
        clr: formData.clr,
        temperature: formData.temperature,
        rate: formData.rate,
        quality: formData.quality,
        notes: formData.notes,
      });
      setAddModalOpen(false);
      await loadAll();
      success("Milk collection added successfully.");
    } catch {
      toastError("Failed to add milk collection.");
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCol) return;

    try {
      await updateCollection(selectedCol.id, {
        date: formData.date,
        session: formData.session,
        quantity: formData.quantity,
        fat: formData.fat,
        snf: formData.snf,
        clr: formData.clr,
        temperature: formData.temperature,
        rate: formData.rate,
        quality: formData.quality,
        notes: formData.notes,
      });
      setEditModalOpen(false);
      await loadAll();
      success("Collection updated successfully.");
    } catch {
      toastError("Failed to update collection.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCol) return;
    try {
      await deleteCollection(selectedCol.id);
      setDeleteDialogOpen(false);
      await loadAll();
      success("Collection deleted successfully.");
    } catch {
      toastError("Failed to delete collection.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Collection Code", "Date", "Farmer ID", "Farmer Name", "Session", "Quantity (L)", "Fat (%)", "SNF (%)", "Rate (INR)", "Amount (INR)", "Quality"];
    const rows = filtered.map((c) => [
      c.collectionCode,
      c.date,
      c.farmerId,
      c.farmerName,
      c.session,
      c.quantity,
      c.fat,
      c.snf,
      c.rate,
      c.amount,
      c.quality,
    ]);
    downloadCSV("admin_milk_collections_export", headers, rows);
    success("Exported collections to CSV.");
  };

  const totalCalculatedAmount = (formData.quantity * formData.rate).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Milk Collections Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Real-time dairy intake verification, automated fat testing, and payout computing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4 text-[#0B5D3B]" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" />
            + Add Collection
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B756E]" />
            <input
              type="text"
              placeholder="Search farmer name, code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            />
          </div>

          <div>
            <select
              value={sessionFilter}
              onChange={(e) => {
                setSessionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            >
              <option value="ALL">All Milking Sessions</option>
              <option value="Morning">Morning Shift</option>
              <option value="Evening">Evening Shift</option>
            </select>
          </div>

          <div>
            <select
              value={qualityFilter}
              onChange={(e) => {
                setQualityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            >
              <option value="ALL">All Quality Grades</option>
              <option value="A+">Grade A+ (Premium)</option>
              <option value="A">Grade A (Standard)</option>
              <option value="B">Grade B (Fair)</option>
              <option value="C">Grade C</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            />
          </div>
        </div>

        {(searchTerm || sessionFilter !== "ALL" || qualityFilter !== "ALL" || dateFilter) && (
          <div className="flex items-center justify-between text-xs text-[#6B756E] pt-2 border-t border-[#DDE8DF]">
            <span>Showing {filtered.length} of {collections.length} collections</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setSessionFilter("ALL");
                setQualityFilter("ALL");
                setDateFilter("");
                setCurrentPage(1);
              }}
              className="text-[#0B5D3B] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </Card>

      {/* Main Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-3 sm:p-6">
            <ResponsiveListSkeleton rows={8} cols={10} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No milk collections found"
            description="No delivery records match your current filter parameters."
            actionText="Reset Filters"
            onAction={() => {
              setSearchTerm("");
              setSessionFilter("ALL");
              setQualityFilter("ALL");
              setDateFilter("");
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Farmer</th>
                    <th className="py-3.5 px-4">Session</th>
                    <th className="py-3.5 px-4 text-right">Quantity</th>
                    <th className="py-3.5 px-4 text-right">Fat %</th>
                    <th className="py-3.5 px-4 text-right">SNF %</th>
                    <th className="py-3.5 px-4 text-right">Rate</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4 text-center">Quality</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE8DF]">
                  {paginated.map((col) => (
                    <tr key={col.id} className="hover:bg-[#FAFCF8] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#17231D]">
                        {formatDate(col.date)}
                        <span className="block text-[10px] text-[#6B756E] font-normal">{col.collectionCode}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/farmers/${col.farmerId}`}
                          className="font-bold text-[#17231D] hover:text-[#0B5D3B]"
                        >
                          {col.farmerName}
                        </Link>
                        <span className="block text-[10px] text-[#0B5D3B] font-mono">{col.farmerId}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[#6B756E]">
                          {col.session === "Morning" ? (
                            <Sun className="w-3.5 h-3.5 text-[#F4C95D]" />
                          ) : (
                            <Moon className="w-3.5 h-3.5 text-[#3A8F3D]" />
                          )}
                          <span>{col.session}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#0B5D3B] text-sm">
                        {formatVolume(col.quantity)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#17231D]">{col.fat}%</td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#17231D]">{col.snf}%</td>
                      <td className="py-3.5 px-4 text-right text-[#6B756E]">₹{col.rate}</td>
                      <td className="py-3.5 px-4 text-right font-black text-[#17231D]">
                        {formatCurrency(col.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <QualityBadge grade={col.quality} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setReceiptCol(col)}
                            className="p-1.5 rounded-lg text-[#0B5D3B] hover:bg-[#0B5D3B]/10 transition-colors"
                            title="Official Receipt Slip"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(col)}
                            className="p-1.5 rounded-lg text-[#3A8F3D] hover:bg-[#3A8F3D]/10 transition-colors"
                            title="Edit Collection"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(col)}
                            className="p-1.5 rounded-lg text-[#D9534F] hover:bg-red-50 transition-colors"
                            title="Delete Collection"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#6B756E]">
              <span>
                Page <strong className="text-[#17231D]">{currentPage}</strong> of{" "}
                <strong className="text-[#17231D]">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="h-8 px-2.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-8 px-2.5"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Add Collection Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Record Milk Collection"
        description="Capture chilling station scales reading and calculate live payout"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {/* Farmer Selection */}
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Select Farmer *</label>
            <select
              value={formData.farmerId}
              onChange={(e) => handleFarmerSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-semibold"
            >
              {farmers.map((f) => (
                <option key={f.id} value={f.farmerId}>
                  {f.farmerId} — {f.name} ({f.village})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Session</label>
              <select
                value={formData.session}
                onChange={(e) => setFormData({ ...formData, session: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              >
                <option value="Morning">Morning Shift (06:00 - 09:00 AM)</option>
                <option value="Evening">Evening Shift (05:00 - 08:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Quantity & Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Milk Volume (Liters) *</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold text-sm text-[#0B5D3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Milk Rate (₹ / Liter) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
              />
            </div>
          </div>

          {/* Fat, SNF, CLR, Temp */}
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Fat %</label>
              <input
                type="number"
                step="0.1"
                min="2.0"
                max="10.0"
                value={formData.fat}
                onChange={(e) => handleFatSnfChange(Number(e.target.value), formData.snf)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">SNF %</label>
              <input
                type="number"
                step="0.1"
                min="6.0"
                max="12.0"
                value={formData.snf}
                onChange={(e) => handleFatSnfChange(formData.fat, Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">CLR</label>
              <input
                type="number"
                step="0.5"
                value={formData.clr}
                onChange={(e) => setFormData({ ...formData, clr: Number(e.target.value) })}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
          </div>

          {/* Auto Calculate Display Box (Section 43) */}
          <div className="p-4 rounded-2xl bg-[#0B5D3B]/5 border border-[#0B5D3B]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#F4C95D]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#6B756E] uppercase">Automatic Calculation</p>
                <p className="text-xs text-[#17231D]">
                  {formData.quantity} L × ₹{formData.rate} = <strong className="text-[#0B5D3B] text-sm">₹{totalCalculatedAmount}</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-[#6B756E] block">Certified Grade</span>
              <QualityBadge grade={formData.quality} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm & Save Collection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Collection Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Milk Collection"
        description={`Modifying entry ${selectedCol?.collectionCode} for ${selectedCol?.farmerName}`}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Session</label>
              <select
                value={formData.session}
                onChange={(e) => setFormData({ ...formData, session: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              >
                <option value="Morning">Morning Shift</option>
                <option value="Evening">Evening Shift</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Quantity (L)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Rate (₹)</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Fat %</label>
              <input
                type="number"
                step="0.1"
                value={formData.fat}
                onChange={(e) => handleFatSnfChange(Number(e.target.value), formData.snf)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">SNF %</label>
              <input
                type="number"
                step="0.1"
                value={formData.snf}
                onChange={(e) => handleFatSnfChange(formData.fat, Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">CLR</label>
              <input
                type="number"
                step="0.5"
                value={formData.clr}
                onChange={(e) => setFormData({ ...formData, clr: Number(e.target.value) })}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
          </div>

          {/* Recomputed Amount */}
          <div className="p-3 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF] flex items-center justify-between">
            <span className="text-xs text-[#6B756E]">
              Updated Total Payout: <strong className="text-[#0B5D3B] text-sm">₹{totalCalculatedAmount}</strong>
            </span>
            <QualityBadge grade={formData.quality} />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Collection Updates
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Milk Collection?"
        message={`Are you sure you want to delete ${selectedCol?.collectionCode} (${selectedCol?.quantity} L from ${selectedCol?.farmerName})? This action cannot be undone.`}
        confirmText="Delete Collection"
        isDestructive
      />

      {/* Official Collection Receipt Slip Modal */}
      <Modal
        isOpen={Boolean(receiptCol)}
        onClose={() => setReceiptCol(null)}
        title="Procurement Collection Slip"
        description="Official certified receipt issued to milk producer"
        maxWidth="md"
      >
        {receiptCol && (
          <div className="space-y-4">
            <div className="p-5 bg-white border border-[#DDE8DF] rounded-2xl shadow-xs space-y-4 text-xs">
              {/* Slip Header with Official Logo */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE8DF]">
                <Logo size="sm" />
                <div className="text-right">
                  <span className="font-mono text-[11px] font-bold text-[#0B5D3B] block">
                    {receiptCol.collectionCode}
                  </span>
                  <span className="text-[10px] text-[#6B756E]">
                    {formatDate(receiptCol.date)} • {receiptCol.session}
                  </span>
                </div>
              </div>

              {/* Farmer Info */}
              <div className="flex items-center justify-between py-1 bg-[#FAFCF8] p-2.5 rounded-xl border border-[#DDE8DF]/70">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#6B756E]">Producer</p>
                  <p className="font-black text-sm text-[#17231D]">{receiptCol.farmerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-[#6B756E]">Member ID</p>
                  <p className="font-mono font-bold text-[#0B5D3B]">{receiptCol.farmerId}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF]/70">
                  <p className="text-[10px] text-[#6B756E] font-semibold">Net Milk</p>
                  <p className="font-black text-[#0B5D3B] text-base">{formatVolume(receiptCol.quantity)}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF]/70">
                  <p className="text-[10px] text-[#6B756E] font-semibold">Fat / SNF</p>
                  <p className="font-black text-[#17231D] text-base">{receiptCol.fat}% / {receiptCol.snf}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF]/70">
                  <p className="text-[10px] text-[#6B756E] font-semibold">Base Rate</p>
                  <p className="font-black text-[#17231D] text-base">₹{receiptCol.rate}/L</p>
                </div>
              </div>

              {/* Payout & Quality Badge */}
              <div className="p-3.5 rounded-xl bg-[#0B5D3B]/5 border border-[#0B5D3B]/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#6B756E] block">Gross Payable:</span>
                  <span className="text-xl font-black text-[#0B5D3B]">{formatCurrency(receiptCol.amount)}</span>
                </div>
                <QualityBadge grade={receiptCol.quality} />
              </div>

              <p className="text-[10px] text-center text-[#6B756E] italic">
                Valid electronic procurement slip • Anand District Cooperative Union
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DDE8DF]">
              <Button variant="outline" size="sm" onClick={() => setReceiptCol(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()} className="gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Print Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

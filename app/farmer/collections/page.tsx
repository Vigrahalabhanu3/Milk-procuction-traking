"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getCollectionsByFarmer } from "@/lib/services/collection.service";
import { downloadCSV } from "@/lib/services/report.service";
import { MilkCollection, QualityGrade } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QualityBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ResponsiveListSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatVolume, formatDate } from "@/lib/utils";
import {
  Download,
  Search,
  Filter,
  Sun,
  Moon,
  Milk,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Receipt,
  Printer,
} from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { Logo } from "@/components/brand/logo";

export default function FarmerCollectionsPage() {
  const { user } = useAuth();
  const farmerId = user?.farmerId || "FARM001";
  const { success } = useToast();

  const [collections, setCollections] = useState<MilkCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState<"ALL" | "Morning" | "Evening">("ALL");
  const [qualityFilter, setQualityFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [receiptCol, setReceiptCol] = useState<MilkCollection | null>(null);

  useEffect(() => {
    async function fetchCollections() {
      setIsLoading(true);
      try {
        const data = await getCollectionsByFarmer(farmerId);
        setCollections(data);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCollections();
  }, [farmerId]);

  // Filtered collections
  const filtered = useMemo(() => {
    return collections.filter((c) => {
      if (sessionFilter !== "ALL" && c.session !== sessionFilter) return false;
      if (qualityFilter !== "ALL" && c.quality !== qualityFilter) return false;
      if (dateFilter && c.date !== dateFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          c.collectionCode.toLowerCase().includes(q) ||
          c.date.includes(q) ||
          c.session.toLowerCase().includes(q) ||
          c.quality.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [collections, sessionFilter, qualityFilter, dateFilter, searchTerm]);

  // Paginated collections
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExportCSV = () => {
    const headers = ["Collection Code", "Date", "Session", "Quantity (L)", "Fat (%)", "SNF (%)", "Rate (INR)", "Amount (INR)", "Quality Grade"];
    const rows = filtered.map((c) => [
      c.collectionCode,
      c.date,
      c.session,
      c.quantity,
      c.fat,
      c.snf,
      c.rate,
      c.amount,
      c.quality,
    ]);
    downloadCSV(`farmer_collections_${farmerId}`, headers, rows);
    success("Collection history exported to CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            My Milk Collections
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Verified morning and evening chilling center collection ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4 text-[#0B5D3B]" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B756E]" />
            <input
              type="text"
              placeholder="Search date or code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            />
          </div>

          {/* Session filter */}
          <div>
            <select
              value={sessionFilter}
              onChange={(e) => {
                setSessionFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            >
              <option value="ALL">All Sessions (Morning & Evening)</option>
              <option value="Morning">Morning Shift</option>
              <option value="Evening">Evening Shift</option>
            </select>
          </div>

          {/* Quality Grade filter */}
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
            </select>
          </div>

          {/* Date filter */}
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
            <span>
              Showing {filtered.length} matching entries
            </span>
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
              Clear Filters
            </button>
          </div>
        )}
      </Card>

      {/* Main Table / Mobile Cards */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-3 sm:p-6">
            <ResponsiveListSkeleton rows={6} cols={8} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No milk collections found"
            description="There are no milk deliveries matching your selected search or filter criteria."
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
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Session</th>
                    <th className="py-3.5 px-4 text-right">Quantity</th>
                    <th className="py-3.5 px-4 text-right">Fat %</th>
                    <th className="py-3.5 px-4 text-right">SNF %</th>
                    <th className="py-3.5 px-4 text-right">Rate</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Quality</th>
                    <th className="py-3.5 px-4 text-right">Slip</th>
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
                        <div className="flex items-center gap-1.5 font-medium">
                          {col.session === "Morning" ? (
                            <Sun className="w-4 h-4 text-[#F4C95D]" />
                          ) : (
                            <Moon className="w-4 h-4 text-[#3A8F3D]" />
                          )}
                          <span>{col.session}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#0B5D3B] text-sm">
                        {formatVolume(col.quantity)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[#17231D]">{col.fat}%</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[#17231D]">{col.snf}%</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[#6B756E]">₹{col.rate.toFixed(0)}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#17231D]">
                        {formatCurrency(col.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <QualityBadge grade={col.quality} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setReceiptCol(col)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#0B5D3B] bg-[#0B5D3B]/5 hover:bg-[#0B5D3B]/10 transition-colors"
                          title="View Official Receipt Slip"
                        >
                          <Receipt className="w-3.5 h-3.5" /> Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[#DDE8DF]">
              {paginated.map((col) => (
                <div key={col.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#17231D]">{formatDate(col.date)}</span>
                      <span className="text-[10px] text-[#6B756E] block">{col.collectionCode}</span>
                    </div>
                    <QualityBadge grade={col.quality} />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-medium text-[#6B756E]">
                      {col.session === "Morning" ? <Sun className="w-3.5 h-3.5 text-[#F4C95D]" /> : <Moon className="w-3.5 h-3.5 text-[#3A8F3D]" />}
                      {col.session}
                    </span>
                    <span className="font-extrabold text-base text-[#0B5D3B]">{formatVolume(col.quantity)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-[#FAFCF8] text-[11px] text-center border border-[#DDE8DF]/60">
                    <div>
                      <span className="text-[#6B756E] block">Fat</span>
                      <span className="font-bold text-[#17231D]">{col.fat}%</span>
                    </div>
                    <div>
                      <span className="text-[#6B756E] block">SNF</span>
                      <span className="font-bold text-[#17231D]">{col.snf}%</span>
                    </div>
                    <div>
                      <span className="text-[#6B756E] block">Rate</span>
                      <span className="font-bold text-[#17231D]">₹{col.rate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#6B756E]">Total Payout:</span>
                    <span className="font-black text-sm text-[#17231D]">{formatCurrency(col.amount)}</span>
                  </div>
                  <button
                    onClick={() => setReceiptCol(col)}
                    className="w-full mt-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-[#0B5D3B] bg-[#0B5D3B]/5 hover:bg-[#0B5D3B]/10 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" /> View Delivery Slip
                  </button>
                </div>
              ))}
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

      {/* Official Delivery Receipt Slip Modal */}
      <Modal
        isOpen={Boolean(receiptCol)}
        onClose={() => setReceiptCol(null)}
        title="Milk Delivery Receipt"
        description="Official certified procurement receipt"
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
                  <p className="text-[10px] uppercase font-bold text-[#6B756E]">Producer Member</p>
                  <p className="font-black text-sm text-[#17231D]">{receiptCol.farmerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-[#6B756E]">Farmer ID</p>
                  <p className="font-mono font-bold text-[#0B5D3B]">{receiptCol.farmerId}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF]/70">
                  <p className="text-[10px] text-[#6B756E] font-semibold">Milk Volume</p>
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
                  <span className="text-[11px] font-bold text-[#6B756E] block">Delivery Credit:</span>
                  <span className="text-xl font-black text-[#0B5D3B]">{formatCurrency(receiptCol.amount)}</span>
                </div>
                <QualityBadge grade={receiptCol.quality} />
              </div>

              <p className="text-[10px] text-center text-[#6B756E] italic">
                Official electronic receipt • Anand District Milk Cooperative Society
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DDE8DF]">
              <Button variant="outline" size="sm" onClick={() => setReceiptCol(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()} className="gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

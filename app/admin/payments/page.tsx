"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getPayments,
  updatePayment,
  markPaymentStatus,
} from "@/lib/services/payment.service";
import { downloadCSV } from "@/lib/services/report.service";
import { Payment, PaymentStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatVolume, formatDate } from "@/lib/utils";
import {
  Receipt,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Edit2,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const { success, error: toastError } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<PaymentStatus>("PENDING");
  const [editRef, setEditRef] = useState("");
  const [editMethod, setEditMethod] = useState<string>("Bank Transfer");

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await getPayments();
      setPayments(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          p.farmerName.toLowerCase().includes(q) ||
          p.farmerId.toLowerCase().includes(q) ||
          p.paymentId.toLowerCase().includes(q) ||
          (p.transactionRef && p.transactionRef.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [payments, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleOpenEdit = (p: Payment) => {
    setSelectedPayment(p);
    setEditAmount(p.amount);
    setEditStatus(p.status);
    setEditRef(p.transactionRef || "");
    setEditMethod(p.paymentMethod || "Bank Transfer");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      await updatePayment(selectedPayment.id, {
        amount: editAmount,
        status: editStatus,
        transactionRef: editRef || undefined,
        paymentMethod: editMethod as any,
      });
      setEditModalOpen(false);
      await loadPayments();
      success("Payment updated successfully.");
    } catch {
      toastError("Failed to update payment.");
    }
  };

  const handleQuickStatus = async (payment: Payment, newStatus: PaymentStatus) => {
    try {
      await markPaymentStatus(payment.id, newStatus);
      await loadPayments();
      success(`Payment marked as ${newStatus}.`);
    } catch {
      toastError("Failed to update status.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Payment ID", "Date", "Farmer ID", "Farmer Name", "Period", "Milk Quantity (L)", "Amount (INR)", "Status", "Transaction Ref", "Payment Method"];
    const rows = filtered.map((p) => [
      p.paymentId,
      p.date,
      p.farmerId,
      p.farmerName,
      p.period,
      p.milkQuantity,
      p.amount,
      p.status,
      p.transactionRef || "",
      p.paymentMethod || "",
    ]);
    downloadCSV("admin_payment_disbursements", headers, rows);
    success("Payment disbursements exported to CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Cooperative Farmer Payments
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Settlement batches, automated bank account disbursals, and voucher tracking.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 self-start sm:self-auto">
          <Download className="w-4 h-4 text-[#0B5D3B]" />
          Export CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B756E]" />
            <input
              type="text"
              placeholder="Search by farmer name, ID, or payment ref..."
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            >
              <option value="ALL">All Settlement Statuses</option>
              <option value="PAID">Disbursed (PAID)</option>
              <option value="PENDING">Pending Approval (PENDING)</option>
              <option value="PROCESSING">Bank Transmit (PROCESSING)</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== "ALL") && (
          <div className="flex items-center justify-between text-xs text-[#6B756E] pt-2 border-t border-[#DDE8DF]">
            <span>Showing {filtered.length} of {payments.length} payment records</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
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
          <div className="p-6">
            <TableSkeleton rows={8} cols={7} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No payment records found"
            description="No settlement slips match your current filter parameters."
            actionText="Reset Filters"
            onAction={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                  <tr>
                    <th className="py-3.5 px-4">Payment ID</th>
                    <th className="py-3.5 px-4">Farmer</th>
                    <th className="py-3.5 px-4">Period</th>
                    <th className="py-3.5 px-4 text-right">Milk Volume</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE8DF]">
                  {paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAFCF8] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#17231D]">
                        {p.paymentId}
                        <span className="block text-[10px] text-[#6B756E] font-normal">{formatDate(p.date)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/farmers/${p.farmerId}`}
                          className="font-bold text-[#17231D] hover:text-[#0B5D3B]"
                        >
                          {p.farmerName}
                        </Link>
                        <span className="block text-[10px] text-[#0B5D3B] font-mono">{p.farmerId}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B756E] font-medium">{p.period}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#0B5D3B]">
                        {formatVolume(p.milkQuantity)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm text-[#17231D]">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status !== "PAID" && (
                            <button
                              onClick={() => handleQuickStatus(p, "PAID")}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                              title="Mark as Paid"
                            >
                              Mark Paid
                            </button>
                          )}
                          {p.status === "PAID" && (
                            <button
                              onClick={() => handleQuickStatus(p, "PENDING")}
                              className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-[11px] transition-colors"
                              title="Revert to Pending"
                            >
                              Mark Pending
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-[#6B756E] hover:text-[#17231D] hover:bg-[#DDE8DF]/40 transition-colors"
                            title="Edit Payment Details"
                          >
                            <Edit2 className="w-4 h-4" />
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

      {/* Edit Payment Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Payment Voucher"
        description={`Modifying disbursement voucher for ${selectedPayment?.farmerName}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Disbursement Amount (₹)</label>
              <input
                type="number"
                required
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-semibold"
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Bank Transaction Ref / UTR</label>
            <input
              type="text"
              placeholder="e.g. NEFT260900142"
              value={editRef}
              onChange={(e) => setEditRef(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Disbursement Channel</label>
            <select
              value={editMethod}
              onChange={(e) => setEditMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
            >
              <option value="Bank Transfer">Direct Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI Direct Payout</option>
              <option value="Direct Cash">Direct Cash Voucher</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

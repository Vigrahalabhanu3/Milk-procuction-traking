"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getPaymentsByFarmer } from "@/lib/services/payment.service";
import { getFarmerDashboardStats } from "@/lib/services/stats.service";
import { Payment, FarmerDashboardStats } from "@/lib/types";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCardsSkeleton, ResponsiveListSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatVolume, formatDate } from "@/lib/utils";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Download,
  Building2,
  Calendar,
} from "lucide-react";

export default function FarmerPaymentsPage() {
  const { user } = useAuth();
  const farmerId = user?.farmerId || "FARM001";
  const { success } = useToast();

  const [stats, setStats] = useState<FarmerDashboardStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPaymentData() {
      try {
        const s = await getFarmerDashboardStats(farmerId);
        setStats(s);

        const pays = await getPaymentsByFarmer(farmerId);
        setPayments(pays);
      } finally {
        setIsLoading(false);
      }
    }
    loadPaymentData();
  }, [farmerId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSlip = (payment: Payment) => {
    success(`Payment slip ${payment.paymentId} generated.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Farmer Settlements & Payments
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Official bank disbarments, pending cycle earnings, and payment vouchers.
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4 text-[#0B5D3B]" />
            Print Ledger
          </Button>
        </div>
      </div>

      {/* 3 Payment Cards */}
      {isLoading ? (
        <StatCardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats?.totalEarnings ?? 45280)}
            subvalue="Lifetime procurement revenue"
            icon={IndianRupee}
          />

          <StatCard
            title="Paid Disbursements"
            value={formatCurrency(stats?.paidAmount ?? 38000)}
            subvalue="Credited directly to bank account"
            icon={CheckCircle2}
          />

          <StatCard
            title="Pending Settlement"
            value={formatCurrency(stats?.pendingPayment ?? 7280)}
            subvalue="Processing cycle: 16 Sep - 28 Sep"
            icon={Clock}
            className="bg-amber-50/20 border-amber-200"
          />
        </div>
      )}

      {/* Direct Bank Account Status Box */}
      <Card className="p-4 sm:p-5 bg-white border border-[#DDE8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#3A8F3D]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#17231D]">Direct Bank Account Linked</h4>
            <p className="text-[11px] sm:text-xs text-[#6B756E]">
              Account: <strong className="text-[#17231D]">•••• •••• 1001</strong> | SBI (SBIN0001420)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3A8F3D]" />
          <span className="text-xs font-bold text-[#0B5D3B]">Aadhaar Verified</span>
        </div>
      </Card>

      {/* Payments Table / Mobile Cards */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DDE8DF] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#17231D]">Billing Cycles & Payment Slips</h3>
            <p className="text-xs text-[#6B756E]">Fortnightly procurement settlement cycles</p>
          </div>
          <span className="text-xs text-[#6B756E] font-medium hidden sm:inline-block">Read-Only Settlement Ledger</span>
        </div>

        {isLoading ? (
          <div className="p-3 sm:p-6">
            <ResponsiveListSkeleton rows={5} cols={6} />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B756E]">
            No payment settlements recorded yet.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                  <tr>
                    <th className="py-3.5 px-4">Payment ID</th>
                    <th className="py-3.5 px-4">Billing Period</th>
                    <th className="py-3.5 px-4 text-right">Milk Quantity</th>
                    <th className="py-3.5 px-4 text-right">Settlement Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Reference</th>
                    <th className="py-3.5 px-4 text-center no-print">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE8DF]">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAFCF8] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#17231D]">
                        {p.paymentId}
                        <span className="block text-[10px] text-[#6B756E] font-normal">{formatDate(p.date)}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#17231D]">{p.period}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#0B5D3B] text-sm">
                        {formatVolume(p.milkQuantity)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm text-[#17231D]">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#6B756E] font-mono text-[11px]">
                        {p.transactionRef || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center no-print">
                        <button
                          onClick={() => handleDownloadSlip(p)}
                          className="p-1.5 rounded-lg text-[#0B5D3B] hover:bg-[#0B5D3B]/10 transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                          title="Download Voucher"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Farmer Friendly) */}
            <div className="md:hidden divide-y divide-[#DDE8DF]">
              {payments.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#17231D]">{p.paymentId}</span>
                      <span className="text-[10px] text-[#6B756E] block">{p.period}</span>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF]/60 text-xs">
                    <div>
                      <span className="text-[10px] text-[#6B756E] uppercase font-semibold block">Milk Volume</span>
                      <span className="font-extrabold text-sm text-[#0B5D3B]">{formatVolume(p.milkQuantity)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#6B756E] uppercase font-semibold block">Settlement Payout</span>
                      <span className="font-black text-base text-[#17231D]">{formatCurrency(p.amount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B756E]">
                    <span>Disbursed: {formatDate(p.date)}</span>
                    <span className="font-mono text-[10px]">Ref: {p.transactionRef || "Pending"}</span>
                  </div>

                  <button
                    onClick={() => handleDownloadSlip(p)}
                    className="w-full min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold text-[#0B5D3B] bg-[#0B5D3B]/10 hover:bg-[#0B5D3B]/20 flex items-center justify-center gap-1.5 transition-colors touch-manipulation"
                  >
                    <Download className="w-4 h-4 text-[#0B5D3B]" />
                    <span>Download Settlement Voucher</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

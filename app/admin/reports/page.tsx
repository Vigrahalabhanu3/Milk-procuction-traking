"use client";

import React, { useState, useEffect } from "react";
import {
  generateDailyMilkReport,
  generateFarmerProductionReport,
  downloadCSV,
  DailyReportRow,
  FarmerProductionReportRow,
} from "@/lib/services/report.service";
import { getPayments } from "@/lib/services/payment.service";
import { getCollections } from "@/lib/services/collection.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatVolume, formatDate } from "@/lib/utils";
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Eye,
  Calendar,
  Users,
  Award,
  IndianRupee,
  Milk,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { BrandMark } from "@/components/brand/brand-mark";

export default function AdminReportsPage() {
  const { success } = useToast();
  const [dailyData, setDailyData] = useState<DailyReportRow[]>([]);
  const [farmerData, setFarmerData] = useState<FarmerProductionReportRow[]>([]);
  const [previewType, setPreviewType] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [d, f] = await Promise.all([
        generateDailyMilkReport(),
        generateFarmerProductionReport(),
      ]);
      setDailyData(d);
      setFarmerData(f);
    }
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Export handlers
  const handleExportDaily = () => {
    const headers = [
      "Date",
      "Morning Liters",
      "Evening Liters",
      "Total Liters",
      "Avg Fat (%)",
      "Avg SNF (%)",
      "Total Payout (INR)",
      "Active Farmers",
    ];
    const rows = dailyData.map((d) => [
      d.date,
      d.totalMorningLiters,
      d.totalEveningLiters,
      d.totalLiters,
      d.avgFat,
      d.avgSnf,
      d.totalPayout,
      d.activeFarmersCount,
    ]);
    downloadCSV("daily_milk_procurement_report", headers, rows);
    success("Daily Milk Report exported to CSV.");
  };

  const handleExportFarmerProduction = () => {
    const headers = [
      "Farmer ID",
      "Farmer Name",
      "Village",
      "Collections Count",
      "Total Milk (L)",
      "Avg Fat (%)",
      "Avg SNF (%)",
      "Total Earnings (INR)",
    ];
    const rows = farmerData.map((f) => [
      f.farmerId,
      f.name,
      f.village,
      f.totalCollections,
      f.totalMilk,
      f.avgFat,
      f.avgSnf,
      f.totalEarnings,
    ]);
    downloadCSV("farmer_production_report", headers, rows);
    success("Farmer Production Report exported to CSV.");
  };

  const handleExportPayments = async () => {
    const payments = await getPayments();
    const headers = ["Payment ID", "Date", "Farmer ID", "Farmer Name", "Period", "Milk (L)", "Amount (INR)", "Status"];
    const rows = payments.map((p) => [
      p.paymentId,
      p.date,
      p.farmerId,
      p.farmerName,
      p.period,
      p.milkQuantity,
      p.amount,
      p.status,
    ]);
    downloadCSV("payment_settlement_report", headers, rows);
    success("Payment Settlement Report exported to CSV.");
  };

  const handleExportQuality = async () => {
    const cols = await getCollections();
    const headers = ["Collection Code", "Date", "Farmer", "Session", "Fat (%)", "SNF (%)", "CLR", "Temperature", "Quality Grade"];
    const rows = cols.map((c) => [
      c.collectionCode,
      c.date,
      c.farmerName,
      c.session,
      c.fat,
      c.snf,
      c.clr,
      c.temperature,
      c.quality,
    ]);
    downloadCSV("milk_quality_audit_report", headers, rows);
    success("Quality Audit Report exported to CSV.");
  };

  const handleExportMonthly = () => {
    const headers = ["Metric", "September 2026", "August 2026", "Variance"];
    const rows = [
      ["Total Milk Procured", "32,480 L", "31,800 L", "+2.1%"],
      ["Average Fat Content", "4.18%", "4.15%", "+0.03%"],
      ["Average SNF Content", "8.51%", "8.48%", "+0.03%"],
      ["Gross Farmer Disbursements", "₹13,64,160", "₹13,10,000", "+4.1%"],
      ["Active Registered Farmers", "44", "42", "+2"],
    ];
    downloadCSV("monthly_summary_report", headers, rows);
    success("Monthly Executive Summary exported to CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Official Print Header (Visible only when printed via window.print) */}
      <div className="hidden print:flex items-center justify-between pb-6 mb-6 border-b-2 border-[#0B5D3B]">
        <Logo size="lg" />
        <div className="text-right text-xs text-[#17231D]">
          <p className="font-black uppercase tracking-wider text-sm text-[#0B5D3B]">
            Anand District Milk Producers Cooperative Union
          </p>
          <p className="text-[#6B756E]">Registration No: GUJ/COOP/2026/0942 • ISO 22000 Certified</p>
          <p className="text-[#6B756E]">Certified Audit Ledger • Printed: 28 Sep 2026</p>
        </div>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Cooperative Audit & Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Export official government and board reports with certified metrics.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 self-start sm:self-auto no-print">
          <Printer className="w-4 h-4 text-[#0B5D3B]" />
          Print Document
        </Button>
      </div>

      {/* 5 Report Cards (Section 48) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Daily Milk Report */}
        <Card hover className="p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-4">
              <Milk className="w-6 h-6 text-[#3A8F3D]" />
            </div>
            <h3 className="text-lg font-bold text-[#17231D]">Daily Milk Report</h3>
            <p className="text-xs text-[#6B756E] mt-1.5 leading-relaxed">
              Consolidated morning and evening collection volumes, shift ratios, and daily procurement financial totals.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-6 mt-4 border-t border-[#DDE8DF]">
            <Button variant="outline" size="sm" onClick={() => setPreviewType("daily")} className="flex-1 gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" /> View
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportDaily} className="flex-1 gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </Card>

        {/* Card 2: Farmer Production Report */}
        <Card hover className="p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-4">
              <Users className="w-6 h-6 text-[#3A8F3D]" />
            </div>
            <h3 className="text-lg font-bold text-[#17231D]">Farmer Production Report</h3>
            <p className="text-xs text-[#6B756E] mt-1.5 leading-relaxed">
              Individual farmer supply breakdowns, average milk quality, village groupings, and cumulative earnings.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-6 mt-4 border-t border-[#DDE8DF]">
            <Button variant="outline" size="sm" onClick={() => setPreviewType("farmer")} className="flex-1 gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" /> View
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportFarmerProduction} className="flex-1 gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </Card>

        {/* Card 3: Payment Report */}
        <Card hover className="p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-4">
              <IndianRupee className="w-6 h-6 text-[#3A8F3D]" />
            </div>
            <h3 className="text-lg font-bold text-[#17231D]">Payment & Payout Report</h3>
            <p className="text-xs text-[#6B756E] mt-1.5 leading-relaxed">
              Fortnightly settlement ledger with bank account credits, UTR reference codes, and pending payment vouchers.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-6 mt-4 border-t border-[#DDE8DF]">
            <Button variant="outline" size="sm" onClick={() => setPreviewType("payment")} className="flex-1 gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" /> View
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportPayments} className="flex-1 gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </Card>

        {/* Card 4: Quality Report */}
        <Card hover className="p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-4">
              <Award className="w-6 h-6 text-[#3A8F3D]" />
            </div>
            <h3 className="text-lg font-bold text-[#17231D]">Milk Quality & Lab Audit</h3>
            <p className="text-xs text-[#6B756E] mt-1.5 leading-relaxed">
              Detailed chemical analysis breakdown: Fat%, SNF%, CLR lactometer calibration, and grade allocations.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-6 mt-4 border-t border-[#DDE8DF]">
            <Button variant="outline" size="sm" onClick={() => setPreviewType("quality")} className="flex-1 gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" /> View
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportQuality} className="flex-1 gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </Card>

        {/* Card 5: Monthly Summary */}
        <Card hover className="p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-4">
              <Calendar className="w-6 h-6 text-[#3A8F3D]" />
            </div>
            <h3 className="text-lg font-bold text-[#17231D]">Monthly Summary Report</h3>
            <p className="text-xs text-[#6B756E] mt-1.5 leading-relaxed">
              Executive level synthesis covering 32,480 L procurement volume, revenue allocation, and operational KPIs.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-6 mt-4 border-t border-[#DDE8DF]">
            <Button variant="outline" size="sm" onClick={() => setPreviewType("monthly")} className="flex-1 gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" /> View
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportMonthly} className="flex-1 gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </Card>
      </div>

      {/* Interactive Report View Modal */}
      <Modal
        isOpen={Boolean(previewType)}
        onClose={() => setPreviewType(null)}
        title={
          previewType === "daily"
            ? "Daily Milk Procurement Report"
            : previewType === "farmer"
            ? "Farmer Production Report"
            : previewType === "payment"
            ? "Disbursement Audit Ledger"
            : previewType === "quality"
            ? "Quality & Lab Density Audit"
            : "Monthly Executive Overview"
        }
        description="Certified tabular report preview with real-time aggregated metrics"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#FAFCF8] rounded-xl border border-[#DDE8DF]">
            <BrandMark size={36} priority />
            <div>
              <h4 className="text-xs font-bold text-[#17231D]">DairyFlow Certified Document Ledger</h4>
              <p className="text-[11px] text-[#6B756E]">Validated against National Dairy Development Board standard grading slabs.</p>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto border border-[#DDE8DF] rounded-xl">
            {previewType === "daily" && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCF8] text-[#6B756E] font-bold border-b border-[#DDE8DF]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Morning</th>
                    <th className="p-3 text-right">Evening</th>
                    <th className="p-3 text-right">Total Milk</th>
                    <th className="p-3 text-right">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE8DF]">
                  {dailyData.map((d) => (
                    <tr key={d.date} className="hover:bg-[#FAFCF8]">
                      <td className="p-3 font-semibold">{formatDate(d.date)}</td>
                      <td className="p-3 text-right">{d.totalMorningLiters} L</td>
                      <td className="p-3 text-right">{d.totalEveningLiters} L</td>
                      <td className="p-3 text-right font-bold text-[#0B5D3B]">{d.totalLiters} L</td>
                      <td className="p-3 text-right font-black">₹{d.totalPayout.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {previewType === "farmer" && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCF8] text-[#6B756E] font-bold border-b border-[#DDE8DF]">
                  <tr>
                    <th className="p-3">Farmer</th>
                    <th className="p-3">Village</th>
                    <th className="p-3 text-right">Total Milk</th>
                    <th className="p-3 text-right">Avg Fat</th>
                    <th className="p-3 text-right">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE8DF]">
                  {farmerData.map((f) => (
                    <tr key={f.farmerId} className="hover:bg-[#FAFCF8]">
                      <td className="p-3 font-bold">{f.name} ({f.farmerId})</td>
                      <td className="p-3 text-[#6B756E]">{f.village}</td>
                      <td className="p-3 text-right font-extrabold text-[#0B5D3B]">{f.totalMilk} L</td>
                      <td className="p-3 text-right">{f.avgFat}%</td>
                      <td className="p-3 text-right font-black">₹{f.totalEarnings.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {(previewType === "payment" || previewType === "quality" || previewType === "monthly") && (
              <div className="p-6 text-center text-xs text-[#6B756E]">
                <p className="font-semibold text-sm text-[#17231D] mb-1">Official Document Ready</p>
                <p>Click &quot;Export CSV&quot; or &quot;Print Document&quot; to obtain the complete regulatory certified output.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button variant="outline" size="sm" onClick={() => setPreviewType(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (previewType === "daily") handleExportDaily();
                else if (previewType === "farmer") handleExportFarmerProduction();
                else if (previewType === "payment") handleExportPayments();
                else if (previewType === "quality") handleExportQuality();
                else handleExportMonthly();
              }}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

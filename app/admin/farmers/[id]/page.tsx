"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { getFarmerById, updateFarmer } from "@/lib/services/farmer.service";
import { getCollectionsByFarmer } from "@/lib/services/collection.service";
import { getPaymentsByFarmer } from "@/lib/services/payment.service";
import { getAuditLogs } from "@/lib/services/audit.service";
import { Farmer, MilkCollection, Payment, AuditLog } from "@/lib/types";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, QualityBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatVolume, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Milk,
  Award,
  IndianRupee,
  Clock,
  Edit2,
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function FarmerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const farmerId = resolvedParams.id;
  const { success, error: toastError } = useToast();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [collections, setCollections] = useState<MilkCollection[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"collections" | "payments" | "audit">("collections");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    village: "",
    address: "",
    cattleCount: 0,
    bankAccount: "",
    ifsc: "",
  });

  const loadData = async () => {
    const f = await getFarmerById(farmerId);
    if (f) {
      setFarmer(f);
      setEditData({
        name: f.name,
        phone: f.phone,
        village: f.village,
        address: f.address,
        cattleCount: f.cattleCount,
        bankAccount: f.bankAccount,
        ifsc: f.ifsc,
      });

      const cols = await getCollectionsByFarmer(f.farmerId);
      setCollections(cols);

      const pays = await getPaymentsByFarmer(f.farmerId);
      setPayments(pays);

      const logs = await getAuditLogs();
      const filteredLogs = logs.filter(
        (l) => l.entity.includes(f.farmerId) || l.entityId === f.farmerId
      );
      setAuditLogs(filteredLogs);
    }
  };

  useEffect(() => {
    loadData();
  }, [farmerId]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer) return;

    try {
      await updateFarmer(farmer.id, {
        name: editData.name,
        phone: editData.phone,
        village: editData.village,
        address: editData.address,
        cattleCount: editData.cattleCount,
        bankAccount: editData.bankAccount,
        ifsc: editData.ifsc,
      });
      setIsEditModalOpen(false);
      await loadData();
      success("Farmer record updated successfully.");
    } catch {
      toastError("Failed to update farmer record.");
    }
  };

  if (!farmer) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-[#6B756E]">Farmer record not found.</p>
        <Link href="/admin/farmers" className="mt-3 inline-block">
          <Button variant="outline" size="sm">
            Return to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/farmers"
            className="p-2 rounded-xl bg-white border border-[#DDE8DF] text-[#17231D] hover:bg-[#FAFCF8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#17231D] tracking-tight">{farmer.name}</h1>
              <StatusBadge status={farmer.status} />
            </div>
            <p className="text-xs text-[#6B756E]">
              Farmer Code: <strong className="text-[#0B5D3B]">{farmer.farmerId}</strong> • {farmer.village}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="gap-2 self-start sm:self-auto">
          <Edit2 className="w-4 h-4 text-[#0B5D3B]" />
          Edit Farmer Dossier
        </Button>
      </div>

      {/* Production & Financial Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Milk"
          value={formatVolume(farmer.milkToday)}
          subvalue="Morning + Evening"
          icon={Milk}
        />
        <StatCard
          title="Total Milk Supplied"
          value={formatVolume(farmer.totalMilk)}
          subvalue="Lifetime delivered yield"
          icon={Milk}
        />
        <StatCard
          title="Average Quality"
          value={`${farmer.averageFat}% Fat`}
          subvalue={`SNF ${farmer.averageSnf}% • ${farmer.averageGrade}`}
          icon={Award}
        />
        <StatCard
          title="Total Payouts"
          value={formatCurrency(farmer.totalEarnings)}
          subvalue={`Pending: ${formatCurrency(farmer.pendingEarnings)}`}
          icon={IndianRupee}
        />
      </div>

      {/* Profile & Bank Info Card */}
      <Card className="p-6 bg-white border border-[#DDE8DF]">
        <h3 className="font-bold text-base text-[#17231D] mb-4 pb-2 border-b border-[#DDE8DF]">
          Member Profile & Bank Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#6B756E] block mb-1">Phone Number</span>
            <span className="font-semibold text-[#17231D] font-mono">{farmer.phone}</span>
          </div>
          <div>
            <span className="text-[#6B756E] block mb-1">Email</span>
            <span className="font-semibold text-[#17231D]">{farmer.email}</span>
          </div>
          <div>
            <span className="text-[#6B756E] block mb-1">Cattle Inventory</span>
            <span className="font-semibold text-[#17231D]">{farmer.cattleCount} Dairy Cattle</span>
          </div>
          <div>
            <span className="text-[#6B756E] block mb-1">Village</span>
            <span className="font-semibold text-[#17231D]">{farmer.village}</span>
          </div>

          <div>
            <span className="text-[#6B756E] block mb-1">Bank Account</span>
            <span className="font-semibold text-[#17231D] font-mono">{farmer.bankAccount}</span>
          </div>
          <div>
            <span className="text-[#6B756E] block mb-1">IFSC Code</span>
            <span className="font-semibold text-[#17231D] font-mono">{farmer.ifsc}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[#6B756E] block mb-1">Postal Address</span>
            <span className="font-semibold text-[#17231D]">{farmer.address}</span>
          </div>
        </div>
      </Card>

      {/* Tabs: Collections / Payments / Audit History */}
      <Card className="p-0 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-[#DDE8DF] bg-[#FAFCF8] px-4">
          <button
            onClick={() => setActiveTab("collections")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "collections"
                ? "border-[#0B5D3B] text-[#0B5D3B]"
                : "border-transparent text-[#6B756E] hover:text-[#17231D]"
            }`}
          >
            Collection History ({collections.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "payments"
                ? "border-[#0B5D3B] text-[#0B5D3B]"
                : "border-transparent text-[#6B756E] hover:text-[#17231D]"
            }`}
          >
            Payment Cycles ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "audit"
                ? "border-[#0B5D3B] text-[#0B5D3B]"
                : "border-transparent text-[#6B756E] hover:text-[#17231D]"
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Collection History */}
        {activeTab === "collections" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-right">Fat %</th>
                  <th className="py-3 px-4 text-right">SNF %</th>
                  <th className="py-3 px-4 text-right">Rate</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE8DF]">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-[#FAFCF8]">
                    <td className="py-3 px-4 font-semibold text-[#17231D]">{formatDate(col.date)}</td>
                    <td className="py-3 px-4 text-[#6B756E]">{col.session}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#0B5D3B]">{formatVolume(col.quantity)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#17231D]">{col.fat}%</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#17231D]">{col.snf}%</td>
                    <td className="py-3 px-4 text-right text-[#6B756E]">₹{col.rate}</td>
                    <td className="py-3 px-4 text-right font-black text-[#17231D]">{formatCurrency(col.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <QualityBadge grade={col.quality} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Payment Cycles */}
        {activeTab === "payments" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                <tr>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-right">Settlement</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE8DF]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAFCF8]">
                    <td className="py-3 px-4 font-bold text-[#17231D]">{p.paymentId}</td>
                    <td className="py-3 px-4 text-[#6B756E]">{p.period}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#0B5D3B]">{formatVolume(p.milkQuantity)}</td>
                    <td className="py-3 px-4 text-right font-black text-[#17231D]">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-right text-[#6B756E] font-mono text-[11px]">{p.transactionRef || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Audit Trail */}
        {activeTab === "audit" && (
          <div className="divide-y divide-[#DDE8DF] text-xs">
            {auditLogs.length === 0 ? (
              <p className="p-6 text-center text-[#6B756E]">No administrative modification logs recorded for this farmer.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-[#FAFCF8]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#17231D]">{log.action}</span>
                      <span className="text-[10px] text-[#6B756E]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-[#6B756E]">
                      Change: <span className="line-through text-red-600">{log.oldValue}</span> →{" "}
                      <span className="font-semibold text-emerald-700">{log.newValue}</span>
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0B5D3B]">{log.adminName}</span>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Edit Farmer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${farmer.name}'s Dossier`}
        description="Update administrative and banking records"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Full Name</label>
            <input
              type="text"
              required
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Phone</label>
              <input
                type="text"
                required
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Village</label>
              <input
                type="text"
                required
                value={editData.village}
                onChange={(e) => setEditData({ ...editData, village: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Bank Account</label>
              <input
                type="text"
                value={editData.bankAccount}
                onChange={(e) => setEditData({ ...editData, bankAccount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">IFSC</label>
              <input
                type="text"
                value={editData.ifsc}
                onChange={(e) => setEditData({ ...editData, ifsc: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Postal Address</label>
            <input
              type="text"
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Dossier
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

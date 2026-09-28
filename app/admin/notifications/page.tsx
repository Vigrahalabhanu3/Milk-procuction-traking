"use client";

import React, { useState, useEffect } from "react";
import {
  getNotifications,
  createNotification,
} from "@/lib/services/notification.service";
import { getFarmers } from "@/lib/services/farmer.service";
import { AppNotification, Farmer } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { Bell, Plus, Send, CheckCircle2, User, Users } from "lucide-react";

export default function AdminNotificationsPage() {
  const { success, error: toastError } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"ALL" | "FARMER">("ALL");
  const [targetFarmerId, setTargetFarmerId] = useState("");
  const [notifType, setNotifType] = useState<"system" | "collection" | "payment" | "quality">("system");

  const loadAll = async () => {
    const [notifs, fs] = await Promise.all([
      getNotifications({ role: "ADMIN" }),
      getFarmers(),
    ]);
    setNotifications(notifs);
    setFarmers(fs);
    if (fs.length > 0 && !targetFarmerId) {
      setTargetFarmerId(fs[0].farmerId);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toastError("Please enter notification title and message.");
      return;
    }

    try {
      await createNotification({
        title,
        message,
        targetRole: targetType === "ALL" ? "ALL" : "FARMER",
        targetFarmerId: targetType === "FARMER" ? targetFarmerId : undefined,
        type: notifType,
      });

      setIsModalOpen(false);
      setTitle("");
      setMessage("");
      await loadAll();
      success("Notification dispatched to recipient(s).");
    } catch {
      toastError("Failed to dispatch notification.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Notification Dispatch Center
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Send real-time alerts, payment updates, and test certifications directly to farmers.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="gap-2 shadow-xs">
          <Send className="w-4 h-4" />
          Send New Notification
        </Button>
      </div>

      {/* Notifications Ledger */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-[#DDE8DF] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#17231D]">Dispatched Notifications</h3>
            <p className="text-xs text-[#6B756E]">Broadcast and targeted delivery history</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
              <tr>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Message</th>
                <th className="py-3.5 px-4">Target Audience</th>
                <th className="py-3.5 px-4">Sent Timestamp</th>
                <th className="py-3.5 px-4 text-center">Receipt Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8DF]">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-[#FAFCF8]">
                  <td className="py-3.5 px-4 font-bold text-[#17231D]">{n.title}</td>
                  <td className="py-3.5 px-4 text-[#6B756E] max-w-sm truncate">{n.message}</td>
                  <td className="py-3.5 px-4 font-medium text-[#17231D]">
                    {n.targetRole === "ALL" ? (
                      <span className="inline-flex items-center gap-1 text-[#0B5D3B]">
                        <Users className="w-3.5 h-3.5" /> All Farmers
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#3A8F3D]">
                        <User className="w-3.5 h-3.5" /> {n.targetFarmerId || "Farmer"}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#6B756E]">
                    {new Date(n.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Delivered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Send Notification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Send Farmer Notification"
        description="Dispatch SMS & dashboard alert to individual farmer or all members"
      >
        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Target Audience</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType("ALL")}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  targetType === "ALL"
                    ? "bg-[#0B5D3B] text-white border-[#0B5D3B]"
                    : "bg-white text-[#6B756E] border-[#DDE8DF]"
                }`}
              >
                All Registered Farmers
              </button>
              <button
                type="button"
                onClick={() => setTargetType("FARMER")}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  targetType === "FARMER"
                    ? "bg-[#0B5D3B] text-white border-[#0B5D3B]"
                    : "bg-white text-[#6B756E] border-[#DDE8DF]"
                }`}
              >
                Specific Farmer
              </button>
            </div>
          </div>

          {targetType === "FARMER" && (
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Select Target Farmer</label>
              <select
                value={targetFarmerId}
                onChange={(e) => setTargetFarmerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-semibold"
              >
                {farmers.map((f) => (
                  <option key={f.id} value={f.farmerId}>
                    {f.farmerId} — {f.name} ({f.village})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Notification Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Milk Collection Recorded or Payment Disbursed"
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Notification Message *</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the notification details here..."
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Category</label>
            <select
              value={notifType}
              onChange={(e) => setNotifType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
            >
              <option value="collection">Collection Alert</option>
              <option value="payment">Payment Disbursement</option>
              <option value="quality">Quality Certification</option>
              <option value="system">General Announcement / System</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Dispatch Notification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

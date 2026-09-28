"use client";

import React, { useState, useEffect } from "react";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "@/lib/services/announcement.service";
import { Announcement } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { Megaphone, Plus, Trash2, Calendar, ShieldCheck, User } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const { success, error: toastError } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [priority, setPriority] = useState<"Normal" | "High" | "Urgent">("High");
  const [status, setStatus] = useState<"Active" | "Draft" | "Expired">("Active");

  const loadAnnouncements = async () => {
    const list = await getAnnouncements();
    setAnnouncements(list);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toastError("Please fill out both announcement title and message.");
      return;
    }

    try {
      await createAnnouncement({
        title,
        message,
        startDate,
        endDate,
        priority,
        status,
        author: "Dairy Administration Directorate",
      });
      setIsModalOpen(false);
      setTitle("");
      setMessage("");
      await loadAnnouncements();
      success("Cooperative announcement broadcasted successfully.");
    } catch {
      toastError("Failed to publish announcement.");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAnnouncement(id);
    await loadAnnouncements();
    success("Announcement archived.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Cooperative Announcements
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Broadcast incentives, vaccination schedules, and union notices directly to farmer dashboards.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="gap-2 shadow-xs">
          <Plus className="w-4 h-4" />
          Create Announcement
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <EmptyState
            title="No active announcements"
            description="Broadcast alerts and incentives to your dairy farmers."
            actionText="Create Announcement"
            onAction={() => setIsModalOpen(true)}
            icon={Megaphone}
          />
        ) : (
          announcements.map((ann) => (
            <Card key={ann.id} hover className="p-5 border-l-4 border-l-[#0B5D3B]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0B5D3B] text-white">
                      {ann.priority} Priority
                    </span>
                    <StatusBadge status={ann.status} />
                    <span className="text-xs text-[#6B756E] flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(ann.startDate)} — {formatDate(ann.endDate)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#17231D]">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-[#6B756E] leading-relaxed max-w-3xl">
                    {ann.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-2 rounded-xl text-[#6B756E] hover:text-[#D9534F] hover:bg-red-50 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast New Announcement"
        description="This will appear immediately on the dashboard of all registered dairy farmers."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Announcement Headline *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quarterly Quality & Fat Incentive Bonus (₹1.50/L)"
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Detailed Message *</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detailed guidelines, dates, and instructions for cooperative members..."
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-semibold"
              >
                <option value="Normal">Normal</option>
                <option value="High">High Incentive</option>
                <option value="Urgent">Urgent / Important</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              >
                <option value="Active">Active (Publish now)</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

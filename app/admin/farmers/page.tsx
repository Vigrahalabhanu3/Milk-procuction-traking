"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getFarmers,
  createFarmer,
  updateFarmer,
  deleteFarmer,
  setFarmerStatus,
} from "@/lib/services/farmer.service";
import { Farmer, FarmerStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Modal, ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ResponsiveListSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatVolume, formatDate } from "@/lib/utils";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export default function AdminFarmersPage() {
  const { success, error: toastError } = useToast();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [villageFilter, setVillageFilter] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

  // Form fields for Add/Edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    village: "",
    address: "",
    cattleCount: 6,
    status: "Active" as FarmerStatus,
  });

  const loadFarmers = async () => {
    setIsLoading(true);
    try {
      const data = await getFarmers();
      setFarmers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFarmers();
  }, []);

  // Filtered & Paginated
  const uniqueVillages = useMemo(() => {
    const set = new Set(farmers.map((f) => f.village));
    return Array.from(set).sort();
  }, [farmers]);

  const filtered = useMemo(() => {
    return farmers.filter((f) => {
      if (statusFilter !== "ALL" && f.status !== statusFilter) return false;
      if (villageFilter !== "ALL" && f.village !== villageFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          f.farmerId.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.phone.includes(q) ||
          f.village.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [farmers, statusFilter, villageFilter, searchTerm]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      village: "",
      address: "",
      cattleCount: 6,
      status: "Active",
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      name: farmer.name,
      email: farmer.email,
      phone: farmer.phone,
      village: farmer.village,
      address: farmer.address,
      cattleCount: farmer.cattleCount,
      status: farmer.status,
    });
    setEditModalOpen(true);
  };

  const handleOpenDelete = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setDeleteDialogOpen(true);
  };

  const handleCreateFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.village) {
      toastError("Please fill out required name, phone, and village.");
      return;
    }

    try {
      await createFarmer({
        name: formData.name,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, ".")}@dairyflow.com`,
        phone: formData.phone,
        village: formData.village,
        address: formData.address || `${formData.village} Rural`,
        cattleCount: formData.cattleCount,
      });
      setAddModalOpen(false);
      await loadFarmers();
      success("Farmer registered successfully.");
    } catch {
      toastError("Failed to register farmer.");
    }
  };

  const handleUpdateFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer) return;

    try {
      await updateFarmer(selectedFarmer.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        village: formData.village,
        address: formData.address,
        cattleCount: formData.cattleCount,
        status: formData.status,
      });
      setEditModalOpen(false);
      await loadFarmers();
      success("Farmer updated successfully.");
    } catch {
      toastError("Failed to update farmer.");
    }
  };

  const handleToggleStatus = async (farmer: Farmer) => {
    const newStatus: FarmerStatus = farmer.status === "Active" ? "Inactive" : "Active";
    await setFarmerStatus(farmer.id, newStatus);
    await loadFarmers();
    success(`Farmer marked as ${newStatus}.`);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFarmer) return;
    await deleteFarmer(selectedFarmer.id);
    setDeleteDialogOpen(false);
    await loadFarmers();
    success("Farmer record deleted successfully.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Farmer Directory & Accounts
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Manage cooperative member registrations, village clusters, and status.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-2 self-start sm:self-auto shadow-xs">
          <Plus className="w-4 h-4" />
          <span>+ Add Farmer</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B756E]" />
            <input
              type="text"
              placeholder="Search by name, ID, phone..."
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
              <option value="ALL">All Account Statuses</option>
              <option value="Active">Active Producers</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending Approval</option>
            </select>
          </div>

          <div>
            <select
              value={villageFilter}
              onChange={(e) => {
                setVillageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            >
              <option value="ALL">All Villages</option>
              {uniqueVillages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== "ALL" || villageFilter !== "ALL") && (
          <div className="flex items-center justify-between text-xs text-[#6B756E] pt-2 border-t border-[#DDE8DF]">
            <span>Showing {filtered.length} of {farmers.length} farmers</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setVillageFilter("ALL");
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
            <ResponsiveListSkeleton rows={8} cols={9} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No farmers found"
            description="No cooperative member accounts match your current filter criteria."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
              setVillageFilter("ALL");
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                  <tr>
                    <th className="py-3.5 px-4">Farmer ID</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Village</th>
                    <th className="py-3.5 px-4 text-right">Today&apos;s Milk</th>
                    <th className="py-3.5 px-4 text-right">Total Milk</th>
                    <th className="py-3.5 px-4 text-right">Earnings</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE8DF]">
                  {paginated.map((f) => (
                    <tr key={f.id} className="hover:bg-[#FAFCF8] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0B5D3B]">
                        <Link href={`/admin/farmers/${f.farmerId}`} className="hover:underline">
                          {f.farmerId}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#17231D]">
                        <Link href={`/admin/farmers/${f.farmerId}`} className="hover:text-[#0B5D3B]">
                          {f.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B756E] font-mono">{f.phone}</td>
                      <td className="py-3.5 px-4 text-[#17231D]">{f.village}</td>
                      <td className="py-3.5 px-4 text-right font-black text-[#0B5D3B]">
                        {formatVolume(f.milkToday)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#17231D]">
                        {formatVolume(f.totalMilk)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-[#17231D]">
                        {formatCurrency(f.totalEarnings)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/farmers/${f.farmerId}`}
                            className="p-1.5 rounded-lg text-[#0B5D3B] hover:bg-[#0B5D3B]/10 transition-colors"
                            title="View Farmer Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(f)}
                            className="p-1.5 rounded-lg text-[#3A8F3D] hover:bg-[#3A8F3D]/10 transition-colors"
                            title="Edit Farmer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(f)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            title={f.status === "Active" ? "Deactivate Farmer" : "Activate Farmer"}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(f)}
                            className="p-1.5 rounded-lg text-[#D9534F] hover:bg-red-50 transition-colors"
                            title="Delete Farmer"
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

      {/* Add Farmer Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Farmer"
        description="Add a new milk producer to the cooperative union network."
      >
        <form onSubmit={handleCreateFarmer} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="optional"
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Village / Cluster *</label>
              <input
                type="text"
                required
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="e.g. Green Valley"
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Cattle Head Count</label>
              <input
                type="number"
                min={1}
                value={formData.cattleCount}
                onChange={(e) => setFormData({ ...formData, cattleCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Postal Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Near Panchayat Office"
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Register Farmer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Farmer Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Farmer Profile"
        description={`Updating official records for ${selectedFarmer?.farmerId}`}
      >
        <form onSubmit={handleUpdateFarmer} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as FarmerStatus })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Village</label>
              <input
                type="text"
                required
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#17231D]">Cattle Count</label>
              <input
                type="number"
                value={formData.cattleCount}
                onChange={(e) => setFormData({ ...formData, cattleCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-[#17231D]">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE8DF]">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Farmer Record?"
        message={`Are you sure you want to delete ${selectedFarmer?.name} (${selectedFarmer?.farmerId})? All historical collection records and payment calculations will remain in audit logs.`}
        confirmText="Delete Farmer"
        isDestructive
      />
    </div>
  );
}

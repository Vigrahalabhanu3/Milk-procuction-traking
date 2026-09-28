"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getFarmerById, updateFarmer } from "@/lib/services/farmer.service";
import { Farmer } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  Calendar,
  ShieldCheck,
  Lock,
  Building2,
  CheckCircle2,
  LogOut,
} from "lucide-react";

export default function FarmerProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const farmerId = user?.farmerId || "FARM001";
  const { success, error } = useToast();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [address, setAddress] = useState("");
  const [cattleCount, setCattleCount] = useState<number>(8);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getFarmerById(farmerId);
        if (data) {
          setFarmer(data);
          setPhone(data.phone);
          setVillage(data.village);
          setAddress(data.address);
          setCattleCount(data.cattleCount || 8);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [farmerId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer) return;

    setIsSaving(true);
    try {
      const updated = await updateFarmer(farmer.id, {
        phone,
        village,
        address,
        cattleCount,
      });

      if (updated) {
        setFarmer(updated);
        updateUser({ phone, village, address });
        success("Farmer profile updated successfully.");
      }
    } catch {
      error("Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    success("Logged out successfully. Have a great day!");
    router.push("/login");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Page Header with Responsive Layout and Direct Logout Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
            Farmer Membership Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Registered member details and chilling center dispatch verification.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200 transition-colors text-xs sm:text-sm font-bold touch-manipulation shadow-2xs"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span>Logout</span>
        </button>
      </div>

      {/* Profile Overview Card - Enhanced Shapes & Responsiveness */}
      {isLoading ? (
        <Card className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#DDE8DF] shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl" />
            <div className="flex-1 space-y-2.5 w-full text-center sm:text-left">
              <Skeleton className="h-6 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
              <div className="flex gap-4 pt-2 justify-center sm:justify-start">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#DDE8DF] shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar with Smooth Shapes & Verified Badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0B5D3B]/15 to-[#3A8F3D]/10 border-2 border-[#0B5D3B]/25 flex items-center justify-center text-3xl font-black text-[#0B5D3B] shadow-inner">
                {farmer?.name?.charAt(0) || "R"}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#3A8F3D] border-2 border-white flex items-center justify-center text-white text-[11px] font-bold shadow-xs"
                title="Verified Member"
              >
                ✓
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2 w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#17231D] tracking-tight">
                  {farmer?.name || "Ramesh Kumar"}
                </h2>
                <StatusBadge status={farmer?.status || "Active"} />
              </div>

              <p className="text-xs text-[#6B756E]">
                Permanent Member ID:{" "}
                <span className="inline-block px-2 py-0.5 rounded-lg bg-[#0B5D3B]/10 text-[#0B5D3B] font-extrabold border border-[#0B5D3B]/20">
                  {farmer?.farmerId || "FARM001"}
                </span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-[#6B756E]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAFCF8] border border-[#DDE8DF]">
                  <Calendar className="w-3.5 h-3.5 text-[#3A8F3D]" />
                  Enrolled: {farmer?.joinedDate || "15 Jan 2024"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAFCF8] border border-[#DDE8DF]">
                  <Building2 className="w-3.5 h-3.5 text-[#3A8F3D]" />
                  Unit: Green Valley Dairy
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Editable & Immutable Profile Form */}
      <Card className="p-4 sm:p-6 lg:p-8 bg-white rounded-2xl sm:rounded-3xl border border-[#DDE8DF] shadow-xs">
        <div className="mb-6 pb-4 border-b border-[#DDE8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#17231D]">
              Personal & Contact Information
            </h3>
            <p className="text-xs text-[#6B756E]">
              You may update your active contact and residence details.
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-[#0B5D3B] bg-[#0B5D3B]/10 px-3 py-1 rounded-full border border-[#0B5D3B]/20">
            Safe Profile Editing
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Full Name (Read-Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#17231D]">
                  Registered Full Name
                </label>
                <span className="text-[10px] text-[#6B756E] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#6B756E]" /> Union Locked
                </span>
              </div>
              <input
                type="text"
                disabled
                value={farmer?.name || "Ramesh Kumar"}
                className="w-full px-4 py-3 rounded-xl border border-[#DDE8DF]/80 bg-[#FAFCF8] text-base sm:text-sm font-semibold text-[#6B756E] cursor-not-allowed min-h-[48px]"
              />
            </div>

            {/* Farmer ID (Read-Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#17231D]">
                  Farmer Member ID
                </label>
                <span className="text-[10px] text-[#6B756E] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#6B756E]" /> Immutable
                </span>
              </div>
              <input
                type="text"
                disabled
                value={farmer?.farmerId || "FARM001"}
                className="w-full px-4 py-3 rounded-xl border border-[#DDE8DF]/80 bg-[#FAFCF8] text-base sm:text-sm font-semibold text-[#6B756E] cursor-not-allowed min-h-[48px]"
              />
            </div>

            {/* Email Address (Read-Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#17231D]">
                  Email Address
                </label>
                <span className="text-[10px] text-[#6B756E] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#6B756E]" /> Account ID
                </span>
              </div>
              <input
                type="email"
                disabled
                value={farmer?.email || "farmer@dairyflow.com"}
                className="w-full px-4 py-3 rounded-xl border border-[#DDE8DF]/80 bg-[#FAFCF8] text-base sm:text-sm font-semibold text-[#6B756E] cursor-not-allowed min-h-[48px]"
              />
            </div>

            {/* Phone (Editable) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#17231D]">
                Active Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DDE8DF] text-base sm:text-sm font-medium text-[#17231D] placeholder:text-[#6B756E]/60 focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-white min-h-[48px] transition-all"
                />
              </div>
            </div>

            {/* Village (Editable) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#17231D]">
                Village / Tehsil
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B756E]">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Anand Rural"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DDE8DF] text-base sm:text-sm font-medium text-[#17231D] placeholder:text-[#6B756E]/60 focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-white min-h-[48px] transition-all"
                />
              </div>
            </div>

            {/* Cattle Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#17231D]">
                Number of Dairy Cattle
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={cattleCount}
                onChange={(e) => setCattleCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#DDE8DF] text-base sm:text-sm font-medium text-[#17231D] focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-white min-h-[48px] transition-all"
              />
            </div>
          </div>

          {/* Full Postal Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#17231D]">
              Full Postal Address
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 pointer-events-none text-[#6B756E]">
                <Home className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete village, post, and landmark address"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DDE8DF] text-base sm:text-sm font-medium text-[#17231D] placeholder:text-[#6B756E]/60 focus:outline-none focus:border-[#3A8F3D] focus:ring-2 focus:ring-[#3A8F3D]/20 bg-white min-h-[76px] transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Form Actions - Full-width on mobile */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#DDE8DF]">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              loadingText="Saving changes..."
              className="w-full sm:w-auto min-h-[48px] text-sm sm:text-base font-bold rounded-xl shadow-md touch-manipulation"
            >
              Save Profile Updates
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Security & Dedicated Mobile/Desktop Logout Card */}
      <Card className="p-4 sm:p-6 lg:p-8 bg-white rounded-2xl sm:rounded-3xl border border-[#DDE8DF] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#DDE8DF]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#17231D]">
              Session & Account Security
            </h3>
            <p className="text-xs text-[#6B756E]">
              Manage your active login session and membership security.
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Active Verified Session
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl sm:rounded-2xl bg-[#FAFCF8] border border-[#DDE8DF]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#17231D]">
              <ShieldCheck className="w-4 h-4 text-[#3A8F3D]" />
              <span>Signed in as {farmer?.name || "Ramesh Kumar"}</span>
            </div>
            <p className="text-xs text-[#6B756E] leading-relaxed">
              Active Member ID: <strong className="text-[#0B5D3B]">{farmer?.farmerId || "FARM001"}</strong>. When using a shared mobile phone or device, log out to protect your account.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 transition-colors text-xs sm:text-sm font-bold min-h-[48px] touch-manipulation shadow-2xs shrink-0"
            aria-label="Logout from DairyFlow"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Logout from Account</span>
          </button>
        </div>
      </Card>
    </div>
  );
}

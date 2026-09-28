"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Settings,
  Building,
  Milk,
  Bell,
  Sun,
  Moon,
  Save,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { success } = useToast();
  const [activeSection, setActiveSection] = useState<"general" | "dairy" | "notifications" | "appearance">("general");

  // General Settings State
  const [unionName, setUnionName] = useState("Amrit Green Valley Dairy Cooperative");
  const [centerCode, setCenterCode] = useState("CC-GV-01");
  const [supportEmail, setSupportEmail] = useState("admin@dairyflow.com");
  const [contactPhone, setContactPhone] = useState("+91 98765 43200");

  // Dairy Settings State
  const [measurementUnit, setMeasurementUnit] = useState<"Liters" | "Kilograms">("Liters");
  const [targetFat, setTargetFat] = useState("4.2");
  const [targetSnf, setTargetSnf] = useState("8.5");
  const [defaultRate, setDefaultRate] = useState("42.0");

  // Notifications State
  const [smsReceipts, setSmsReceipts] = useState(true);
  const [emailDisbursals, setEmailDisbursals] = useState(true);
  const [lowQualityAlerts, setLowQualityAlerts] = useState(true);

  // Appearance State
  const [themePreference, setThemePreference] = useState<"light" | "system">("light");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success("DairyFlow system settings updated successfully.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
          System Configuration & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
          Cooperative parameters, chilling center presets, notification triggers, and theme settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-4 space-y-1">
          <Card className="p-2 space-y-1">
            <button
              onClick={() => setActiveSection("general")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeSection === "general"
                  ? "bg-[#0B5D3B] text-white shadow-xs"
                  : "text-[#6B756E] hover:bg-[#FAFCF8] hover:text-[#17231D]"
              }`}
            >
              <Building className="w-4 h-4" />
              <span>General Information</span>
            </button>

            <button
              onClick={() => setActiveSection("dairy")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeSection === "dairy"
                  ? "bg-[#0B5D3B] text-white shadow-xs"
                  : "text-[#6B756E] hover:bg-[#FAFCF8] hover:text-[#17231D]"
              }`}
            >
              <Milk className="w-4 h-4" />
              <span>Dairy & Testing Standards</span>
            </button>

            <button
              onClick={() => setActiveSection("notifications")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeSection === "notifications"
                  ? "bg-[#0B5D3B] text-white shadow-xs"
                  : "text-[#6B756E] hover:bg-[#FAFCF8] hover:text-[#17231D]"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notification Dispatch</span>
            </button>

            <button
              onClick={() => setActiveSection("appearance")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeSection === "appearance"
                  ? "bg-[#0B5D3B] text-white shadow-xs"
                  : "text-[#6B756E] hover:bg-[#FAFCF8] hover:text-[#17231D]"
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Appearance & Theme</span>
            </button>
          </Card>
        </div>

        {/* Form Panel */}
        <div className="md:col-span-8">
          <Card className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* SECTION: GENERAL */}
              {activeSection === "general" && (
                <div className="space-y-4 text-xs">
                  <div className="pb-3 border-b border-[#DDE8DF]">
                    <h3 className="text-base font-bold text-[#17231D]">Cooperative Organization Identity</h3>
                    <p className="text-xs text-[#6B756E]">Details displayed on printable vouchers and receipts</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-[#17231D]">
                      Cooperative Society Name
                    </label>
                    <input
                      type="text"
                      value={unionName}
                      onChange={(e) => setUnionName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[#17231D]">
                        Chilling Center Code
                      </label>
                      <input
                        type="text"
                        value={centerCode}
                        onChange={(e) => setCenterCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[#17231D]">
                        Support Hotline
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-[#17231D]">
                      Administrative Contact Email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: DAIRY SETTINGS */}
              {activeSection === "dairy" && (
                <div className="space-y-4 text-xs">
                  <div className="pb-3 border-b border-[#DDE8DF]">
                    <h3 className="text-base font-bold text-[#17231D]">Dairy Testing & Measurement Standards</h3>
                    <p className="text-xs text-[#6B756E]">Default parameters used during milk batch reception</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-[#17231D]">
                      Measurement Unit
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Liters", "Kilograms"] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setMeasurementUnit(unit)}
                          className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                            measurementUnit === unit
                              ? "bg-[#0B5D3B] text-white border-[#0B5D3B]"
                              : "bg-white text-[#6B756E] border-[#DDE8DF]"
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[#17231D]">
                        Target Fat %
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={targetFat}
                        onChange={(e) => setTargetFat(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[#17231D]">
                        Target SNF %
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={targetSnf}
                        onChange={(e) => setTargetSnf(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[#17231D]">
                        Base Rate (₹/L)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={defaultRate}
                        onChange={(e) => setDefaultRate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: NOTIFICATIONS */}
              {activeSection === "notifications" && (
                <div className="space-y-4 text-xs">
                  <div className="pb-3 border-b border-[#DDE8DF]">
                    <h3 className="text-base font-bold text-[#17231D]">Automated SMS & Portal Triggers</h3>
                    <p className="text-xs text-[#6B756E]">Manage alerts sent out to farmers automatically</p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#DDE8DF] hover:bg-[#FAFCF8] cursor-pointer">
                      <div>
                        <span className="font-bold text-[#17231D] block">Instant Collection SMS Slip</span>
                        <span className="text-[#6B756E]">Send volume, fat%, and amount SMS immediately after weighing</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={smsReceipts}
                        onChange={(e) => setSmsReceipts(e.target.checked)}
                        className="rounded border-[#DDE8DF] text-[#0B5D3B] focus:ring-[#3A8F3D] w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#DDE8DF] hover:bg-[#FAFCF8] cursor-pointer">
                      <div>
                        <span className="font-bold text-[#17231D] block">Bank Disbursal Notifications</span>
                        <span className="text-[#6B756E]">Notify farmer when payment status changes to PAID</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailDisbursals}
                        onChange={(e) => setEmailDisbursals(e.target.checked)}
                        className="rounded border-[#DDE8DF] text-[#0B5D3B] focus:ring-[#3A8F3D] w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#DDE8DF] hover:bg-[#FAFCF8] cursor-pointer">
                      <div>
                        <span className="font-bold text-[#17231D] block">Sub-Standard Quality Warnings</span>
                        <span className="text-[#6B756E]">Flag and advise farmer when Fat drops below 3.8%</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={lowQualityAlerts}
                        onChange={(e) => setLowQualityAlerts(e.target.checked)}
                        className="rounded border-[#DDE8DF] text-[#0B5D3B] focus:ring-[#3A8F3D] w-4 h-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION: APPEARANCE */}
              {activeSection === "appearance" && (
                <div className="space-y-4 text-xs">
                  <div className="pb-3 border-b border-[#DDE8DF]">
                    <h3 className="text-base font-bold text-[#17231D]">Brand Appearance & Palette</h3>
                    <p className="text-xs text-[#6B756E]">Certified commercial dairy palette: 80–85% white/light space, 15–20% green accents</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div
                      onClick={() => setThemePreference("light")}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        themePreference === "light"
                          ? "border-[#0B5D3B] bg-[#0B5D3B]/5 shadow-xs"
                          : "border-[#DDE8DF] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-sm text-[#0B5D3B]">DairyFlow Light Green (Default)</span>
                        <CheckCircle2 className="w-5 h-5 text-[#3A8F3D]" />
                      </div>
                      <div className="h-16 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF] p-2 flex items-center gap-2">
                        <div className="w-5 h-full rounded-md bg-[#0B5D3B]" />
                        <div className="w-5 h-full rounded-md bg-[#3A8F3D]" />
                        <div className="w-5 h-full rounded-md bg-[#F4C95D]" />
                        <div className="flex-1 h-full rounded-md bg-white border border-[#DDE8DF]" />
                      </div>
                      <p className="text-[11px] text-[#6B756E] mt-3">Clean white cards, deep forest sidebar, crisp borders.</p>
                    </div>

                    <div
                      onClick={() => setThemePreference("system")}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        themePreference === "system"
                          ? "border-[#0B5D3B] bg-[#0B5D3B]/5 shadow-xs"
                          : "border-[#DDE8DF] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-sm text-[#17231D]">System Sync</span>
                        {themePreference === "system" && <CheckCircle2 className="w-5 h-5 text-[#3A8F3D]" />}
                      </div>
                      <div className="h-16 rounded-xl bg-slate-100 border border-[#DDE8DF] p-2 flex items-center gap-2">
                        <div className="w-5 h-full rounded-md bg-[#07452C]" />
                        <div className="w-5 h-full rounded-md bg-[#3A8F3D]" />
                        <div className="flex-1 h-full rounded-md bg-slate-50 border border-slate-200" />
                      </div>
                      <p className="text-[11px] text-[#6B756E] mt-3">Follow operating system daytime schedule.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-[#DDE8DF]">
                <Button type="submit" variant="primary" size="md" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Configuration
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

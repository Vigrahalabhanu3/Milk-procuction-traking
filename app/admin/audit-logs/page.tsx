"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getAuditLogs } from "@/lib/services/audit.service";
import { downloadCSV } from "@/lib/services/report.service";
import { AuditLog } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowRight,
  History,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const { success } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const uniqueActions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (actionFilter !== "ALL" && l.action !== actionFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          l.adminName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.entity.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q) ||
          l.oldValue.toLowerCase().includes(q) ||
          l.newValue.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, actionFilter, searchTerm]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Admin User", "Action", "Entity", "Entity ID", "Old Value", "New Value"];
    const rows = filtered.map((l) => [
      l.timestamp,
      l.adminName,
      l.action,
      l.entity,
      l.entityId,
      l.oldValue,
      l.newValue,
    ]);
    downloadCSV("admin_system_audit_trail", headers, rows);
    success("Audit logs exported to CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
              Administrative Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0B5D3B]/10 text-[#0B5D3B] text-xs font-bold">
              Immutable Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Complete compliance tracking of collection updates, rate modifications, and farmer state changes.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 self-start sm:self-auto">
          <Download className="w-4 h-4 text-[#0B5D3B]" />
          Export Audit Trail
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B756E]" />
            <input
              type="text"
              placeholder="Search by admin name, action, or farmer..."
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
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE8DF] focus:outline-none focus:border-[#3A8F3D] bg-[#FAFCF8]"
            >
              <option value="ALL">All Administrative Actions</option>
              {uniqueActions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || actionFilter !== "ALL") && (
          <div className="flex items-center justify-between text-xs text-[#6B756E] pt-2 border-t border-[#DDE8DF]">
            <span>Showing {filtered.length} of {logs.length} logged modifications</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setActionFilter("ALL");
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
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No audit entries found"
            description="No system modifications recorded matching your criteria."
            actionText="Reset Filters"
            onAction={() => {
              setSearchTerm("");
              setActionFilter("ALL");
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCF8] text-[#6B756E] uppercase font-bold tracking-wider border-b border-[#DDE8DF]">
                  <tr>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Admin User</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Entity / Target</th>
                    <th className="py-3.5 px-4">Previous Value</th>
                    <th className="py-3.5 px-4">Updated Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE8DF]">
                  {paginated.map((l) => (
                    <tr key={l.id} className="hover:bg-[#FAFCF8] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#17231D]">
                        {formatDate(l.date)}
                        <span className="block text-[10px] text-[#6B756E] font-normal">
                          {new Date(l.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0B5D3B]">{l.adminName}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#17231D]">{l.action}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#17231D] block">{l.entity}</span>
                        <span className="text-[10px] text-[#6B756E] font-mono">{l.entityId}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#D9534F] font-mono line-through bg-red-50/40">
                        {l.oldValue}
                      </td>
                      <td className="py-3.5 px-4 text-[#0B5D3B] font-bold bg-emerald-50/40">
                        {l.newValue}
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
    </div>
  );
}

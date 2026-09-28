"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/services/notification.service";
import { AppNotification } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  Bell,
  CheckCheck,
  Milk,
  Receipt,
  Award,
  Megaphone,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FarmerNotificationsPage() {
  const { user } = useAuth();
  const farmerId = user?.farmerId || "FARM001";
  const { success } = useToast();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const list = await getNotifications({
        role: "FARMER",
        farmerId,
      });
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [farmerId]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    await loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead({ role: "FARMER", farmerId });
    await loadNotifications();
    success("All notifications marked as read.");
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "collection":
        return <Milk className="w-5 h-5 text-[#3A8F3D]" />;
      case "payment":
        return <Receipt className="w-5 h-5 text-[#0B5D3B]" />;
      case "quality":
        return <Award className="w-5 h-5 text-[#F4C95D]" />;
      case "announcement":
        return <Megaphone className="w-5 h-5 text-[#3A8F3D]" />;
      default:
        return <Bell className="w-5 h-5 text-[#0B5D3B]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#17231D] tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#0B5D3B] text-white text-xs font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#6B756E] mt-1">
            Collection confirmations, daily rate updates, and payout alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2 self-start sm:self-auto">
            <CheckCheck className="w-4 h-4 text-[#3A8F3D]" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-2xl shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You are completely caught up! New alerts will appear here as milk drops and payments are recorded."
            icon={Bell}
          />
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                "p-4 transition-all duration-150 flex items-start gap-4",
                !n.isRead ? "bg-white border-[#3A8F3D]/40 shadow-xs" : "bg-[#FAFCF8]/80 opacity-80"
              )}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#0B5D3B]/5 border border-[#DDE8DF] flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-[#17231D] truncate">{n.title}</h4>
                  <span className="text-[11px] text-[#6B756E] shrink-0">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-[#6B756E] leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="shrink-0 p-1.5 rounded-lg text-[#0B5D3B] hover:bg-[#0B5D3B]/10 transition-colors text-xs font-semibold"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#3A8F3D]" />
                </button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useHome } from "@/components/providers/home-provider";

export interface NotificationItem {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  targetId?: string;
  targetType?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  space?: {
    id: string;
    name: string;
  };
  groupCount?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  groupItems?: any[];
}

export interface NotificationBuckets {
  today: NotificationItem[];
  yesterday: NotificationItem[];
  thisWeek: NotificationItem[];
  earlier: NotificationItem[];
}

export function useNotifications() {
  const { activeHome, user } = useHome();

  const storageKeyRead = `homehub_notifs_read_${user?.id}_${activeHome?.id}`;
  const storageKeyDismissed = `homehub_notifs_dismissed_${user?.id}_${activeHome?.id}`;

  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsClient(true);
      if (activeHome?.id && user?.id) {
        setLastReadTimestamp(Number(localStorage.getItem(storageKeyRead) || "0"));
        setDismissedIds(JSON.parse(localStorage.getItem(storageKeyDismissed) || "[]"));
      }
    }, 0);
  }, [activeHome?.id, user?.id, storageKeyRead, storageKeyDismissed]);

  const { data, isLoading } = useQuery<NotificationBuckets>({
    queryKey: ["notifications", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return { today: [], yesterday: [], thisWeek: [], earlier: [] };
      const res = await fetch(`/api/notifications`, {
        headers: { "x-home-id": activeHome.id }
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: !!activeHome?.id,
    refetchInterval: 30000, // Poll every 30s
  });

  const filterDismissed = (bucket: NotificationItem[]) => {
    return bucket.filter(item => !dismissedIds.includes(item.id));
  };

  const filteredData = data ? {
    today: filterDismissed(data.today),
    yesterday: filterDismissed(data.yesterday),
    thisWeek: filterDismissed(data.thisWeek),
    earlier: filterDismissed(data.earlier),
  } : { today: [], yesterday: [], thisWeek: [], earlier: [] };

  const totalFilteredCount = 
    filteredData.today.length + 
    filteredData.yesterday.length + 
    filteredData.thisWeek.length + 
    filteredData.earlier.length;

  const unreadCount = isClient && data ? 
    filteredData.today.concat(filteredData.yesterday, filteredData.thisWeek, filteredData.earlier)
    .filter(item => new Date(item.createdAt).getTime() > lastReadTimestamp)
    .length 
    : 0;

  const markAllAsRead = () => {
    const now = Date.now();
    localStorage.setItem(storageKeyRead, now.toString());
    setLastReadTimestamp(now);
  };

  const deleteNotification = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    localStorage.setItem(storageKeyDismissed, JSON.stringify(newDismissed));
    setDismissedIds(newDismissed);
  };

  return {
    data: filteredData,
    isLoading,
    unreadCount,
    totalCount: totalFilteredCount,
    markAllAsRead,
    deleteNotification,
  };
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Trash2, Bell, PackageOpen, Folder, FileText, Wrench, Receipt, User, Activity } from "lucide-react";
import { useNotifications, NotificationItem } from "@/hooks/use-notifications";
import { useHome } from "@/components/providers/home-provider";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const router = useRouter();
  const { data, isLoading, unreadCount, markAllAsRead, deleteNotification, totalCount } = useNotifications();
  const { activeHome } = useHome();

  // Escape closes drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const getIcon = (type: string) => {
    if (type.includes("ASSET")) return <PackageOpen className="w-4 h-4" />;
    if (type.includes("SPACE")) return <Folder className="w-4 h-4" />;
    if (type.includes("DOCUMENT")) return <FileText className="w-4 h-4" />;
    if (type.includes("MAINTENANCE")) return <Wrench className="w-4 h-4" />;
    if (type.includes("EXPENSE")) return <Receipt className="w-4 h-4" />;
    if (type.includes("MEMBER") || type.includes("INVITATION")) return <User className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getUrl = (item: NotificationItem) => {
    if (item.targetId) {
      if (item.type.includes("ASSET")) return `/assets/${item.targetId}`;
      if (item.type.includes("SPACE")) return `/spaces/${item.targetId}`;
      if (item.type.includes("DOCUMENT")) return `/vault/${item.targetId}`;
      if (item.type.includes("MAINTENANCE")) return `/care/${item.targetId}`;
      if (item.type.includes("EXPENSE")) return `/money/${item.targetId}`;
      if (item.type.includes("MEMBER")) return `/family/${item.targetId}`;
    }
    return "/home"; // fallback
  };

  const renderGroup = (title: string, items: NotificationItem[]) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1">{title}</h3>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="group relative bg-background border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex gap-4">
                  <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-primary shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.groupCount && item.groupCount > 1 ? (
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {item.groupCount} new {item.type.split("_")[0].toLowerCase()}s were added
                      </p>
                    ) : (
                      <p className="text-sm text-foreground leading-snug">
                        <span className="font-medium">{item.user?.name || "System"}</span> {item.description.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)/g, (match, p1) => formatCurrency(parseFloat(p1.replace(/,/g, '')), activeHome?.currency))}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <button 
                        onClick={() => { onClose(); router.push(getUrl(item)); }}
                        className="text-primary hover:underline font-medium"
                      >
                        {item.targetType ? `View ${item.targetType.toLowerCase()}` : "View details"}
                      </button>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteNotification(item.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Remove notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-md bg-background border-l border-border/50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-xl">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground leading-tight">Notifications</h2>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground">{unreadCount} unread update{unreadCount !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-full transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 overscroll-contain">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-secondary/50 rounded-2xl" />
                  ))}
                </div>
              ) : totalCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
                    <Bell className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="font-medium text-foreground">Your home is quiet</h3>
                  <p className="text-sm text-muted-foreground max-w-[240px]">
                    As your household becomes active, important updates will elegantly appear here.
                  </p>
                  <button 
                    onClick={() => { onClose(); router.push('/spaces'); }}
                    className="text-sm text-primary font-medium hover:underline mt-2"
                  >
                    Explore Home
                  </button>
                </div>
              ) : (
                <>
                  {renderGroup("Today", data.today)}
                  {renderGroup("Yesterday", data.yesterday)}
                  {renderGroup("Earlier This Week", data.thisWeek)}
                  {renderGroup("Earlier", data.earlier)}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

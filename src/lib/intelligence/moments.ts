import { HomeMetrics } from "./metrics";

export interface HomeMoment {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
}

export function detectHomeMoments(metrics: HomeMetrics): HomeMoment[] {
  const moments: HomeMoment[] = [];
  const now = new Date().toISOString();

  // First Asset
  if (metrics.totalAssets === 1) {
    moments.push({
      id: "first-asset",
      title: "First Home Milestone",
      description: "You added your first appliance.",
      icon: "PackageOpen",
      date: now,
    });
  }
  
  // 50 Assets
  if (metrics.totalAssets >= 50) {
    moments.push({
      id: "50-assets",
      title: "Milestone Reached",
      description: "Your home reached 50 tracked objects.",
      icon: "PackageOpen",
      date: now,
    });
  }

  // First Maintenance
  if (metrics.completedMaintenance === 1) {
    moments.push({
      id: "first-maintenance",
      title: "First Care Action",
      description: "Your family completed its first maintenance task.",
      icon: "Wrench",
      date: now,
    });
  }

  // Organization
  if (metrics.totalSpaces > 0 && metrics.assetsWithoutSpaces === 0 && metrics.totalAssets > 0) {
    moments.push({
      id: "perfect-organization",
      title: "Perfectly Organized",
      description: "Every item in your home belongs to a specific space.",
      icon: "Box",
      date: now,
    });
  }

  // Family Collaboration
  const recentFamilyActivity = metrics.recentActivities?.filter(a => {
    const diff = new Date().getTime() - new Date(a.createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  });
  
  const uniqueUsers = new Set(recentFamilyActivity?.map(a => a.userId));
  if (uniqueUsers.size > 1) {
    moments.push({
      id: "family-collaboration",
      title: "Shared Home",
      description: "Multiple household members contributed to the home this week.",
      icon: "Users",
      date: now,
    });
  }

  // Active home
  if (metrics.recentActivities && metrics.recentActivities.length > 20) {
    moments.push({
      id: "active-home",
      title: "Vibrant Home",
      description: "Your home has been highly active this month.",
      icon: "Activity",
      date: now,
    });
  }

  return moments;
}

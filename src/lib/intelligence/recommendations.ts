import { HomeMetrics } from "./metrics";

export interface Recommendation {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  relatedEntity?: string;
}

export interface AttentionCenter {
  urgent: Recommendation[];
  upcoming: Recommendation[];
  suggestions: Recommendation[];
}

export function generateRecommendations(metrics: HomeMetrics): AttentionCenter {
  const center: AttentionCenter = {
    urgent: [],
    upcoming: [],
    suggestions: []
  };

  // High Priority
  if (metrics.overdueMaintenance > 0) {
    center.urgent.push({
      priority: "high",
      title: "Overdue Maintenance",
      description: `You have ${metrics.overdueMaintenance} tasks that need immediate attention.`,
      actionLabel: "View Tasks",
      actionRoute: "/care"
    });
  }

  // Medium Priority (Upcoming / Important)
  if (metrics.totalAssets > 0 && metrics.totalMaintenance === 0) {
    center.upcoming.push({
      priority: "medium",
      title: "No Care Schedule",
      description: "Your home has important objects but no care schedule yet.",
      actionLabel: "Schedule Maintenance",
      actionRoute: "/care/create"
    });
  }

  if (metrics.totalSpaces > 0 && metrics.assetsWithoutSpaces > 0) {
    center.suggestions.push({
      priority: "medium",
      title: "Unorganized Belongings",
      description: `Some belongings (${metrics.assetsWithoutSpaces}) are not organized into spaces.`,
      actionLabel: "Organize Assets",
      actionRoute: "/assets"
    });
  }

  if (metrics.totalDocuments === 0 && metrics.totalAssets > 0) {
    center.urgent.push({
      priority: "high", // Promoted to urgent for "Missing important documents"
      title: "Missing Digital Records",
      description: "Your home has no digital records like manuals or warranties yet.",
      actionLabel: "Upload Document",
      actionRoute: "/vault/upload"
    });
  }

  // Low Priority (Suggestions)
  if (metrics.totalMembers === 1 && (metrics.totalAssets > 5 || metrics.totalSpaces > 3)) {
    center.suggestions.push({
      priority: "low",
      title: "Invite Co-managers",
      description: "Managing a home is easier together. Invite family or roommates.",
      actionLabel: "Invite Members",
      actionRoute: "/family"
    });
  }

  if (metrics.totalExpenses === 0 && metrics.totalMaintenance > 0) {
    center.suggestions.push({
      priority: "low",
      title: "Track Home Investments",
      description: "Log expenses for maintenance to see where your money goes.",
      actionLabel: "Log Expense",
      actionRoute: "/money/create"
    });
  }

  return center;
}

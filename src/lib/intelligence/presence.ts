import { HomeMetrics } from "./metrics";

export interface HomePresence {
  emotionalSummary: string;
  activityState: string;
  organizationState: string;
  maintenanceState: string;
  recentChanges: string;
}

export function generateHomePresence(metrics: HomeMetrics): HomePresence {
  // If the home is brand new
  if (metrics.totalAssets === 0 && metrics.totalSpaces === 0) {
    return {
      emotionalSummary: "Your home is still learning its rhythm.",
      activityState: "Awaiting your first memories.",
      organizationState: "A blank canvas.",
      maintenanceState: "Ready for care.",
      recentChanges: "Just started.",
    };
  }

  // Emotional Summary
  let emotionalSummary = "Your home is resting quietly.";
  if (metrics.recentActivities && metrics.recentActivities.length > 20) {
    emotionalSummary = "Your home has been vibrantly active this month.";
  } else if (metrics.totalAssets > 20 && metrics.assetsWithoutSpaces === 0) {
    emotionalSummary = "Your home feels perfectly balanced and organized.";
  } else if (metrics.totalAssets > 0) {
    emotionalSummary = "Your home's digital foundation is growing.";
  }

  // Activity State
  let activityState = "Quiet this week.";
  const recentDays = metrics.recentActivities ? metrics.recentActivities.filter(a => {
    const diff = new Date().getTime() - new Date(a.createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length : 0;
  if (recentDays > 5) activityState = "Highly active this week.";
  else if (recentDays > 0) activityState = "Active recently.";

  // Organization State
  let organizationState = "Getting organized.";
  if (metrics.totalSpaces > 0 && metrics.assetsWithoutSpaces === 0) {
    organizationState = "Perfectly organized across all spaces.";
  } else if (metrics.assetsWithoutSpaces > 0 && metrics.totalSpaces > 0) {
    organizationState = `${metrics.assetsWithoutSpaces} objects need a home space.`;
  }

  // Maintenance State
  let maintenanceState = "Up to date.";
  if (metrics.overdueMaintenance > 0) {
    maintenanceState = `Needs care (${metrics.overdueMaintenance} tasks overdue).`;
  } else if (metrics.totalMaintenance > 0) {
    maintenanceState = "Currently well maintained.";
  } else if (metrics.totalAssets > 0) {
    maintenanceState = "No care schedule yet.";
  }

  // Recent Changes
  const recentChanges = recentDays > 0 
    ? `${recentDays} actions recorded in the past 7 days.`
    : "No recent changes.";

  return {
    emotionalSummary,
    activityState,
    organizationState,
    maintenanceState,
    recentChanges,
  };
}

import { HomeMetrics } from "./metrics";

export function generateInsights(metrics: HomeMetrics): string[] {
  const insights: string[] = [];

  if (metrics.totalSpaces === 0 && metrics.totalAssets === 0) {
    return ["Your home is still learning."];
  }

  // Assets Insight
  if (metrics.totalAssets > 0) {
    if (metrics.assetsWithDocuments === metrics.totalAssets) {
      insights.push("Every asset in your home is fully documented.");
    } else if (metrics.assetsWithDocuments > 0) {
      insights.push(`You have documented ${metrics.assetsWithDocuments} major items.`);
    } else {
      insights.push("Your assets currently lack digital records.");
    }
  }

  // Family Insight
  if (metrics.totalMembers > 1) {
    insights.push(`Your home is actively managed by ${metrics.totalMembers} members.`);
  }

  // Maintenance Insight
  if (metrics.completedMaintenance > 0) {
    insights.push(`Your home completed ${metrics.completedMaintenance} maintenance tasks.`);
  }

  // Expense Insight
  if (metrics.totalExpenses > 0) {
    insights.push("Financial tracking is active for home investments.");
  }

  // Organization Insight
  if (metrics.totalSpaces > 0) {
    if (metrics.assetsWithoutSpaces === 0 && metrics.totalAssets > 0) {
      insights.push("All your belongings are perfectly organized into spaces.");
    }
  }

  if (insights.length === 0) {
    insights.push("Your home is still learning.");
  }

  return insights;
}

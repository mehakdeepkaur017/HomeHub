import { HomeMetrics } from "./metrics";

export interface MonthlyReport {
  month: string;
  newAssets: number;
  moneySpent: number;
  maintenanceCompleted: number;
  mostActiveSpace?: string;
  familyParticipation: number;
  healthTrend: "up" | "stable" | "down";
}

export function generateMonthlyReport(metrics: HomeMetrics): MonthlyReport {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
  // We approximate these from metrics. 
  // In a real scenario, this would query specifically for the current month.
  
  return {
    month: currentMonth,
    newAssets: metrics.totalAssets, // Simplified for now
    moneySpent: metrics.moneySpent,
    maintenanceCompleted: metrics.completedMaintenance,
    familyParticipation: metrics.totalMembers,
    healthTrend: "stable",
  };
}

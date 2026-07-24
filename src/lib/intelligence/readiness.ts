import { HomeMetrics } from "./metrics";
import { calculateHomeHealth, HomeHealth } from "./home-health";
import { generateRecommendations, AttentionCenter } from "./recommendations";
import { generateInsights } from "./insights";

export interface IntelligenceBriefing {
  isLearning: boolean;
  health: HomeHealth;
  recommendations: AttentionCenter;
  insights: string[];
  metrics: HomeMetrics;
}

export function generateIntelligenceBriefing(metrics: HomeMetrics): IntelligenceBriefing {
  const isLearning = metrics.totalSpaces === 0 && metrics.totalAssets === 0;
  
  const health = calculateHomeHealth(metrics);
  const recommendations = generateRecommendations(metrics);
  const insights = generateInsights(metrics);

  return {
    isLearning,
    health,
    recommendations,
    insights,
    metrics
  };
}

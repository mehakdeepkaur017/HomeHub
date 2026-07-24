import { HomeMetrics } from "./metrics";

export interface HealthCategory {
  name: string;
  score: number;
  explanation: string;
}

export interface HomeHealth {
  overallScore: number;
  categories: HealthCategory[];
  strengths: string[];
  weaknesses: string[];
  missingInformation: string[];
}

export function calculateHomeHealth(metrics: HomeMetrics): HomeHealth {
  const categories: HealthCategory[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missingInformation: string[] = [];

  // 1. Organization Health (Max 40 points)
  let orgScore = 0;
  if (metrics.totalSpaces > 0) orgScore += 20;
  if (metrics.totalAssets > 0) {
    const placedRatio = (metrics.totalAssets - metrics.assetsWithoutSpaces) / metrics.totalAssets;
    orgScore += placedRatio * 20;
    
    categories.push({
      name: "Organization",
      score: Math.round((orgScore / 40) * 100),
      explanation: `${metrics.totalAssets - metrics.assetsWithoutSpaces} of ${metrics.totalAssets} assets are assigned to spaces.`
    });

    if (metrics.assetsWithoutSpaces > 0) {
      missingInformation.push(`${metrics.assetsWithoutSpaces} objects are not assigned to any room.`);
    }
    if (orgScore >= 35) strengths.push("Highly organized home structure.");
  } else if (metrics.totalSpaces > 0) {
    categories.push({
      name: "Organization",
      score: 100,
      explanation: "Spaces are set up and ready for assets."
    });
  }

  // 2. Documentation Health (Max 30 points)
  let docScore = 0;
  if (metrics.totalAssets > 0) {
    docScore = 10; // Base score for starting tracking
    const docRatio = metrics.assetsWithDocuments / metrics.totalAssets;
    docScore += docRatio * 20;
    
    const docPercent = Math.round((docScore / 30) * 100);
    categories.push({
      name: "Documentation",
      score: docPercent,
      explanation: `You have documented ${metrics.assetsWithDocuments} of ${metrics.totalAssets} tracked items.`
    });

    if (docPercent > 80) strengths.push("Excellent documentation coverage for assets.");
    else if (docPercent < 40) missingInformation.push("Consider uploading manuals or warranties for your assets.");
  }

  // 3. Maintenance Health (Max 20 points)
  let maintScore = 0;
  if (metrics.totalAssets > 0) {
    maintScore = 10; // Base score
    if (metrics.totalMaintenance > 0) {
      maintScore += 10;
    }
    
    if (metrics.overdueMaintenance > 0) {
      maintScore -= (metrics.overdueMaintenance * 5);
      weaknesses.push(`${metrics.overdueMaintenance} maintenance tasks are overdue.`);
    }
    
    maintScore = Math.max(0, maintScore);
    const maintPercent = Math.round((maintScore / 20) * 100);
    
    categories.push({
      name: "Maintenance",
      score: maintPercent,
      explanation: metrics.totalMaintenance === 0 
        ? "No maintenance history exists yet." 
        : `${metrics.completedMaintenance} tasks completed, ${metrics.scheduledMaintenance} scheduled.`
    });

    if (maintPercent > 80) strengths.push("Proactive maintenance schedule.");
  }

  // 4. Family Participation (Max 10 points)
  let familyScore = 10; // Solo users are not penalized
  categories.push({
    name: "Participation",
    score: 100,
    explanation: metrics.totalMembers > 1 ? `${metrics.totalMembers} members collaborate on this home.` : "You are managing this home independently."
  });

  // Calculate Overall Score (out of 100)
  // If they have literally nothing (no spaces, no assets), score is 0.
  // Otherwise it's the sum of the components.
  let overallScore = 0;
  if (metrics.totalSpaces === 0 && metrics.totalAssets === 0) {
    overallScore = 10; // Just for creating the home
  } else {
    overallScore = Math.round(orgScore + docScore + maintScore + familyScore);
    overallScore = Math.max(0, Math.min(100, overallScore));
  }

  return {
    overallScore,
    categories,
    strengths,
    weaknesses,
    missingInformation
  };
}

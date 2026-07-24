"use client";

import { useQuery } from "@tanstack/react-query";
import { useHome } from "@/components/providers/home-provider";

export interface OnboardingCompletion {
  hasSpaces: boolean;
  hasAssets: boolean;
  hasDocuments: boolean;
  hasMaintenance: boolean;
  hasExpenses: boolean;
  hasInvitedFamily: boolean;
  isComplete: boolean;
}

export function useOnboarding() {
  const { activeHome } = useHome();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return null;
      const res = await fetch(`/api/homes/${activeHome.id}/dashboard`, {
        headers: { "x-home-id": activeHome.id }
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    enabled: !!activeHome?.id,
  });

  const completion: OnboardingCompletion = data?.completion || {
    hasSpaces: false,
    hasAssets: false,
    hasDocuments: false,
    hasMaintenance: false,
    hasExpenses: false,
    hasInvitedFamily: false,
    isComplete: false,
  };

  return {
    completion,
    isLoading,
    isLearning: data?.health?.isLearning ?? true
  };
}

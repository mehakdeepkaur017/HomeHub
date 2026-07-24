"use client";

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface Home {
  id: string;
  name: string;
  type: string;
  currency: string;
}

interface Membership {
  role: string;
  home: Home;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

interface HomeContextType {
  activeHomeId: string | null;
  activeHome: Home | null;
  activeRole: string | null;
  memberships: Membership[];
  user: User | null;
  setActiveHomeId: (id: string) => void;
  isLoading: boolean;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: ReactNode }) {
  const [activeHomeId, setActiveHomeIdState] = useState<string | null>(null);

  // Fetch all memberships for the logged in user
  const { data, isLoading } = useQuery<{ user: User, memberships: Membership[] }>({
    queryKey: ["memberships"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me/memberships");
      if (!res.ok) throw new Error("Failed to fetch memberships");
      return res.json();
    },
  });

  const memberships = useMemo(() => data?.memberships || [], [data?.memberships]);
  const user = useMemo(() => data?.user || null, [data?.user]);

  // Sync activeHomeId with local storage or default to first home
  useEffect(() => {
    if (memberships.length > 0 && !activeHomeId) {
      const stored = localStorage.getItem("activeHomeId");
      setTimeout(() => {
        let idToSet = memberships[0].home.id;
        if (stored && memberships.some(m => m.home.id === stored)) {
          idToSet = stored;
        }
        setActiveHomeIdState(idToSet);
        
        const hasCookie = document.cookie.includes(`homeId=`);
        document.cookie = `homeId=${idToSet}; path=/; max-age=31536000; SameSite=Lax`;
        
        if (!hasCookie) {
          window.location.reload();
        }
      }, 0);
    }
  }, [memberships, activeHomeId]);

  const setActiveHomeId = (id: string) => {
    setActiveHomeIdState(id);
    localStorage.setItem("activeHomeId", id);
    document.cookie = `homeId=${id}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Force a router refresh so server components get the new cookie
    window.location.reload();
  };

  const activeMembership = memberships.find(m => m.home.id === activeHomeId);
  const activeHome = activeMembership?.home || null;
  const activeRole = activeMembership?.role || null;

  return (
    <HomeContext.Provider
      value={{
        activeHomeId,
        activeHome,
        activeRole,
        memberships,
        user,
        setActiveHomeId,
        isLoading,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
}

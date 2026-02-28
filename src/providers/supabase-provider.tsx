"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  pair_id: string | null;
};

type SupabaseContextType = {
  supabase: SupabaseClient;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

const MOCK_USER = {
  id: "mock-user-001",
  email: "demo@ami-ru.app",
  app_metadata: {},
  user_metadata: { full_name: "デモユーザー" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

const MOCK_PROFILE: Profile = {
  id: "mock-user-001",
  display_name: "デモユーザー",
  avatar_url: null,
  pair_id: "mock-pair-001",
};

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());

  // Dev mode: use mock user/profile, skip Supabase auth
  const user = MOCK_USER;
  const profile = MOCK_PROFILE;
  const isLoading = false;

  return (
    <SupabaseContext.Provider value={{ supabase, user, profile, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context.supabase;
}

export function useUser() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useUser must be used within a SupabaseProvider");
  }
  return { user: context.user, profile: context.profile, isLoading: context.isLoading };
}

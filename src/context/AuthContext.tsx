import { Session, User } from "@supabase/supabase-js";
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthResult = {
  error?: string;
  message?: string;
  needsEmailConfirmation?: boolean;
};

type AuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      signIn: async (email, password) => {
        if (!supabase) return { error: "Supabase não configurado." };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? { error: error.message } : {};
      },
      signUp: async (name, email, password) => {
        if (!supabase) return { error: "Supabase não configurado." };
        const { data, error } = await supabase.functions.invoke<{ error?: string; ok?: boolean }>("create-account", {
          body: {
            email,
            name,
            password,
            redirectTo: getAuthRedirectUrl()
          }
        });
        if (error) return { error: error.message };
        if (data?.error) return { error: data.error };

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        return signInError ? { error: signInError.message } : {};
      },
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
      }
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

function getAuthRedirectUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "https://metodoraiz.online";
}

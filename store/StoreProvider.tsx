"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from ".";
import { setHydrated } from "./slices/authSlice";
import type { AuthUser } from "@/lib/validators/auth.validators";

const SESSION_KEY = "motomart_session";

interface PersistedSession {
  user:         AuthUser;
  accessToken:  string;
  refreshToken: string;
}

/**
 * Reads localStorage on first render and rehydrates Redux auth state.
 * Runs once — isHydrated gate prevents double execution.
 */
function AuthHydrator() {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) {
        store.dispatch(setHydrated({}));
        return;
      }

      const session: PersistedSession = JSON.parse(raw);

      // Basic shape validation before trusting localStorage data
      if (session?.user?.role && session?.accessToken) {
        store.dispatch(
          setHydrated({
            user:         session.user,
            accessToken:  session.accessToken,
            refreshToken: session.refreshToken ?? null,
          })
        );
      } else {
        localStorage.removeItem(SESSION_KEY);
        store.dispatch(setHydrated({}));
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
      store.dispatch(setHydrated({}));
    }
  }, []);

  return null;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, AuthTokens } from "@/lib/validators/auth.validators";

interface AuthState {
  user:         AuthUser | null;
  accessToken:  string | null;
  refreshToken: string | null;
  expiresAt:    number | null;   // unix ms when access token expires
  isHydrated:   boolean;         // true once localStorage has been read
}

const initialState: AuthState = {
  user:         null,
  accessToken:  null,
  refreshToken: null,
  expiresAt:    null,
  isHydrated:   false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Called after a successful login / register / token refresh */
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthUser; tokens: AuthTokens }>
    ) {
      const { user, tokens } = action.payload;
      state.user         = user;
      state.accessToken  = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.expiresAt    = Date.now() + tokens.expiresIn * 1000;
    },

    /** Called after a silent token refresh (access token only rotated) */
    setTokens(state, action: PayloadAction<AuthTokens>) {
      state.accessToken  = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiresAt    = Date.now() + action.payload.expiresIn * 1000;
    },

    /** Called on logout or 401 that can't be recovered */
    clearCredentials(state) {
      state.user         = null;
      state.accessToken  = null;
      state.refreshToken = null;
      state.expiresAt    = null;
    },

    /** Called once on app mount after reading localStorage */
    setHydrated(state, action: PayloadAction<Partial<AuthState>>) {
      Object.assign(state, action.payload, { isHydrated: true });
    },
  },
});

export const { setCredentials, setTokens, clearCredentials, setHydrated } =
  authSlice.actions;

export default authSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────────
import type { RootState } from "@/store";

export const selectCurrentUser        = (s: RootState) => s.auth.user;
export const selectAccessToken        = (s: RootState) => s.auth.accessToken;
export const selectRefreshToken       = (s: RootState) => s.auth.refreshToken;
export const selectIsLoggedIn         = (s: RootState) => !!s.auth.user;
export const selectIsAdmin            = (s: RootState) => s.auth.user?.role === "admin";
export const selectIsHydrated         = (s: RootState) => s.auth.isHydrated;
export const selectTokenExpiresAt     = (s: RootState) => s.auth.expiresAt;

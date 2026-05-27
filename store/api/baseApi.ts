/**
 * RTK Query base API with:
 *  - automatic Bearer token injection on every request
 *  - transparent token refresh on 401 (re-queues the failed request once)
 *  - logout + redirect on unrecoverable 401
 */

import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";
import {
  setTokens,
  clearCredentials,
  selectAccessToken,
  selectRefreshToken,
} from "@/store/slices/authSlice";
import type { AuthTokens } from "@/lib/validators/auth.validators";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// ── 1. Raw base query with token injection ─────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders(headers, { getState }) {
    const token = selectAccessToken(getState() as RootState);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// ── 2. Wrapper that handles 401 → silent refresh → retry once ─────────────────
let isRefreshing = false;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = selectRefreshToken(state);

    // Only attempt refresh once at a time
    if (refreshToken && !isRefreshing) {
      isRefreshing = true;

      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      isRefreshing = false;

      if (refreshResult.data) {
        const { data } = refreshResult.data as { ok: boolean; data: { tokens: AuthTokens } };
        api.dispatch(setTokens(data.tokens));

        // Retry original request with new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed → force logout
        api.dispatch(clearCredentials());
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } else {
      // No refresh token → force logout
      api.dispatch(clearCredentials());
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return result;
};

// ── 3. Base API — all feature APIs extend this via injectEndpoints() ──────────
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "User", "Part", "Notification", "Brand"],
  // Empty — feature slices inject their endpoints
  endpoints: () => ({}),
});

/**
 * useCurrentUser — lightweight hook to get the logged-in user from Redux state.
 * Optionally re-fetches /auth/me when the token is fresh (skip = no token).
 */

"use client";

import { useGetMeQuery } from "@/store/api/authApi";
import {
  selectCurrentUser,
  selectIsLoggedIn,
  selectIsAdmin,
  selectAccessToken,
} from "@/store/slices/authSlice";
import { useAppSelector } from "@/store/hooks";

export function useCurrentUser() {
  const user        = useAppSelector(selectCurrentUser);
  const isLoggedIn  = useAppSelector(selectIsLoggedIn);
  const isAdmin     = useAppSelector(selectIsAdmin);
  const accessToken = useAppSelector(selectAccessToken);

  // Only hit /auth/me when we have a token — keeps network quiet for guests
  const { isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !accessToken,
    // Re-fetch every 10 min to keep the user record fresh
    pollingInterval: 10 * 60 * 1000,
  });

  return { user, isLoggedIn, isAdmin, isLoading: isLoading || isFetching };
}

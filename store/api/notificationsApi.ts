import { baseApi } from "./baseApi";

type ApiOk<T> = { ok: true; data: T };

export interface StockNotification {
  id: string;
  type: "low_stock" | "out_of_stock";
  title: string;
  message: string;
  partId: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({

    listNotifications: build.query<ApiOk<{ notifications: StockNotification[]; unreadCount: number }>, { unread?: boolean }>({
      query: ({ unread } = {}) => ({
        url: "/notifications",
        method: "GET",
        params: unread ? { unread: "true" } : undefined,
      }),
      providesTags: [{ type: "Notification", id: "LIST" }],
    }),

    markRead: build.mutation<ApiOk<{ message: string }>, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    markAllRead: build.mutation<ApiOk<{ message: string }>, void>({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

  }),
});

export const {
  useListNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationsApi;

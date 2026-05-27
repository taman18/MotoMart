import { baseApi } from "./baseApi";
import type { Part, Category, BikeBrand } from "@/lib/types";

type ApiOk<T> = { ok: true; data: T };

export interface PartsMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ListPartsResponse {
  parts: Part[];
  meta: PartsMeta;
}

export interface ListPartsParams {
  search?: string;
  category?: Category;
  brand?: BikeBrand;
  sortBy?: "name" | "price" | "stock" | "createdAt";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreatePartPayload {
  name: string;
  description: string;
  category: Category;
  brand: BikeBrand;
  price: number;
  mrp: number;
  stock: number;
  minStock: number;
  images: string[];
  compatibleBikes: string[];
  isFeatured: boolean;
  isSale: boolean;
}

export type UpdatePartPayload = Partial<CreatePartPayload>;

export const partsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({

    listParts: build.query<ApiOk<ListPartsResponse>, ListPartsParams>({
      query: (params) => ({
        url: "/parts",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.parts.map(({ id }) => ({ type: "Part" as const, id })),
              { type: "Part", id: "LIST" },
            ]
          : [{ type: "Part", id: "LIST" }],
    }),

    getPart: build.query<ApiOk<{ part: Part }>, string>({
      query: (id) => ({ url: `/parts/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Part", id }],
    }),

    createPart: build.mutation<ApiOk<{ part: Part }>, CreatePartPayload>({
      query: (body) => ({ url: "/parts", method: "POST", body }),
      invalidatesTags: [{ type: "Part", id: "LIST" }],
    }),

    updatePart: build.mutation<ApiOk<{ part: Part }>, { id: string } & UpdatePartPayload>({
      query: ({ id, ...body }) => ({ url: `/parts/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Part", id }, { type: "Part", id: "LIST" }],
    }),

    deletePart: build.mutation<ApiOk<{ message: string }>, string>({
      query: (id) => ({ url: `/parts/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Part", id }, { type: "Part", id: "LIST" }],
    }),

  }),
});

export const {
  useListPartsQuery,
  useGetPartQuery,
  useCreatePartMutation,
  useUpdatePartMutation,
  useDeletePartMutation,
} = partsApi;

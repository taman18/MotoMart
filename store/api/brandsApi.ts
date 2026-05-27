import { baseApi } from "./baseApi";

export interface Brand {
  id: string;
  name: string;
  initials: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

type ApiOk<T> = { ok: true; data: T };

export interface CreateBrandPayload {
  name: string;
  initials: string;
  color: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateBrandPayload = Partial<CreateBrandPayload>;

export const brandsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({

    listBrands: build.query<ApiOk<{ brands: Brand[] }>, { all?: boolean } | void>({
      query: (params) => ({
        url: "/brands",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.brands.map(({ id }) => ({ type: "Brand" as const, id })),
              { type: "Brand", id: "LIST" },
            ]
          : [{ type: "Brand", id: "LIST" }],
    }),

    createBrand: build.mutation<ApiOk<{ brand: Brand }>, CreateBrandPayload>({
      query: (body) => ({ url: "/brands", method: "POST", body }),
      invalidatesTags: [{ type: "Brand", id: "LIST" }],
    }),

    updateBrand: build.mutation<ApiOk<{ brand: Brand }>, { id: string } & UpdateBrandPayload>({
      query: ({ id, ...body }) => ({ url: `/brands/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Brand", id }, { type: "Brand", id: "LIST" }],
    }),

    deleteBrand: build.mutation<ApiOk<{ message: string }>, string>({
      query: (id) => ({ url: `/brands/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Brand", id }, { type: "Brand", id: "LIST" }],
    }),

  }),
});

export const {
  useListBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi;

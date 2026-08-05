import { api } from '../../lib/apiClient';
import type { PaginatedResponse, Product } from '../../types/api';
import type { ProductFormValues } from '../../lib/schemas';

interface GetProductsParams {
  categoryId?: string;
  sellerId?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      PaginatedResponse<Product>,
      GetProductsParams | void
    >({
      query: (params) => ({ url: '/products', params: params ?? {} }),
      // Tag "LIST" global + un tag par produit affiché. Quand une mutation
      // de produit (création, édition — étape "espace vendeur") invalidera
      // { type: 'Product', id: 'LIST' }, toute liste affichée se
      // rafraîchira automatiquement.
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({ type: 'Product' as const, id: p._id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    // Même tag "LIST" que getProducts : "Mes produits" et le catalogue
    // public se rafraîchissent ensemble sans rien coder de plus.
    getMyProducts: builder.query<Product[], void>({
      query: () => '/products/mine',
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: 'Product' as const, id: p._id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    createProduct: builder.mutation<Product, ProductFormValues>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<
      Product,
      { id: string } & Partial<ProductFormValues>
    >({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    updateProductStatus: builder.mutation<
      Product,
      { id: string; status: 'draft' | 'active' }
    >({
      query: ({ id, status }) => ({
        url: `/products/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetMyProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useDeleteProductMutation,
} = productsApi;
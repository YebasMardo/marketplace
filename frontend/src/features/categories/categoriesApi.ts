import { api } from '../../lib/apiClient';
import type { Category } from '../../types/api';

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<
      Category,
      { name: string; parentId?: string; imageUrl?: string | null }
    >({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<
      Category,
      { id: string; name?: string; parentId?: string; imageUrl?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
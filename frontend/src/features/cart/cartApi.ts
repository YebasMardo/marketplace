import { api } from '../../lib/apiClient';
import type { Cart } from '../../types/api';

// Les 5 routes du panier renvoient toutes l'état COMPLET recalculé — on
// écrit donc directement la réponse dans le cache de getCart plutôt que
// d'invalider (ce qui déclencherait un second GET /cart inutile, puisqu'on
// a déjà la donnée fraîche entre les mains).

export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    addCartItem: builder.mutation<Cart, { productId: string; quantity: number }>({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data: updatedCart } = await queryFulfilled;
        dispatch(cartApi.util.updateQueryData('getCart', undefined, () => updatedCart));
      },
    }),

    updateCartItem: builder.mutation<Cart, { productId: string; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: `/cart/items/${productId}`,
        method: 'PATCH',
        body: { quantity }, // quantity: 0 => le backend retire l'article
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data: updatedCart } = await queryFulfilled;
        dispatch(cartApi.util.updateQueryData('getCart', undefined, () => updatedCart));
      },
    }),

    removeCartItem: builder.mutation<Cart, string>({
      query: (productId) => ({ url: `/cart/items/${productId}`, method: 'DELETE' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data: updatedCart } = await queryFulfilled;
        dispatch(cartApi.util.updateQueryData('getCart', undefined, () => updatedCart));
      },
    }),

    clearCart: builder.mutation<Cart, void>({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data: updatedCart } = await queryFulfilled;
        dispatch(cartApi.util.updateQueryData('getCart', undefined, () => updatedCart));
      },
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;
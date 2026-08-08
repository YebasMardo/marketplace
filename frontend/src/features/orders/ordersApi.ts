import { api } from '../../lib/apiClient';
import type { Order, PaymentMethod, ShippingDetails } from '../../types/api';

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Renvoie TOUJOURS un tableau — voir Checkout.tsx, jamais un objet seul.
    // `shipping` est obligatoire dans le corps : le backend valide en
    // forbidNonWhitelisted, donc l'omettre renvoie un 400, pas un silence.
    checkout: builder.mutation<
      Order[],
      { paymentMethod: PaymentMethod; shipping: ShippingDetails }
    >({
      query: (body) => ({ url: '/orders/checkout', method: 'POST', body }),
      invalidatesTags: ['Cart', { type: 'Order', id: 'LIST' }],
    }),

    // Même tag LIST que getMySales — même motif que Product entre catalogue
    // public et "Mes produits" : les deux listes se rafraîchissent ensemble.
    getMyPurchases: builder.query<Order[], void>({
      query: () => '/orders/my-purchases',
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: 'Order' as const, id: o._id })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),

    getMySales: builder.query<Order[], void>({
      query: () => '/orders/my-sales',
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: 'Order' as const, id: o._id })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),

    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    shipOrder: builder.mutation<Order, string>({
      query: (id) => ({ url: `/orders/${id}/ship`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),

    confirmDelivery: builder.mutation<Order, string>({
      query: (id) => ({ url: `/orders/${id}/confirm-delivery`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),

    cancelOrder: builder.mutation<Order, string>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCheckoutMutation,
  useGetMyPurchasesQuery,
  useGetMySalesQuery,
  useGetOrderQuery,
  useShipOrderMutation,
  useConfirmDeliveryMutation,
  useCancelOrderMutation,
} = ordersApi;
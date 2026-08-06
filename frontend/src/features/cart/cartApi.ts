import { api } from '../../lib/apiClient';
import type { Cart } from '../../types/api';

export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Utilisé pour l'instant par le seul badge de l'en-tête. La route exige
    // un token (JwtAuthGuard côté Nest) : les appelants passent `skip` quand
    // l'utilisateur n'est pas connecté.
    getCart: builder.query<Cart, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
  }),
});

export const { useGetCartQuery } = cartApi;

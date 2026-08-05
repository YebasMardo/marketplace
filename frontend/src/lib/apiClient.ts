import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';
import { logout } from '../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL, // http://localhost:3000
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Pas de refresh token côté backend (§4 du dossier technique) : un 401
// signifie toujours "session terminée", jamais "à retenter". On purge
// l'état globalement ici plutôt que de faire gérer ce cas à chaque écran.
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiInstance, extraOptions) => {
  const result = await baseQuery(args, apiInstance, extraOptions);
  if (result.error?.status === 401) {
    apiInstance.dispatch(logout());
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Me', 'Product', 'Category', 'Cart', 'Order'],
  // Chaque feature ajoute ses endpoints via api.injectEndpoints() —
  // voir features/auth/authApi.ts pour le premier exemple.
  endpoints: () => ({}),
});
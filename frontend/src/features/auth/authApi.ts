import { api } from '../../lib/apiClient';
import type { User } from '../../types/api';

interface AuthResponse {
  access_token: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
  role: 'buyer' | 'seller';
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginBody>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<AuthResponse, RegisterBody>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    // Le token est lu depuis l'en-tête Authorization par le backend —
    // aucun corps à envoyer.
    logoutApi: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutApiMutation,
} = authApi;
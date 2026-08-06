import { configureStore } from '@reduxjs/toolkit';
import { api } from '../lib/apiClient';
import authReducer from '../features/auth/authSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
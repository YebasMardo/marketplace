import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

const STORAGE_KEY = 'wishlist';

// Aucune route /wishlist côté API : la liste d'envies vit côté client,
// persistée dans le localStorage comme le token. Le jour où l'API l'expose,
// seul ce fichier change — l'en-tête et les cartes produit passent par les
// sélecteurs ci-dessous.
function readStored(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    // localStorage illisible (mode privé, quota, JSON corrompu) : on repart
    // d'une liste vide plutôt que de faire planter le store au démarrage.
    return [];
  }
}

function persist(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* écriture impossible — la liste reste valable pour la session en cours */
  }
}

interface WishlistState {
  ids: string[];
}

const initialState: WishlistState = { ids: readStored() };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const index = state.ids.indexOf(action.payload);
      if (index === -1) state.ids.push(action.payload);
      else state.ids.splice(index, 1);
      persist(state.ids);
    },
    clearWishlist: (state) => {
      state.ids = [];
      persist(state.ids);
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;

export const selectWishlistIds = (state: RootState) => state.wishlist.ids;
export const selectWishlistCount = (state: RootState) => state.wishlist.ids.length;
export const selectIsWishlisted = (id: string) => (state: RootState) =>
  state.wishlist.ids.includes(id);

export default wishlistSlice.reducer;

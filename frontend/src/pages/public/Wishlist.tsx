import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useGetProductQuery } from '../../features/products/productsApi';
import { ProductCard } from '../../features/products/ProductCard';
import { clearWishlist, selectWishlistIds } from '../../features/wishlist/wishlistSlice';

/**
 * La wishlist ne stocke que des identifiants (voir wishlistSlice) : chaque
 * produit est rechargé individuellement. Un composant par entrée, sinon on
 * appellerait un hook dans une boucle de longueur variable.
 */
function WishlistItem({ id }: { id: string }) {
  const { data: product, isLoading, isError } = useGetProductQuery(id);

  if (isLoading) {
    return <div className="aspect-square animate-pulse rounded-2xl bg-paper-sunken" />;
  }
  // Produit supprimé ou dépublié depuis sa mise en favori : on l'ignore
  // silencieusement plutôt que d'afficher une carte vide.
  if (isError || !product) return null;

  return <ProductCard product={product} />;
}

export function Wishlist() {
  const dispatch = useAppDispatch();
  const ids = useAppSelector(selectWishlistIds);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-7 flex items-baseline justify-between gap-4">
        <h1 className="text-3xl text-ink">Mes favoris</h1>
        {ids.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearWishlist())}
            className="text-sm font-medium text-ink-faint transition-colors hover:text-clay"
          >
            Tout retirer
          </button>
        )}
      </div>

      {ids.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ink-faint">Vous n'avez encore rien mis en favori.</p>
          <Link
            to="/products"
            className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink-hover active:scale-95"
          >
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
          {ids.map((id) => (
            <WishlistItem key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  );
}

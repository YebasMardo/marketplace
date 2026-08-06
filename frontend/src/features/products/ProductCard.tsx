import { Link } from 'react-router-dom';
import type { Product } from '../../types/api';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectIsWishlisted, toggleWishlist } from '../../features/wishlist/wishlistSlice';

// Statique pour l'instant : les avis ne sont pas encore implémentés côté
// API. À brancher sur product.rating / product.reviewCount.
const STATIC_RATING = 4.5;
const STATIC_DELIVERY = '12-24 Hours';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        // Remplissage fractionnaire : 100 % si l'étoile est sous la note,
        // 0 % au-dessus, le reste au prorata pour la demi-étoile.
        const fill = Math.max(0, Math.min(1, rating - i)) * 100;
        return (
          <span key={i} className="relative block w-3.5 h-3.5">
            <StarIcon className="absolute inset-0 w-3.5 h-3.5 text-line-strong" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <StarIcon className="w-3.5 h-3.5 text-clay" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
    </svg>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const isWishlisted = useAppSelector(selectIsWishlisted(product._id));

  const hasPromo =
    product.promoPrice != null && product.promoPrice < product.price;
  const discount = hasPromo
    ? Math.round(100 - (product.promoPrice! / product.price) * 100)
    : 0;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-paper-raised p-3 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-line-strong hover:shadow-[0_10px_30px_-14px_rgba(17,17,17,0.22)]">
      {/* Zone image */}
      <div className="relative aspect-square rounded-xl bg-paper-sunken overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-faint text-sm">
            Pas d'image
          </div>
        )}

        {/* Ruban promo, encoche en bas comme sur la maquette */}
        {hasPromo && (
          <span
            className="absolute top-0 left-3 z-10 flex flex-col items-center leading-none bg-clay text-paper text-[10px] font-bold uppercase tracking-wide px-2 pt-2 pb-3.5"
            style={{
              clipPath:
                'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 6px), 0 100%)',
            }}
          >
            <span>{discount}%</span>
            <span className="mt-0.5">Off</span>
          </span>
        )}

        {/* Favoris — stockés côté client (localStorage), voir wishlistSlice */}
        <button
          type="button"
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Retirer ${product.title} des favoris`
              : `Ajouter ${product.title} aux favoris`
          }
          onClick={() => dispatch(toggleWishlist(product._id))}
          className={`absolute top-2.5 right-2.5 z-20 grid place-items-center w-9 h-9 rounded-full bg-paper-raised shadow-[0_2px_8px_rgba(17,17,17,0.14)] transition-colors duration-150 hover:text-clay active:scale-95 ${
            isWishlisted ? 'text-clay' : 'text-ink'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
          >
            <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1L12 21l7.7-7.7 1.1-1a5.5 5.5 0 000-7.7z" />
          </svg>
        </button>
      </div>

      {/* Délai de livraison — statique */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
        <span className="grid place-items-center w-5 h-5 rounded-full bg-clay text-paper shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3"
          >
            <path d="M1 3h13v13H1zM14 8h4l3 3v5h-7z" />
            <circle cx="5.5" cy="18.5" r="1.5" />
            <circle cx="17.5" cy="18.5" r="1.5" />
          </svg>
        </span>
        {STATIC_DELIVERY}
      </div>

      <h3 className="mt-2 font-semibold text-ink truncate">
        {/* Lien étiré : toute la carte est cliquable, sauf les boutons (z-20) */}
        <Link to={`/products/${product._id}`} className="before:absolute before:inset-0 before:z-10">
          {product.title}
        </Link>
      </h3>

      {/* Note — statique */}
      <div className="mt-1.5 flex items-center gap-1.5">
        <Stars rating={STATIC_RATING} />
        <span className="text-xs text-ink-soft">({STATIC_RATING})</span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {hasPromo && (
            <p className="text-sm text-ink-faint line-through">
              {product.price.toFixed(2)} €
            </p>
          )}
          <p className="text-[15px] font-semibold text-ink">
            {(hasPromo ? product.promoPrice! : product.price).toFixed(2)} €
          </p>
        </div>

        {/* Ajout au panier — statique, non branché */}
        <button
          type="button"
          aria-label={`Ajouter ${product.title} au panier`}
          className="relative z-20 grid place-items-center w-10 h-10 shrink-0 rounded-full border border-clay text-clay transition-colors duration-150 ease-out hover:bg-clay hover:text-paper active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
          >
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M2 3h3l2.4 11.4a1.5 1.5 0 001.5 1.1h8.5a1.5 1.5 0 001.5-1.1L21 7H6" />
          </svg>
        </button>
      </div>
    </article>
  );
}

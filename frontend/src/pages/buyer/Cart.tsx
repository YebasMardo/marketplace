import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from '../../features/cart/cartApi';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Newsletter } from '../../components/ui/Newsletter';
import {
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from '../../components/ui/icons';
import { formatMad } from '../../lib/format';

export function Cart() {
  const { data: cart, isLoading } = useGetCartQuery();
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();
  const [promoNote, setPromoNote] = useState('');

  if (isLoading) return <Spinner />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState message="Votre panier est vide" />
        <div className="text-center mt-4">
          <Link to="/products" className="text-clay font-medium">
            Parcourir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  // `cart.total` est déjà le montant réellement facturé (promoPrice appliqué
  // côté backend). La remise affichée se déduit donc des `originalPrice` —
  // on ne l'invente pas, et la ligne disparaît s'il n'y a aucune promo.
  const savings = cart.items.reduce(
    (sum, item) =>
      sum + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0),
    0,
  );
  const subtotal = cart.total + savings;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Panier</h1>
        <button
          onClick={() => clearCart()}
          className="text-sm text-ink-faint hover:text-ink transition-colors"
        >
          Vider le panier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <ul className="divide-y divide-line bg-paper-raised border border-line rounded-2xl overflow-hidden">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
              <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-paper-sunken">
                {item.images[0] && (
                  <img
                    src={item.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-ink leading-snug line-clamp-2">
                    {item.title}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 p-1 text-clay hover:text-clay-dark transition-colors"
                    aria-label={`Retirer ${item.title} du panier`}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-ink">{formatMad(item.subtotal)}</p>
                    {item.originalPrice && (
                      <p className="text-sm text-ink-faint line-through">
                        {formatMad(item.originalPrice * item.quantity)}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-paper-sunken px-1.5 py-1">
                    <button
                      onClick={() =>
                        updateItem({
                          productId: item.productId,
                          quantity: item.quantity - 1,
                        })
                      }
                      disabled={item.quantity <= 1}
                      className="grid h-7 w-7 place-items-center rounded-full text-ink transition-colors hover:bg-line disabled:opacity-35 disabled:hover:bg-transparent"
                      aria-label="Diminuer la quantité"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-medium text-ink tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateItem({
                          productId: item.productId,
                          quantity: item.quantity + 1,
                        })
                      }
                      className="grid h-7 w-7 place-items-center rounded-full text-ink transition-colors hover:bg-line"
                      aria-label="Augmenter la quantité"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="bg-paper-raised border border-line rounded-2xl p-5 sm:p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold text-ink mb-5">Récapitulatif</h2>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Sous-total</dt>
              <dd className="font-medium text-ink">{formatMad(subtotal)}</dd>
            </div>
            {savings > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-ink-soft">Remise</dt>
                <dd className="font-medium text-clay">-{formatMad(savings)}</dd>
              </div>
            )}
          </dl>

          <div className="my-5 border-t border-line" />

          <div className="flex items-center justify-between mb-5">
            <span className="text-ink">Total</span>
            <span className="text-xl font-bold text-ink">{formatMad(cart.total)}</span>
          </div>

          {/* Code promo : UI seulement pour l'instant — aucune route backend ne
              valide de code. On le dit franchement plutôt que de simuler un
              succès. */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <TagIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                placeholder="Ajouter un code promo"
                aria-label="Code promo"
                className="w-full rounded-full bg-paper-sunken py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              />
            </div>
            <button
              type="button"
              onClick={() => setPromoNote('Les codes promo ne sont pas encore disponibles.')}
              className="rounded-full bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink-hover"
            >
              Appliquer
            </button>
          </div>
          {promoNote && (
            <p role="status" className="mb-3 text-xs text-ink-faint">
              {promoNote}
            </p>
          )}

          <Link
            to="/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-medium text-paper transition-colors hover:bg-ink-hover"
          >
            Passer commande
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </aside>
      </div>

      <div className="mt-10">
        <Newsletter />
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetCartQuery } from '../../features/cart/cartApi';
import { useCheckoutMutation } from '../../features/orders/ordersApi';
import { useGetMeQuery } from '../../features/auth/authApi';
import { makeCheckoutSchema, type CheckoutFormValues } from '../../lib/schemas';
import { COUNTRIES } from '../../lib/countries';
import type { Order, ShippingDetails } from '../../types/api';
import { Spinner } from '../../components/ui/Spinner';
import { ShippingSummary } from '../../features/orders/ShippingSummary';
import { getErrorMessage } from '../../lib/errorUtils';
import { formatMad } from '../../lib/format';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import {
  ArrowRightIcon,
  BanknoteIcon,
  ChevronRightIcon,
  StripeIcon,
  TagIcon,
} from '../../components/ui/icons';

const inputClass =
  'w-full rounded-xl border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';
const labelClass = 'block text-xs font-medium text-ink-soft mb-1.5';
const errorClass = 'text-xs text-clay mt-1';
// Carte de choix (mode de paiement) : bordure qui s'assombrit à la sélection,
// via has-[:checked] plutôt qu'un état React — le radio reste la source de
// vérité et react-hook-form n'a rien à synchroniser.
const choiceCardClass =
  'flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-line bg-paper-raised px-4 py-3.5 transition-colors hover:border-line-strong has-[:checked]:border-ink has-[:checked]:bg-paper-sunken has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink';

export function Checkout() {
  const { data: cart, isLoading: isLoadingCart } = useGetCartQuery();
  const { data: me } = useGetMeQuery();
  const [checkout, { isLoading: isSubmitting }] = useCheckoutMutation();
  const [createdOrders, setCreatedOrders] = useState<Order[] | null>(null);
  const [submittedShipping, setSubmittedShipping] =
    useState<ShippingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoNote, setPromoNote] = useState('');

  // Une commande numérique n'a rien à faire livrer : l'adresse postale n'est
  // exigée que si le panier contient au moins un article physique. Même
  // règle que OrdersService.checkout() côté backend.
  const requiresAddress = (cart?.items ?? []).some((i) => i.type === 'physical');

  const schema = useMemo(
    () => makeCheckoutSchema(requiresAddress),
    [requiresAddress],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    // "values" (pas "defaultValues") : le profil arrive de façon asynchrone.
    // Le téléphone n'est pas pré-remplissable — User ne le stocke pas.
    values: me
      ? {
          paymentMethod: 'stripe' as const,
          shipping: {
            fullName: me.name ?? '',
            email: me.email,
            phone: '',
            country: '',
            city: '',
            addressLine: '',
            postalCode: '',
          },
        }
      : undefined,
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    setError(null);

    // Les champs postaux vides doivent être OMIS, pas envoyés à '' :
    // le @IsOptional() du DTO ne neutralise la validation que pour
    // undefined/null, une chaîne vide échouerait sur @IsNotEmpty().
    const { country, city, addressLine, postalCode, ...contact } =
      values.shipping;
    const shipping: ShippingDetails = {
      ...contact,
      ...(requiresAddress ? { country, city, addressLine, postalCode } : {}),
    };

    try {
      // Le checkout renvoie un TABLEAU — un panier multi-vendeur (ou
      // mêlant physique/numérique chez un même vendeur) en produit
      // plusieurs en un seul appel. Ne jamais supposer une seule commande.
      const orders = await checkout({
        paymentMethod: values.paymentMethod,
        shipping,
      }).unwrap();
      setSubmittedShipping(shipping);
      setCreatedOrders(orders);
    } catch (err) {
      setError(getErrorMessage(err as FetchBaseQueryError | SerializedError));
    }
  };

  if (isLoadingCart) return <Spinner />;

  // Vue de confirmation : une carte par commande créée, jamais orders[0].
  if (createdOrders) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold text-ink mb-2">Commande confirmée</h1>
        <p className="text-ink-soft mb-6">
          {createdOrders.length > 1
            ? `${createdOrders.length} commandes ont été créées — une par vendeur et type d'article.`
            : 'Votre commande a été créée.'}
        </p>

        <ul className="space-y-3">
          {createdOrders.map((order) => (
            <li
              key={order._id}
              className="flex items-center justify-between bg-paper-raised border border-line rounded-2xl px-5 py-4"
            >
              <div>
                <p className="font-medium text-ink">
                  Commande {order._id.slice(-6)} —{' '}
                  {order.fulfillmentType === 'physical' ? 'Physique' : 'Numérique'}
                </p>
                <p className="text-sm text-ink-soft">
                  {formatMad(order.total)} ·{' '}
                  {order.paymentMethod === 'stripe' ? 'Carte' : 'Espèces'}
                </p>
              </div>
              <Link to={`/orders/${order._id}`} className="text-clay font-medium text-sm">
                Voir
              </Link>
            </li>
          ))}
        </ul>

        {submittedShipping && (
          <div className="mt-6 bg-paper-raised border border-line rounded-2xl px-5 py-4">
            <h2 className="text-sm font-semibold text-ink mb-2">
              Coordonnées de livraison
            </h2>
            <ShippingSummary shipping={submittedShipping} />
          </div>
        )}

        <Link
          to="/my-purchases"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-medium text-paper transition-colors hover:bg-ink-hover"
        >
          Voir toutes mes commandes
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-soft">Votre panier est vide.</p>
        <Link to="/products" className="mt-3 inline-block text-clay font-medium">
          Parcourir le catalogue
        </Link>
      </div>
    );
  }

  // Même calcul que le panier : `cart.total` est déjà le montant facturé
  // (promoPrice appliqué côté backend), la remise se déduit des
  // `originalPrice` et la ligne disparaît s'il n'y a aucune promo.
  const savings = cart.items.reduce(
    (sum, item) =>
      sum + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0),
    0,
  );
  const subtotal = cart.total + savings;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <nav aria-label="Étapes" className="mb-6 flex items-center gap-1.5 text-sm">
        <Link to="/cart" className="text-clay font-medium hover:text-clay-dark">
          Panier
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5 text-ink-faint" />
        <span aria-current="step" className="font-medium text-ink">
          Livraison
        </span>
        <ChevronRightIcon className="h-3.5 w-3.5 text-ink-faint" />
        <span className="text-ink-faint">Paiement</span>
      </nav>

      {/* Un seul <form> autour des deux colonnes : le bouton de validation vit
          dans le récapitulatif de droite, il doit rester rattaché aux champs. */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="bg-paper-raised border border-line rounded-2xl p-5 sm:p-7">
            <fieldset>
              <legend className="text-lg font-semibold text-ink">
                {requiresAddress ? 'Adresse de livraison' : 'Vos coordonnées'}
              </legend>
              <p className="mt-1 mb-5 text-sm text-ink-faint">
                {requiresAddress
                  ? 'Le vendeur en a besoin pour expédier votre commande.'
                  : 'Votre commande est entièrement numérique — aucune adresse postale requise.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ship-name" className={labelClass}>
                    Nom complet*
                  </label>
                  <input
                    id="ship-name"
                    autoComplete="name"
                    placeholder="Yassine Benali"
                    aria-invalid={errors.shipping?.fullName ? true : undefined}
                    {...register('shipping.fullName')}
                    className={inputClass}
                  />
                  {errors.shipping?.fullName && (
                    <p className={errorClass}>{errors.shipping.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="ship-email" className={labelClass}>
                    Email*
                  </label>
                  <input
                    id="ship-email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    aria-invalid={errors.shipping?.email ? true : undefined}
                    {...register('shipping.email')}
                    className={inputClass}
                  />
                  {errors.shipping?.email && (
                    <p className={errorClass}>{errors.shipping.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="ship-phone" className={labelClass}>
                    Téléphone*
                  </label>
                  <input
                    id="ship-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+212 6 00 00 00 00"
                    aria-invalid={errors.shipping?.phone ? true : undefined}
                    {...register('shipping.phone')}
                    className={inputClass}
                  />
                  {errors.shipping?.phone && (
                    <p className={errorClass}>{errors.shipping.phone.message}</p>
                  )}
                </div>

                {requiresAddress && (
                  <div>
                    <label htmlFor="ship-country" className={labelClass}>
                      Pays*
                    </label>
                    <select
                      id="ship-country"
                      autoComplete="country-name"
                      aria-invalid={errors.shipping?.country ? true : undefined}
                      {...register('shipping.country')}
                      className={inputClass}
                    >
                      <option value="">Choisir...</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    {errors.shipping?.country && (
                      <p className={errorClass}>{errors.shipping.country.message}</p>
                    )}
                  </div>
                )}

                {requiresAddress && (
                  <>
                    <div className="sm:col-span-2">
                      <label htmlFor="ship-address" className={labelClass}>
                        Adresse*
                      </label>
                      <input
                        id="ship-address"
                        autoComplete="street-address"
                        placeholder="Numéro, rue, appartement"
                        aria-invalid={errors.shipping?.addressLine ? true : undefined}
                        {...register('shipping.addressLine')}
                        className={inputClass}
                      />
                      {errors.shipping?.addressLine && (
                        <p className={errorClass}>{errors.shipping.addressLine.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="ship-city" className={labelClass}>
                        Ville*
                      </label>
                      <input
                        id="ship-city"
                        autoComplete="address-level2"
                        placeholder="Casablanca"
                        aria-invalid={errors.shipping?.city ? true : undefined}
                        {...register('shipping.city')}
                        className={inputClass}
                      />
                      {errors.shipping?.city && (
                        <p className={errorClass}>{errors.shipping.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="ship-postal" className={labelClass}>
                        Code postal*
                      </label>
                      <input
                        id="ship-postal"
                        autoComplete="postal-code"
                        placeholder="20000"
                        aria-invalid={errors.shipping?.postalCode ? true : undefined}
                        {...register('shipping.postalCode')}
                        className={inputClass}
                      />
                      {errors.shipping?.postalCode && (
                        <p className={errorClass}>{errors.shipping.postalCode.message}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </fieldset>

            <div className="my-7 border-t border-line" />

            <fieldset>
              <legend className="text-lg font-semibold text-ink mb-4">
                Mode de paiement
              </legend>

              <div className="flex flex-col sm:flex-row gap-4">
                <label className={choiceCardClass}>
                  <input
                    type="radio"
                    value="stripe"
                    {...register('paymentMethod')}
                    className="h-4 w-4 shrink-0 accent-ink"
                  />
                  <StripeIcon className="h-5 w-5 shrink-0 text-[#635bff]" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">
                      Carte bancaire
                    </span>
                    <span className="block text-xs text-ink-faint">
                      Paiement sécurisé via Stripe
                    </span>
                  </span>
                </label>

                <label className={choiceCardClass}>
                  <input
                    type="radio"
                    value="cash"
                    {...register('paymentMethod')}
                    className="h-4 w-4 shrink-0 accent-ink"
                  />
                  <BanknoteIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">Espèces</span>
                    <span className="block text-xs text-ink-faint">
                      À régler à la livraison
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
          </div>

          <aside className="bg-paper-raised border border-line rounded-2xl p-5 sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-lg font-semibold text-ink mb-5">Votre panier</h2>

            <ul className="space-y-4">
              {cart.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-paper-sunken">
                      {item.images[0] && (
                        <img
                          src={item.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <span className="absolute -left-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-medium text-paper tabular-nums">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                    <p className="text-xs text-ink-faint">
                      {item.type === 'physical' ? 'Article physique' : 'Produit numérique'}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-medium text-ink tabular-nums">
                    {formatMad(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Code promo : UI seulement pour l'instant — aucune route backend ne
                valide de code. On le dit franchement plutôt que de simuler un
                succès. */}
            <div className="mt-5 flex gap-2">
              <div className="relative flex-1">
                <TagIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  type="text"
                  placeholder="Code promo"
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
              <p role="status" className="mt-2 text-xs text-ink-faint">
                {promoNote}
              </p>
            )}

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-soft">Sous-total</dt>
                <dd className="font-medium text-ink tabular-nums">
                  {formatMad(subtotal)}
                </dd>
              </div>
              {savings > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-soft">Remise</dt>
                  <dd className="font-medium text-clay tabular-nums">
                    -{formatMad(savings)}
                  </dd>
                </div>
              )}
              {requiresAddress && (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-soft">Livraison</dt>
                  <dd className="text-ink-faint">Selon le vendeur</dd>
                </div>
              )}
            </dl>

            <div className="my-5 border-t border-line" />

            <div className="flex items-center justify-between">
              <span className="text-ink">Total</span>
              <span className="text-xl font-bold text-ink tabular-nums">
                {formatMad(cart.total)}
              </span>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm text-clay-dark">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-medium text-paper transition-colors hover:bg-ink-hover disabled:opacity-50"
            >
              {isSubmitting ? 'Création de la commande...' : 'Confirmer la commande'}
              {!isSubmitting && <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </aside>
        </div>
      </form>
    </div>
  );
}

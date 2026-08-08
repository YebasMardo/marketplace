import { useParams } from 'react-router-dom';
import {
  useGetOrderQuery,
  useShipOrderMutation,
  useConfirmDeliveryMutation,
  useCancelOrderMutation,
} from '../../features/orders/ordersApi';
import { useGetMeQuery } from '../../features/auth/authApi';
import { Spinner } from '../../components/ui/Spinner';
import { ShippingSummary } from '../../features/orders/ShippingSummary';
import { OrderStatusBadge } from '../../features/orders/OrderStatusBadge';
import { getErrorMessage } from '../../lib/errorUtils';
import { formatMad } from '../../lib/format';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading: isLoadingOrder, isError } = useGetOrderQuery(id!);
  const { data: me, isLoading: isLoadingMe } = useGetMeQuery();

  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [confirmDelivery, { isLoading: isConfirming }] = useConfirmDeliveryMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  if (isLoadingOrder || isLoadingMe) return <Spinner />;
  if (isError || !order || !me) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-ink-soft">
        Commande introuvable.
      </div>
    );
  }

  // Dérivé de la relation réelle à CETTE commande, pas du rôle global de
  // l'utilisateur — un vendeur reste acheteur sur ses propres achats.
  const isBuyer = order.buyerId === me.id;
  const isSeller = order.sellerId === me.id;
  const canCancel =
    (isBuyer || isSeller) && ['pending_payment', 'processing'].includes(order.status);
  const canShip =
    isSeller && order.fulfillmentType === 'physical' && order.status === 'processing';
  const canConfirmDelivery = isBuyer && order.status === 'shipped';

  const handleAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (err) {
      alert(getErrorMessage(err as FetchBaseQueryError | SerializedError));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">
          Commande {order._id.slice(-6)}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="bg-paper border border-line rounded-xl overflow-hidden mb-6">
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between px-4 py-3">
              <span className="text-ink">
                {item.title} <span className="text-ink-faint">× {item.quantity}</span>
              </span>
              <span className="font-medium text-ink tabular-nums">
                {formatMad(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between px-4 py-3 bg-paper-sunken">
          <span className="font-semibold text-ink">Total</span>
          <span className="font-semibold text-ink tabular-nums">
            {formatMad(order.total)}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-y-2 text-sm mb-6">
        <dt className="text-ink-faint">Type</dt>
        <dd className="text-ink">
          {order.fulfillmentType === 'physical' ? 'Physique' : 'Numérique'}
        </dd>
        <dt className="text-ink-faint">Paiement</dt>
        <dd className="text-ink">
          {order.paymentMethod === 'stripe' ? 'Carte bancaire' : 'Espèces'}
        </dd>
        <dt className="text-ink-faint">Date</dt>
        <dd className="text-ink">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</dd>
      </dl>

      {/* Absent des commandes antérieures au formulaire de livraison — d'où
          le garde. Affiché aux deux parties : le vendeur en a besoin pour
          expédier, l'acheteur pour vérifier ce qu'il a saisi. */}
      {order.shipping && (
        <div className="bg-paper border border-line rounded-xl px-4 py-3 mb-6">
          <h2 className="text-sm font-semibold text-ink mb-2">
            {order.fulfillmentType === 'physical'
              ? 'Adresse de livraison'
              : 'Coordonnées de l’acheteur'}
          </h2>
          <ShippingSummary shipping={order.shipping} />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canShip && (
          <button
            onClick={() => handleAction(() => shipOrder(order._id).unwrap())}
            disabled={isShipping}
            className="bg-clay text-white rounded-lg px-4 py-2 font-medium hover:bg-clay-dark disabled:opacity-50"
          >
            Marquer comme expédiée
          </button>
        )}
        {canConfirmDelivery && (
          <button
            onClick={() => handleAction(() => confirmDelivery(order._id).unwrap())}
            disabled={isConfirming}
            className="bg-clay text-white rounded-lg px-4 py-2 font-medium hover:bg-clay-dark disabled:opacity-50"
          >
            Confirmer la réception
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => handleAction(() => cancelOrder(order._id).unwrap())}
            disabled={isCancelling}
            className="text-clay-dark border border-line rounded-lg px-4 py-2 font-medium hover:bg-paper-sunken disabled:opacity-50"
          >
            Annuler la commande
          </button>
        )}
        {/* La confirmation d'un paiement en espèces (vendeur) arrive avec le
            module payments — étape 5 du plan */}
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { useGetMySalesQuery } from '../../features/orders/ordersApi';
import { OrderList, OrderListSkeleton } from '../../features/orders/OrderList';
import { OrdersSummary } from '../../features/orders/OrdersSummary';
import { SUCCESSFUL_STATUSES } from '../../lib/orderStatus';
import { formatMad } from '../../lib/format';
import { ArrowRightIcon } from '../../components/ui/icons';

export function MySales() {
  const { data: orders, isLoading } = useGetMySalesQuery();
  const list = orders ?? [];

  // « À traiter » = ce qui attend une action du vendeur : une commande payée
  // à préparer, ou un paiement en espèces à confirmer. 'shipped' est déjà
  // entre les mains de l'acheteur.
  const toHandle = list.filter((o) =>
    ['pending_payment', 'processing'].includes(o.status),
  ).length;

  // §6.2 : deux statuts terminaux pour un même succès — filtrer sur
  // 'completed' seul effacerait les commandes physiques livrées.
  const revenue = list
    .filter((o) => SUCCESSFUL_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink sm:text-[28px]">Mes ventes</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Préparez vos expéditions et suivez le règlement de chaque commande.
        </p>
      </header>

      {list.length > 0 && (
        <div className="mb-7">
          <OrdersSummary
            stats={[
              { label: 'Ventes', value: String(list.length) },
              { label: 'À traiter', value: String(toHandle) },
              {
                label: 'Revenus',
                value: formatMad(revenue),
                hint: 'encaissés',
              },
            ]}
          />
        </div>
      )}

      {isLoading ? (
        <OrderListSkeleton />
      ) : (
        <OrderList
          orders={list}
          emptyMessage="Aucune vente pour l'instant"
          emptyAction={
            <Link
              to="/seller/products"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink-hover active:scale-[0.97] motion-reduce:active:scale-100"
            >
              Gérer mes produits
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          }
        />
      )}
    </div>
  );
}

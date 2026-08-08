import { Link } from 'react-router-dom';
import { useGetMyPurchasesQuery } from '../../features/orders/ordersApi';
import { OrderList, OrderListSkeleton } from '../../features/orders/OrderList';
import { OrdersSummary } from '../../features/orders/OrdersSummary';
import { ACTIVE_STATUSES } from '../../lib/orderStatus';
import { formatMad } from '../../lib/format';
import { ArrowRightIcon } from '../../components/ui/icons';

export function MyPurchases() {
  const { data: orders, isLoading } = useGetMyPurchasesQuery();
  const list = orders ?? [];

  const inProgress = list.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  // Les commandes annulées ne comptent pas dans le total dépensé : elles ont
  // été remboursées ou jamais payées.
  const spent = list
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink sm:text-[28px]">Mes achats</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Suivez l'avancement de vos commandes et retrouvez vos justificatifs.
        </p>
      </header>

      {list.length > 0 && (
        <div className="mb-7">
          <OrdersSummary
            stats={[
              { label: 'Commandes', value: String(list.length) },
              { label: 'En cours', value: String(inProgress) },
              { label: 'Total dépensé', value: formatMad(spent) },
            ]}
          />
        </div>
      )}

      {isLoading ? (
        <OrderListSkeleton />
      ) : (
        <OrderList
          orders={list}
          emptyMessage="Aucun achat pour l'instant"
          emptyAction={
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink-hover active:scale-[0.97] motion-reduce:active:scale-100"
            >
              Parcourir le catalogue
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          }
        />
      )}
    </div>
  );
}

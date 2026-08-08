import { Link } from 'react-router-dom';
import { useGetMyProductsQuery } from '../../features/products/productsApi';
import { useGetMySalesQuery } from '../../features/orders/ordersApi';
import { OrderList } from '../../features/orders/OrderList';
import { Spinner } from '../../components/ui/Spinner';
import { SUCCESSFUL_STATUSES } from '../../lib/orderStatus';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper border border-line rounded-xl px-5 py-4">
      <p className="text-sm text-ink-faint">{label}</p>
      <p className="text-2xl font-semibold text-ink mt-1">{value}</p>
    </div>
  );
}

export function Dashboard() {
  const { data: products, isLoading: isLoadingProducts } = useGetMyProductsQuery();
  const { data: orders, isLoading: isLoadingOrders } = useGetMySalesQuery();

  if (isLoadingProducts || isLoadingOrders) return <Spinner />;

  const activeProducts = products?.filter((p) => p.status === 'active').length ?? 0;
  const totalProducts = products?.length ?? 0;

  // §6.2 du dossier technique : deux statuts terminaux pour un même succès.
  // Ne jamais sommer sur 'completed' seul — on perdrait toutes les ventes
  // physiques livrées.
  const revenue =
    orders
      ?.filter((o) => SUCCESSFUL_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + o.total, 0) ?? 0;

  const needsShipping =
    orders?.filter(
      (o) => o.fulfillmentType === 'physical' && o.status === 'processing',
    ).length ?? 0;

  const recentOrders = [...(orders ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Chiffre d'affaires" value={`${revenue.toFixed(2)} €`} />
        <StatCard label="Commandes" value={String(orders?.length ?? 0)} />
        <StatCard label="À expédier" value={String(needsShipping)} />
        <StatCard label="Produits actifs" value={`${activeProducts} / ${totalProducts}`} />
      </div>

      {needsShipping > 0 && (
        <Link
          to="/seller/sales"
          className="block bg-clay-soft border border-clay rounded-xl px-4 py-3 mb-8 text-clay-dark font-medium"
        >
          {needsShipping} commande{needsShipping > 1 ? 's' : ''} en attente d'expédition →
        </Link>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-ink">Commandes récentes</h2>
        <Link to="/seller/sales" className="text-sm text-clay font-medium">
          Tout voir
        </Link>
      </div>
      <OrderList orders={recentOrders} emptyMessage="Aucune vente pour l'instant" />
    </div>
  );
}
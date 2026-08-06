import { Link } from 'react-router-dom';
import {
  useGetMyProductsQuery,
  useUpdateProductStatusMutation,
  useDeleteProductMutation,
} from '../../features/products/productsApi';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ProductStatus } from '../../types/api';

export function MyProducts() {
  const { data: products, isLoading } = useGetMyProductsQuery();
  const [updateStatus] = useUpdateProductStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const togglePublish = (id: string, current: ProductStatus) => {
    if (current === 'suspended') return; // modération — pas au vendeur d'y toucher
    updateStatus({ id, status: current === 'active' ? 'draft' : 'active' });
  };

  const statusBadge = (status: ProductStatus) =>
    status === 'active'
      ? 'bg-ink text-paper'
      : status === 'suspended'
        ? 'bg-clay-soft text-clay-dark'
        : 'bg-paper-sunken text-ink-faint';

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl text-ink">Mes produits</h1>
        <Link
          to="/seller/products/new"
          className="bg-ink text-paper rounded-full px-4 py-2 text-sm font-medium hover:bg-ink-hover transition-colors active:scale-95"
        >
          Nouveau produit
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <EmptyState message="Aucun produit pour l'instant" />
      ) : (
        <ul className="divide-y divide-line bg-paper-raised border border-line rounded-xl overflow-hidden">
          {products.map((product) => (
            <li key={product._id} className="flex items-center gap-4 px-4 py-3">
              <div className="w-12 h-12 rounded-lg bg-paper-sunken overflow-hidden shrink-0">
                {product.images[0] && (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">{product.title}</p>
                <p className="text-sm text-ink-faint">{product.price.toFixed(2)} €</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(product.status)}`}>
                {product.status}
              </span>
              {product.status !== 'suspended' && (
                <button
                  onClick={() => togglePublish(product._id, product.status)}
                  className="text-sm text-ink hover:underline underline-offset-4"
                >
                  {product.status === 'active' ? 'Dépublier' : 'Publier'}
                </button>
              )}
              <Link
                to={`/seller/products/${product._id}/edit`}
                className="text-sm text-ink-soft hover:text-ink transition-colors"
              >
                Modifier
              </Link>
              <button
                onClick={() => deleteProduct(product._id)}
                className="text-sm text-clay hover:text-clay-dark transition-colors"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

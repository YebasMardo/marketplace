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
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'suspended'
        ? 'bg-red-100 text-red-800'
        : 'bg-slate-100 text-slate-600';

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Mes produits</h1>
        <Link
          to="/seller/products/new"
          className="bg-teal-700 text-white rounded-lg px-4 py-2 font-medium hover:bg-teal-800"
        >
          Nouveau produit
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <EmptyState message="Aucun produit pour l'instant" />
      ) : (
        <ul className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {products.map((product) => (
            <li key={product._id} className="flex items-center gap-4 px-4 py-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {product.images[0] && (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{product.title}</p>
                <p className="text-sm text-slate-500">{product.price.toFixed(2)} MAD</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(product.status)}`}>
                {product.status}
              </span>
              {product.status !== 'suspended' && (
                <button
                  onClick={() => togglePublish(product._id, product.status)}
                  className="text-sm text-teal-700 hover:text-teal-900"
                >
                  {product.status === 'active' ? 'Dépublier' : 'Publier'}
                </button>
              )}
              <Link
                to={`/seller/products/${product._id}/edit`}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Modifier
              </Link>
              <button
                onClick={() => deleteProduct(product._id)}
                className="text-sm text-red-600 hover:text-red-800"
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
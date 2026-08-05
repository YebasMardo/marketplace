import { Link } from 'react-router-dom';
import type { Product } from '../../types/api';

export function ProductCard({ product }: { product: Product }) {
  const hasPromo =
    product.promoPrice != null && product.promoPrice < product.price;
  const categoryName =
    typeof product.categoryId === 'object' ? product.categoryId.name : undefined;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-slate-100 overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Pas d'image
          </div>
        )}
      </div>
      <div className="p-4">
        {categoryName && (
          <p className="text-xs text-slate-500 mb-1">{categoryName}</p>
        )}
        <h3 className="font-medium text-slate-900 truncate">{product.title}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold text-slate-900">
            {(hasPromo ? product.promoPrice! : product.price).toFixed(2)} €
          </span>
          {hasPromo && (
            <span className="text-sm text-slate-400 line-through">
              {product.price.toFixed(2)} MAD
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
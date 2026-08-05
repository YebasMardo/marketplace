import { useParams, Link } from 'react-router-dom';
import { useGetProductQuery } from '../../features/products/productsApi';
import { Spinner } from '../../components/ui/Spinner';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useGetProductQuery(id!);

  if (isLoading) return <Spinner />;
  if (isError || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        Produit introuvable.
      </div>
    );
  } 

  const hasPromo =
    product.promoPrice != null && product.promoPrice < product.price;
  const category =
    typeof product.categoryId === 'object' ? product.categoryId : undefined;
  const sellerName =
    typeof product.sellerId === 'object' ? product.sellerId.name : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            Pas d'image
          </div>
        )}
      </div>

      <div>
        {category && (
          <Link
            to={`/products?categoryId=${category._id}`}
            className="text-sm text-teal-700"
          >
            {category.name}
          </Link>
        )}
        <h1 className="text-2xl font-semibold text-slate-900 mt-1">
          {product.title}
        </h1>
        {sellerName && (
          <p className="text-sm text-slate-500 mt-1">Vendu par {sellerName}</p>
        )}

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-slate-900">
            {(hasPromo ? product.promoPrice! : product.price).toFixed(2)} €
          </span>
          {hasPromo && (
            <span className="text-lg text-slate-400 line-through">
              {product.price.toFixed(2)} €
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-4 text-slate-600 whitespace-pre-line">
            {product.description}
          </p>
        )}

        {product.type === 'physical' && (
          <p className="mt-4 text-sm text-slate-500">
            {product.stock && product.stock > 0
              ? `${product.stock} en stock`
              : 'Rupture de stock'}
          </p>
        )}

        {/* Le bouton "Ajouter au panier" arrive à l'étape suivante (module cart) */}
      </div>
    </div>
  );
}
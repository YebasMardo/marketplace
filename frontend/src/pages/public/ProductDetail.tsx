import { useParams, Link } from 'react-router-dom';
import { useGetProductQuery } from '../../features/products/productsApi';
import { Spinner } from '../../components/ui/Spinner';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useGetProductQuery(id!);

  if (isLoading) return <Spinner />;
  if (isError || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-ink-faint">
        Produit introuvable.
      </div>
    );
  }

  const hasPromo =
    product.promoPrice != null && product.promoPrice < product.price;
  const discount = hasPromo
    ? Math.round(100 - (product.promoPrice! / product.price) * 100)
    : 0;
  const category =
    typeof product.categoryId === 'object' ? product.categoryId : undefined;
  const sellerName =
    typeof product.sellerId === 'object' ? product.sellerId.name : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="relative aspect-square bg-paper-sunken rounded-xl overflow-hidden">
        {hasPromo && (
          <span className="absolute top-4 left-4 z-10 bg-clay text-paper text-xs font-semibold px-2.5 py-1 rounded-md">
            -{discount}%
          </span>
        )}
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-faint">
            Pas d'image
          </div>
        )}
      </div>

      <div>
        {category && (
          <Link
            to={`/products?categoryId=${category._id}`}
            className="text-xs font-medium tracking-wide uppercase text-ink-faint hover:text-ink transition-colors"
          >
            {category.name}
          </Link>
        )}
        <h1 className="text-3xl mt-2 text-ink">{product.title}</h1>
        {sellerName && (
          <p className="text-sm text-ink-faint mt-1.5">Vendu par {sellerName}</p>
        )}

        <div className="mt-5 flex items-baseline gap-3">
          <span className={`text-2xl font-semibold ${hasPromo ? 'text-clay' : 'text-ink'}`}>
            {(hasPromo ? product.promoPrice! : product.price).toFixed(2)} €
          </span>
          {hasPromo && (
            <span className="text-lg text-ink-faint line-through">
              {product.price.toFixed(2)} €
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-5 text-ink-soft leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        )}

        {product.type === 'physical' && (
          <p className="mt-5 text-sm text-ink-faint">
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

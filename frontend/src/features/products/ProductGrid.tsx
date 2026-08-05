import type { Product } from '../../types/api';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <EmptyState message="Aucun produit trouvé" />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
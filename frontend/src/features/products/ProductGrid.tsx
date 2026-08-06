import type { Product } from '../../types/api';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';

export function ProductGrid({
  products,
  // Le catalogue tourne à trois colonnes (la barre de filtres mange la
  // quatrième) là où l'accueil, pleine largeur, en tient quatre.
  columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
}: {
  products: Product[];
  columns?: string;
}) {
  if (products.length === 0) {
    return <EmptyState message="Aucun produit trouvé" />;
  }

  return (
    <div className={`grid gap-x-5 gap-y-9 ${columns}`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
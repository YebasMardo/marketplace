import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';

export function Footer() {
  const { data: categories } = useGetCategoriesQuery();
  const topCategories = (categories ?? []).filter((c) => c.parentId === null).slice(0, 6);

  return (
    <footer className="bg-ink text-paper/70 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-paper/10 text-paper">
              <svg width="14" height="14" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M16 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <path
                  d="M13.5 20h21l-1.6 16.2a3 3 0 0 1-3 2.8H18.1a3 3 0 0 1-3-2.8L13.5 20Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="font-display text-lg text-paper">Marketplace</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Un catalogue tenu par des vendeurs indépendants — produits physiques et
            numériques, sans intermédiaire superflu.
          </p>
        </div>

        {topCategories.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold tracking-wide uppercase text-paper/50 mb-4">
              Catégories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {topCategories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    to={`/products?categoryId=${cat._id}`}
                    className="hover:text-paper transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold tracking-wide uppercase text-paper/50 mb-4">
            Vendre
          </h3>
          <p className="text-sm leading-relaxed max-w-xs mb-3">
            Ouvrez votre boutique et publiez votre premier produit en quelques minutes.
          </p>
          <Link
            to="/register"
            className="inline-block text-sm font-medium text-paper border-b border-paper/40 hover:border-paper transition-colors"
          >
            Devenir vendeur →
          </Link>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-xs text-paper/40">
          © {new Date().getFullYear()} Marketplace.
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../features/products/productsApi';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { flattenCategoryTree } from '../../features/categories/categoryTree';
import { ProductGrid } from '../../features/products/ProductGrid';
import { Spinner } from '../../components/ui/Spinner';

const CARD_TILT = ['-rotate-6 -translate-y-2', 'rotate-2 translate-y-3', 'rotate-[10deg] -translate-y-6'];

export function Home() {
  const { data, isLoading } = useGetProductsQuery({ limit: 8 });
  const { data: categories } = useGetCategoriesQuery();

  const products = data?.items ?? [];
  const heroProducts = products.slice(0, 3);
  const topCategories = categories
    ? flattenCategoryTree(categories)
        .filter(({ depth }) => depth === 0)
        .slice(0, 8)
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase text-clay mb-4">
            Vendeurs indépendants
          </p>
          <h1 className="text-4xl sm:text-5xl leading-[1.08] text-ink">
            Le marché des choses
            <br />
            faites <span className="text-clay">avec soin</span>.
          </h1>
          <p className="mt-6 text-ink-soft leading-relaxed max-w-md">
            Produits physiques et numériques, publiés directement par les personnes
            qui les fabriquent. Pas d'entrepôt anonyme, pas de fioritures.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              to="/products"
              className="bg-ink text-paper px-6 py-3 rounded-full font-medium hover:bg-ink-hover transition-[background-color,transform] duration-150 ease-out active:scale-95"
            >
              Explorer le catalogue
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-ink border-b border-ink/30 hover:border-ink pb-0.5 transition-colors"
            >
              Vendre mes produits →
            </Link>
          </div>
        </div>

        <div className="relative h-72 sm:h-80 hidden sm:block">
          {heroProducts.length > 0 ? (
            heroProducts.map((product, i) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className={`absolute w-44 sm:w-48 bg-paper-raised border border-line rounded-xl shadow-[0_20px_40px_-16px_rgba(17,17,17,0.25)] overflow-hidden transition-transform duration-200 ease-out hover:-translate-y-1 ${CARD_TILT[i]}`}
                style={{ left: `${i * 22}%`, zIndex: i }}
              >
                <div className="aspect-square bg-paper-sunken">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-ink truncate">{product.title}</p>
                  <p className="text-sm text-ink-faint">{product.price.toFixed(2)} €</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="absolute inset-0 rounded-2xl bg-paper-sunken border border-line" />
          )}
        </div>
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-ink-faint mb-5">
            Parcourir par catégorie
          </h2>
          <div className="flex flex-wrap gap-3">
            {topCategories.map(({ category }) => (
              <Link
                key={category._id}
                to={`/products?categoryId=${category._id}`}
                className="px-4 py-2 rounded-full border border-line text-sm font-medium text-ink-soft hover:border-ink hover:text-ink transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="text-2xl text-ink">Sélection du moment</h2>
          <Link to="/products" className="text-sm font-medium text-ink hover:underline underline-offset-4">
            Tout voir →
          </Link>
        </div>
        {isLoading ? <Spinner /> : <ProductGrid products={products} />}
      </section>

      {/* Buyer / seller split */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-line bg-paper-raised p-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-sunken text-ink mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M9 8a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <h3 className="text-xl text-ink mb-2">Vous cherchez quelque chose</h3>
          <p className="text-ink-soft text-sm leading-relaxed mb-5">
            Parcourez un catalogue tenu par des vendeurs indépendants, avec des prix
            clairs et sans surprise à la caisse.
          </p>
          <Link
            to="/products"
            className="text-sm font-medium text-ink hover:underline underline-offset-4"
          >
            Parcourir le catalogue →
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-paper-raised p-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-soft text-clay mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 9.5 5.5 4h13L20 9.5M4 9.5v9a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18.5v-9M4 9.5h16M9 13.5a3 3 0 0 0 6 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="text-xl text-ink mb-2">Vous avez quelque chose à vendre</h3>
          <p className="text-ink-soft text-sm leading-relaxed mb-5">
            Ouvrez votre boutique, publiez vos produits physiques ou numériques, et
            suivez vos ventes depuis un tableau de bord dédié.
          </p>
          <Link
            to="/register"
            className="text-sm font-medium text-clay hover:text-clay-dark transition-colors"
          >
            Créer ma boutique →
          </Link>
        </div>
      </section>
    </div>
  );
}

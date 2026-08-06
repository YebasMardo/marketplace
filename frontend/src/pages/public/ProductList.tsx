import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../../features/products/productsApi';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { flattenCategoryTree } from '../../features/categories/categoryTree';
import { ProductGrid } from '../../features/products/ProductGrid';
import { Spinner } from '../../components/ui/Spinner';

export function ProductList() {
  // Les filtres vivent dans l'URL, pas dans un useState local : lien
  // partageable, bouton "précédent" du navigateur qui fonctionne, et un
  // F5 qui ne perd pas la recherche en cours.
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const q = searchParams.get('q') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');

  const { data: categories } = useGetCategoriesQuery();
  const { data, isLoading, isFetching } = useGetProductsQuery({
    categoryId,
    q,
    page,
    limit: 20,
  });

  const categoryOptions = categories ? flattenCategoryTree(categories) : [];

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page'); // tout nouveau filtre repart à la page 1
    setSearchParams(next);
  };

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl mb-7 text-ink">Catalogue</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-9">
        <div className="relative flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit…"
            defaultValue={q ?? ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateParam('q', (e.target as HTMLInputElement).value);
              }
            }}
            className="w-full rounded-lg border border-line bg-paper-raised pl-10 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink transition-shadow"
          />
        </div>
        <select
          value={categoryId ?? ''}
          onChange={(e) => updateParam('categoryId', e.target.value)}
          className="rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink transition-shadow"
        >
          <option value="">Toutes les catégories</option>
          {categoryOptions.map(({ category, depth }) => (
            <option key={category._id} value={category._id}>
              {'—'.repeat(depth)} {category.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <ProductGrid products={data?.items ?? []} />

          {data && data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1 || isFetching}
                className="px-4 py-2 text-sm font-medium rounded-full border border-line text-ink-soft hover:border-line-strong hover:text-ink transition-colors disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-soft"
              >
                Précédent
              </button>
              <span className="text-sm text-ink-faint">
                Page {data.page} / {data.totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= data.totalPages || isFetching}
                className="px-4 py-2 text-sm font-medium rounded-full border border-line text-ink-soft hover:border-line-strong hover:text-ink transition-colors disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-soft"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

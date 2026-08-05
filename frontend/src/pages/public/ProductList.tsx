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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          defaultValue={q ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParam('q', (e.target as HTMLInputElement).value);
            }
          }}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <select
          value={categoryId ?? ''}
          onChange={(e) => updateParam('categoryId', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
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
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1 || isFetching}
                className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="text-sm text-slate-600">
                Page {data.page} / {data.totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= data.totalPages || isFetching}
                className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
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
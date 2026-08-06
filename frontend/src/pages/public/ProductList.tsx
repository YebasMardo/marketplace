import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../../features/products/productsApi';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { CategoryFilterTree } from '../../features/categories/CategoryFilterTree';
import { ProductGrid } from '../../features/products/ProductGrid';
import {
  ChevronRightIcon,
  CloseIcon,
  SearchIcon,
  SlidersIcon,
} from '../../components/ui/icons';
import type { Category } from '../../types/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

// Le catalogue perd une colonne au profit de la barre de filtres : à
// quatre, les cartes tomberaient sous 190 px et le prix passerait à la ligne.
const GRID_COLUMNS = 'grid-cols-2 sm:grid-cols-3';

export function ProductList() {
  // Les filtres vivent dans l'URL, pas dans un useState local : lien
  // partageable, bouton "précédent" du navigateur qui fonctionne, et un
  // F5 qui ne perd pas la recherche en cours.
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const q = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const { data: categories } = useGetCategoriesQuery();
  const { data, isLoading, isFetching } = useGetProductsQuery({
    categoryId,
    q: q || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  // Champ de recherche : saisie locale, URL mise à jour après une pause de
  // frappe. En `replace`, pour ne pas empiler une entrée d'historique par
  // caractère tapé — sinon le bouton « précédent » remonte lettre à lettre.
  const [term, setTerm] = useState(q);
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    // Le `q` a changé ailleurs (recherche de l'en-tête, retour arrière) :
    // le champ doit suivre. Ajustement pendant le rendu, cf. useDropdown.
    setLastQ(q);
    setTerm(q);
  }

  useEffect(() => {
    if (term === q) return;
    const timeout = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (term) next.set('q', term);
          else next.delete('q');
          next.delete('page');
          return next;
        },
        { replace: true },
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [term, q, setSearchParams]);

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page'); // tout nouveau filtre repart à la page 1
      return next;
    });
  };

  const goToPage = (nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(nextPage));
      return next;
    });
  };

  const selectCategory = (id: string) => {
    updateParam('categoryId', id);
    setFiltersOpen(false);
  };

  const clearAll = () => {
    setTerm('');
    setSearchParams(new URLSearchParams());
    setFiltersOpen(false);
  };

  const selectedCategory = categories?.find((c) => c._id === categoryId);
  const hasFilters = Boolean(q || categoryId);
  const total = data?.total ?? 0;

  const filters = (
    <FiltersPanel
      categories={categories}
      selectedId={categoryId}
      onSelectCategory={selectCategory}
      term={term}
      onTermChange={setTerm}
      hasFilters={hasFilters}
      onClearAll={clearAll}
    />
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Link to="/" className="transition-colors hover:text-ink">
          Accueil
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-ink-soft">Catalogue</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="text-3xl text-ink">
          {selectedCategory ? selectedCategory.name : 'Catalogue'}
        </h1>
        <p className="text-sm text-ink-faint" aria-live="polite">
          {isLoading
            ? 'Chargement du catalogue…'
            : `${total} produit${total > 1 ? 's' : ''}${
                hasFilters ? ' correspondent à vos filtres' : ' disponibles'
              }`}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-10">
        {/* Colonne de filtres — collante sous l'en-tête, qui l'est aussi
            (68 px + 60 px) : sans ce décalage, le haut du panneau resterait
            masqué derrière la barre de navigation. */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-36 lg:max-h-[calc(100vh-10.5rem)] lg:overflow-y-auto lg:overscroll-contain">
            <div className="rounded-2xl border border-line bg-paper-raised">{filters}</div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-full border border-line bg-paper-raised px-4 py-2 text-sm font-medium text-ink transition-[border-color,transform] duration-150 ease-out hover:border-line-strong active:scale-[0.97]"
            >
              <SlidersIcon className="h-4 w-4 text-ink-soft" />
              Filtres
              {hasFilters && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold leading-none text-paper">
                  {(q ? 1 : 0) + (categoryId ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {hasFilters && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {q && (
                <FilterChip label={`« ${q} »`} onRemove={() => setTerm('')} />
              )}
              {selectedCategory && (
                <FilterChip
                  label={selectedCategory.name}
                  onRemove={() => updateParam('categoryId', '')}
                />
              )}
              <button
                type="button"
                onClick={clearAll}
                className="px-1 text-xs font-medium text-ink-faint underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Tout effacer
              </button>
            </div>
          )}

          {isLoading ? (
            <ProductGridSkeleton />
          ) : (
            <>
              {/* Refetch (page suivante, changement de filtre) : on atténue la
                  grille en place au lieu de la remplacer par un spinner, qui
                  ferait sauter la page à chaque clic. */}
              <div
                className={`transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                  isFetching ? 'opacity-55' : 'opacity-100'
                }`}
              >
                {data && data.items.length === 0 ? (
                  <NoResults hasFilters={hasFilters} onClear={clearAll} />
                ) : (
                  <ProductGrid products={data?.items ?? []} columns={GRID_COLUMNS} />
                )}
              </div>

              {data && data.totalPages > 1 && (
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  disabled={isFetching}
                  onChange={goToPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onClearAll={clearAll}
        hasFilters={hasFilters}
        resultCount={total}
      >
        {filters}
      </FiltersDrawer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panneau de filtres — partagé entre la colonne de gauche et le tiroir */
/* ------------------------------------------------------------------ */

function FiltersPanel({
  categories,
  selectedId,
  onSelectCategory,
  term,
  onTermChange,
  hasFilters,
  onClearAll,
}: {
  categories: Category[] | undefined;
  selectedId?: string;
  onSelectCategory: (id: string) => void;
  term: string;
  onTermChange: (value: string) => void;
  hasFilters: boolean;
  onClearAll: () => void;
}) {
  return (
    <div className="divide-y divide-line">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Filtres
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-clay underline-offset-4 transition-colors hover:text-clay-dark hover:underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="px-5 py-5">
        <label
          htmlFor="catalog-search"
          className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint"
        >
          Recherche
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            id="catalog-search"
            type="text"
            value={term}
            onChange={(event) => onTermChange(event.target.value)}
            placeholder="Nom, description…"
            className="h-10 w-full rounded-lg border border-line bg-paper-raised pl-10 pr-9 text-sm text-ink transition-shadow placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
          />
          {term && (
            <button
              type="button"
              onClick={() => onTermChange('')}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-faint transition-colors duration-150 hover:bg-paper-sunken hover:text-ink"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 py-5">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Catégories
        </h3>
        {categories && categories.length > 0 ? (
          <>
            <CategoryFilterTree
              categories={categories}
              selectedId={selectedId}
              onSelect={onSelectCategory}
            />
            <p className="mt-3.5 border-t border-line pt-3 text-xs leading-relaxed text-ink-faint">
              Une catégorie affiche aussi les produits de ses sous-catégories.
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-faint">Aucune catégorie pour le moment.</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tiroir mobile                                                        */
/* ------------------------------------------------------------------ */

function FiltersDrawer({
  open,
  onClose,
  onClearAll,
  hasFilters,
  resultCount,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onClearAll: () => void;
  hasFilters: boolean;
  resultCount: number;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Le tiroir reste monté pour que ses transitions jouent à l'ouverture ET à
  // la fermeture (un démontage coupe l'animation de sortie). `inert` le
  // retire alors du parcours clavier et des lecteurs d'écran, ce que
  // `pointer-events-none` seul ne fait pas.
  useEffect(() => {
    const panel = panelRef.current;
    if (panel) panel.inert = !open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Filtres du catalogue"
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={panelRef}
        className={`absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-paper-raised shadow-[0_0_60px_-12px_rgba(17,17,17,0.45)] transition-transform duration-300 ease-drawer motion-reduce:transition-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-display font-semibold text-ink">Filtres</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les filtres"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-[background-color,transform] duration-150 ease-out hover:bg-paper-sunken hover:text-ink active:scale-90"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

        <div className="flex items-center gap-3 border-t border-line px-5 py-4">
          {hasFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-[border-color,transform] duration-150 ease-out hover:border-line-strong hover:text-ink active:scale-[0.97]"
            >
              Effacer
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink-hover active:scale-[0.97]"
          >
            Voir {resultCount} produit{resultCount > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Éléments de la colonne de droite                                     */
/* ------------------------------------------------------------------ */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-raised py-1 pl-3 pr-1.5 text-xs font-medium text-ink">
      <span className="max-w-[14rem] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer le filtre ${label}`}
        className="grid h-5 w-5 place-items-center rounded-full text-ink-faint transition-[background-color,color,transform] duration-150 ease-out hover:bg-paper-sunken hover:text-ink active:scale-90"
      >
        <CloseIcon className="h-3 w-3" />
      </button>
    </span>
  );
}

function NoResults({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-paper-sunken text-ink-faint">
        <SearchIcon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-semibold text-ink">Aucun produit trouvé</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-faint">
        {hasFilters
          ? 'Essayez un autre terme, ou élargissez la recherche à une catégorie parente.'
          : 'Le catalogue est encore vide, revenez bientôt.'}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink-hover active:scale-[0.97]"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className={`grid gap-x-5 gap-y-9 ${GRID_COLUMNS}`} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-line bg-paper-raised p-3">
          {/* Pulsations décalées : six blocs qui clignotent à l'unisson
              ressemblent à un défaut d'affichage, pas à un chargement. */}
          <div
            className="aspect-square animate-pulse rounded-xl bg-paper-sunken"
            style={{ animationDelay: `${index * 90}ms` }}
          />
          <div className="mt-3.5 h-2.5 w-20 animate-pulse rounded-full bg-paper-sunken" />
          <div className="mt-3 h-3.5 w-full animate-pulse rounded-full bg-paper-sunken" />
          <div className="mt-3 h-3 w-16 animate-pulse rounded-full bg-paper-sunken" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                           */
/* ------------------------------------------------------------------ */

function Pagination({
  page,
  totalPages,
  disabled,
  onChange,
}: {
  page: number;
  totalPages: number;
  disabled: boolean;
  onChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="Pagination du catalogue"
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      <PageArrow
        label="Page précédente"
        disabled={page <= 1 || disabled}
        onClick={() => onChange(page - 1)}
      >
        <ChevronRightIcon className="h-4 w-4 rotate-180" />
      </PageArrow>

      {buildPageList(page, totalPages).map((entry, index) =>
        entry === 'ellipsis' ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-ink-faint">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onChange(entry)}
            disabled={disabled}
            aria-current={entry === page ? 'page' : undefined}
            className={`h-9 min-w-9 rounded-full px-2 text-sm transition-[background-color,color,transform] duration-150 ease-out active:scale-95 disabled:pointer-events-none ${
              entry === page
                ? 'bg-ink font-semibold text-paper'
                : 'text-ink-soft hover:bg-paper-sunken hover:text-ink'
            }`}
          >
            {entry}
          </button>
        ),
      )}

      <PageArrow
        label="Page suivante"
        disabled={page >= totalPages || disabled}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </PageArrow>
    </nav>
  );
}

function PageArrow({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition-[border-color,color,transform] duration-150 ease-out hover:border-line-strong hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

// Fenêtre de pages : les extrémités, la page courante et ses deux voisines.
// Au-delà, des points de suspension — une pagination à 40 boutons déborde.
function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  const wanted = new Set<number>([1, total]);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) wanted.add(p);
  }

  const result: (number | 'ellipsis')[] = [];
  let previous = 0;
  for (const p of [...wanted].sort((a, b) => a - b)) {
    if (previous && p - previous > 1) result.push('ellipsis');
    result.push(p);
    previous = p;
  }
  return result;
}

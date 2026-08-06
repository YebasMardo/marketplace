import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { flattenCategoryTree } from '../../features/categories/categoryTree';
import { useDropdown } from '../../lib/useDropdown';
import { ChevronDownIcon } from '../ui/icons';

/**
 * Entrée "Catégories" de la barre de navigation. Déroule les racines de
 * l'arbre avec, sous chacune, ses enfants directs — au-delà de deux niveaux
 * le panneau devient illisible, on renvoie alors vers le catalogue complet.
 */
export function CategoriesMenu() {
  const { open, setOpen, ref } = useDropdown();
  const { data: categories } = useGetCategoriesQuery();

  const flat = categories ? flattenCategoryTree(categories) : [];
  const roots = flat.filter(({ depth }) => depth === 0).slice(0, 6);

  const childrenOf = (parentId: string) =>
    flat
      .filter(({ category, depth }) => depth === 1 && category.parentId === parentId)
      .slice(0, 4);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          open ? 'text-ink' : 'text-ink-soft hover:text-ink'
        }`}
      >
        Catégories
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform duration-200 ease-out ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.85rem)] z-50 w-[min(34rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-paper-raised p-2 shadow-[0_18px_40px_-16px_rgba(17,17,17,0.28)]"
        >
          {roots.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-1">
                {roots.map(({ category }) => (
                  <div key={category._id} className="rounded-xl p-2.5">
                    <Link
                      to={`/products?categoryId=${category._id}`}
                      role="menuitem"
                      className="text-sm font-semibold text-ink hover:text-clay transition-colors"
                    >
                      {category.name}
                    </Link>
                    <ul className="mt-1.5 space-y-1">
                      {childrenOf(category._id).map(({ category: child }) => (
                        <li key={child._id}>
                          <Link
                            to={`/products?categoryId=${child._id}`}
                            role="menuitem"
                            className="text-xs text-ink-faint transition-colors hover:text-ink"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <Link
                to="/products"
                role="menuitem"
                className="mt-1 block border-t border-line px-2.5 pb-1 pt-3 text-xs font-medium text-clay hover:text-clay-dark transition-colors"
              >
                Voir tout le catalogue →
              </Link>
            </>
          ) : (
            <p className="px-2.5 py-3 text-sm text-ink-faint">Aucune catégorie pour le moment.</p>
          )}
        </div>
      )}
    </div>
  );
}

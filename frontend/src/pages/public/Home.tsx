import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../features/products/productsApi';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { flattenCategoryTree } from '../../features/categories/categoryTree';
import { ProductGrid } from '../../features/products/ProductGrid';
import { Spinner } from '../../components/ui/Spinner';
import { ArrowRightIcon } from '../../components/ui/icons';

// Visuels du hero — photos Unsplash servies par leur CDN, redimensionnées
// côté serveur (w/q) pour ne pas télécharger un 5000 px inutile.
const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`;

const HERO_IMAGES = {
  // Scène de shopping en rue : volontairement neutre côté produit, le
  // catalogue mêlant électronique, mode, montres et ebooks.
  marketplace: unsplash('photo-1763530054704-a2216f342310', 1100),
  // Poste de travail : illustre les produits numériques (type: 'digital').
  digital: unsplash('photo-1511385348-a52b4a160dc2', 900),
  // Vendeur qui prépare un colis — l'appel à ouvrir sa boutique.
  seller: unsplash('photo-1449247666642-264389f5f5b1', 900),
};

export function Home() {
  const { data, isLoading } = useGetProductsQuery({ limit: 8 });
  const { data: categories } = useGetCategoriesQuery();

  const products = data?.items ?? [];
  const topCategories = categories
    ? flattenCategoryTree(categories)
        .filter(({ depth }) => depth === 0)
        .slice(0, 8)
    : [];

  return (
    <div>
      {/* Hero — une grande tuile + deux petites, comme sur la maquette.
          Sous lg, tout retombe en pile verticale. */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-14">
        <div className="grid gap-4 lg:h-[30rem] lg:grid-cols-[1.28fr_1fr] lg:grid-rows-2">
          {/* Tuile principale : la promesse du marché */}
          <article className="group relative min-h-[24rem] overflow-hidden rounded-3xl bg-ink lg:row-span-2">
            <img
              src={HERO_IMAGES.marketplace}
              alt=""
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
            />
            {/* Voile dégradé : sans lui le texte blanc passe sous le seuil de
                contraste dès que la photo s'éclaircit. Le second calque assombrit
                uniformément — le dégradé seul ne suffit pas sur une photo très
                contrastée comme celle-ci. */}
            <div className="absolute inset-0 bg-ink/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/25" />

            <div className="relative flex h-full flex-col justify-between p-7 sm:p-9">
              <div className="max-w-[21rem]">
                <p className="text-xs font-semibold uppercase tracking-wide text-paper/70">
                  Vendeurs indépendants
                </p>
                <h1 className="mt-3 text-3xl leading-[1.1] text-paper sm:text-[2.3rem]">
                  Tout ce qu'il vous faut, vendu en direct.
                </h1>
                <Link
                  to="/products"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-transform duration-150 ease-out hover:bg-paper-raised active:scale-95"
                >
                  Explorer le catalogue
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              <p className="font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
                Prix nets.
              </p>
            </div>
          </article>

          {/* Tuile claire : les produits numériques (type: 'digital') */}
          <article className="group relative min-h-[13rem] overflow-hidden rounded-3xl bg-paper-sunken">
            <img
              src={HERO_IMAGES.digital}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-right transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-paper-sunken via-paper-sunken/90 to-paper-sunken/0" />

            <div className="relative flex h-full max-w-[16rem] flex-col justify-center p-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Produits numériques
              </p>
              <h2 className="mt-2 text-xl leading-snug text-ink">
                Payez, téléchargez. Pas d'attente.
              </h2>
              <Link
                to="/products"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink-hover active:scale-95"
              >
                Découvrir
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </article>

          {/* Tuile accent : l'appel aux vendeurs */}
          <article className="group relative min-h-[13rem] overflow-hidden rounded-3xl bg-clay">
            <img
              src={HERO_IMAGES.seller}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-clay-dark via-clay-dark/85 to-clay-dark/15" />

            <div className="relative flex h-full max-w-[17rem] flex-col justify-center p-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-paper/70">
                Ouvrez votre boutique
              </p>
              <h2 className="mt-2 text-xl leading-snug text-paper">
                Vendez vos créations en quelques minutes.
              </h2>
              <Link
                to="/register"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink transition-transform duration-150 ease-out hover:bg-paper-raised active:scale-95"
              >
                Créer ma boutique
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-ink-faint mb-6">
            Parcourir par catégorie
          </h2>
          <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-2 -mx-1 px-1">
            {topCategories.map(({ category }) => (
              <Link
                key={category._id}
                to={`/products?categoryId=${category._id}`}
                className="flex flex-col items-center gap-3 shrink-0 group"
              >
                <span className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-paper-sunken overflow-hidden flex items-center justify-center ring-1 ring-transparent group-hover:ring-ink/20 transition-shadow">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-[70%] w-[70%] object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-ink-faint">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="text-sm font-medium text-ink-soft group-hover:text-ink transition-colors text-center whitespace-nowrap">
                  {category.name}
                </span>
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

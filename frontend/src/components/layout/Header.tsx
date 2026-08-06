import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useGetMeQuery, useLogoutApiMutation } from '../../features/auth/authApi';
import { logout } from '../../features/auth/authSlice';
import { useGetCartQuery } from '../../features/cart/cartApi';
import { selectWishlistCount } from '../../features/wishlist/wishlistSlice';
import { UserMenu } from './UserMenu';
import { CategoriesMenu } from './CategoriesMenu';
import {
  BagIcon,
  ChevronDownIcon,
  HeartIcon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
} from '../ui/icons';

// Placeholders : coordonnées et accroche promotionnelle à remplacer par les
// vraies avant mise en ligne (aucune de ces offres n'existe côté backend).
const CONTACT_PHONE = '+33 1 84 80 00 00';
const CONTACT_EMAIL = 'contact@marketplace.fr';
const ANNOUNCEMENT = "Offre de lancement — livraison offerte dès 50 € d'achat";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium whitespace-nowrap transition-colors ${
    isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
  }`;

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useAppSelector((state) => state.auth.token);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const { data: me } = useGetMeQuery(undefined, { skip: !token });
  const { data: cart } = useGetCartQuery(undefined, { skip: !token });
  const [logoutApi] = useLogoutApiMutation();

  // Non contrôlé par l'URL : le champ garde ce que l'utilisateur tape même
  // quand il navigue ailleurs que sur le catalogue. On l'initialise
  // seulement au montage, depuis le `q` courant s'il y en a un.
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');

  const cartCount = cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = search.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } finally {
      // On purge côté client même si l'appel réseau échoue — pas de raison
      // de garder l'utilisateur "connecté" localement si le serveur est injoignable.
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <>
      {/* Bandeau promo — défile avec la page, seul le reste de l'en-tête colle */}
      <div className="bg-gradient-to-r from-clay-dark via-clay to-clay-dark text-paper">
        <div className="mx-auto flex h-10 max-w-6xl items-center justify-between gap-4 px-4 text-xs sm:px-6">
          <p className="truncate font-medium">{ANNOUNCEMENT}</p>
          <div className="hidden shrink-0 items-center gap-6 md:flex">
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:underline underline-offset-4">
              <PhoneIcon className="h-3.5 w-3.5" />
              {CONTACT_PHONE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 hover:underline underline-offset-4">
              <MailIcon className="h-3.5 w-3.5" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-paper-raised/95 backdrop-blur-sm">
        {/* Rangée 1 : sélecteurs · logo centré · actions */}
        <div className="mx-auto grid h-[68px] max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Langue et devise : purement informatifs tant que l'i18n et le
              multi-devise ne sont pas branchés — d'où des libellés inertes
              plutôt qu'un <select> qui ne ferait rien. */}
          <div className="hidden items-center gap-5 md:flex">
            <span className="flex items-center gap-1 text-sm font-medium text-ink-soft">
              FR
              <ChevronDownIcon className="h-3.5 w-3.5 text-ink-faint" />
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-ink-soft">
              EUR
              <ChevronDownIcon className="h-3.5 w-3.5 text-ink-faint" />
            </span>
          </div>

          <Link to="/" className="group flex items-center gap-2.5 md:justify-self-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper transition-transform duration-150 ease-out group-active:scale-90">
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M16 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <path
                  d="M13.5 20h21l-1.6 16.2a3 3 0 0 1-3 2.8H18.1a3 3 0 0 1-3-2.8L13.5 20Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="font-display text-xl text-ink">Marketplace</span>
          </Link>

          <div className="flex items-center gap-1 justify-self-end sm:gap-2">
            <IconLink to="/wishlist" label="Mes favoris" count={wishlistCount}>
              <HeartIcon className="h-[19px] w-[19px]" filled={wishlistCount > 0} />
            </IconLink>

            <IconLink to="/cart" label="Mon panier" count={cartCount}>
              <BagIcon className="h-[19px] w-[19px]" />
            </IconLink>

            {me ? (
              <div className="ml-1">
                <UserMenu user={me} onLogout={handleLogout} />
              </div>
            ) : (
              <div className="ml-1 flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:block"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink-hover active:scale-95"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Rangée 2 : recherche · navigation */}
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:h-[60px] lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-0">
            <form onSubmit={handleSearch} role="search" className="relative w-full lg:max-w-xs">
              <label htmlFor="header-search" className="sr-only">
                Rechercher un produit
              </label>
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                id="header-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un produit, une boutique…"
                className="h-10 w-full rounded-full bg-paper-sunken pl-11 pr-4 text-sm text-ink placeholder:text-ink-faint transition-shadow focus:outline-none focus:ring-2 focus:ring-ink/15"
              />
            </form>

            {/* Retour à la ligne plutôt qu'un défilement horizontal : un
                `overflow-x-auto` ici rognerait le panneau des catégories, qui
                est positionné en absolu. */}
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:flex-nowrap lg:gap-x-7">
              <NavLink to="/" end className={navLinkClass}>
                Accueil
              </NavLink>
              <NavLink to="/products" className={navLinkClass}>
                Catalogue
              </NavLink>
              <CategoriesMenu />

              {me?.role === 'seller' && (
                <>
                  <NavLink to="/seller/products" className={navLinkClass}>
                    Mes produits
                  </NavLink>
                  <NavLink to="/seller/sales" className={navLinkClass}>
                    Mes ventes
                  </NavLink>
                </>
              )}

              {me?.role === 'admin' && (
                <NavLink to="/admin/categories" className={navLinkClass}>
                  Gérer les catégories
                </NavLink>
              )}

              {me?.role === 'buyer' && (
                <NavLink to="/my-purchases" className={navLinkClass}>
                  Mes achats
                </NavLink>
              )}

              {!me && (
                <NavLink to="/register" className={navLinkClass}>
                  Devenir vendeur
                </NavLink>
              )}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}

/** Icône d'action avec pastille de compteur, comme sur la maquette. */
function IconLink({
  to,
  label,
  count,
  children,
}: {
  to: string;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-paper-sunken hover:text-ink active:scale-90"
    >
      {children}
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold leading-none text-paper">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

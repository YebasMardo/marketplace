import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useGetMeQuery, useLogoutApiMutation } from '../../features/auth/authApi';
import { logout } from '../../features/auth/authSlice';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
  }`;

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const { data: me } = useGetMeQuery(undefined, { skip: !token });
  const [logoutApi] = useLogoutApiMutation();

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
    <header className="sticky top-0 z-40 bg-paper-raised/95 backdrop-blur-sm border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
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

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" end className={navLinkClass}>
            Accueil
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Catalogue
          </NavLink>

          {token && me?.role === 'seller' && (
            <>
              <NavLink to="/seller/products" className={navLinkClass}>
                Mes produits
              </NavLink>
              <NavLink to="/seller/sales" className={navLinkClass}>
                Mes ventes
              </NavLink>
            </>
          )}

          {token && me?.role === 'admin' && (
            <NavLink to="/admin/categories" className={navLinkClass}>
              Catégories
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          {token && me?.role === 'buyer' && (
            <>
              <Link
                to="/my-purchases"
                className="hidden sm:block text-sm font-medium text-ink-soft hover:text-ink transition-colors"
              >
                Mes achats
              </Link>
              <Link
                to="/cart"
                aria-label="Panier"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-paper-sunken transition-colors duration-150 active:scale-90"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path d="M9 8a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </Link>
            </>
          )}

          {!token && (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink-soft hover:text-ink transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-ink text-paper px-4 py-2 rounded-full hover:bg-ink-hover transition-[background-color,transform] duration-150 ease-out active:scale-95"
              >
                S'inscrire
              </Link>
            </>
          )}

          {token && (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

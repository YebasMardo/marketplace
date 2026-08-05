import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useGetMeQuery, useLogoutApiMutation } from '../../features/auth/authApi';
import { logout } from '../../features/auth/authSlice';

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
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg text-slate-900">
          Marketplace
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Catalogue
          </Link>
          <Link to="/products" className="text-slate-600 hover:text-slate-900">
            Boutique
          </Link>

          {!token && (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-teal-700 text-white px-3 py-1.5 rounded-lg hover:bg-teal-800"
              >
                S'inscrire
              </Link>
            </>
          )}

          {token && me?.role === 'buyer' && (
            <>
              <Link to="/cart" className="text-slate-600 hover:text-slate-900">
                Panier
              </Link>
              <Link to="/my-purchases" className="text-slate-600 hover:text-slate-900">
                Mes achats
              </Link>
            </>
          )}

          {token && me?.role === 'seller' && (
            <>
              <Link to="/seller/products" className="text-slate-600 hover:text-slate-900">
                Mes produits
              </Link>
              <Link to="/seller/sales" className="text-slate-600 hover:text-slate-900">
                Mes ventes
              </Link>
            </>
          )}

          {token && me?.role === 'admin' && (
            <Link to="/admin/categories" className="text-slate-600 hover:text-slate-900">
              Catégories
            </Link>
          )}

          {token && (
            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900"
            >
              Déconnexion
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
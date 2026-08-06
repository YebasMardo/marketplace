import { Link } from 'react-router-dom';
import type { Role, User } from '../../types/api';
import { useDropdown } from '../../lib/useDropdown';
import { ChevronDownIcon, LogoutIcon, UserIcon } from '../ui/icons';

const ROLE_LABEL: Record<Role, string> = {
  buyer: 'Acheteur',
  seller: 'Vendeur',
  admin: 'Administrateur',
};

// Chaque rôle ne voit que les écrans que RoleRoute l'autorise à atteindre —
// un lien affiché ici mais refusé à l'arrivée serait pire que pas de lien.
const ROLE_LINKS: Record<Role, { to: string; label: string }[]> = {
  buyer: [
    { to: '/my-purchases', label: 'Mes achats' },
    { to: '/cart', label: 'Mon panier' },
    { to: '/wishlist', label: 'Mes favoris' },
  ],
  seller: [
    { to: '/seller/dashboard', label: 'Tableau de bord' },
    { to: '/seller/products', label: 'Mes produits' },
    { to: '/seller/sales', label: 'Mes ventes' },
  ],
  admin: [{ to: '/admin/categories', label: 'Gérer les catégories' }],
};

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { open, setOpen, ref } = useDropdown();

  const displayName = user.name?.trim() || user.email.split('@')[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Compte de ${displayName}`}
        className={`flex h-9 items-center gap-1.5 rounded-full pl-1 pr-1.5 sm:pr-2 transition-colors duration-150 ease-out active:scale-95 ${
          open ? 'bg-paper-sunken text-ink' : 'text-ink-soft hover:bg-paper-sunken hover:text-ink'
        }`}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-semibold text-paper">
          {initial || <UserIcon className="h-4 w-4" />}
        </span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform duration-200 ease-out ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-60 origin-top-right overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-[0_18px_40px_-16px_rgba(17,17,17,0.28)]"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-clay-soft px-2 py-0.5 text-[11px] font-medium text-clay">
              {ROLE_LABEL[user.role]}
            </span>
          </div>

          <div className="py-1.5">
            {ROLE_LINKS[user.role].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                className="block px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-line py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-medium text-clay transition-colors hover:bg-clay-soft"
            >
              <LogoutIcon className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

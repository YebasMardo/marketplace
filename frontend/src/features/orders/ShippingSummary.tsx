import type { ReactNode } from 'react';
import type { ShippingDetails } from '../../types/api';
import { MailIcon, MapPinIcon, PhoneIcon } from '../../components/ui/icons';

// Bloc partagé entre la confirmation de checkout et le détail de commande
// (page vue aussi bien par l'acheteur que par le vendeur, qui en a besoin
// pour expédier). Les champs postaux sont absents des commandes numériques
// ET des commandes créées avant l'ajout du formulaire de livraison : tout
// est rendu conditionnellement.

/** Ligne de contact cliquable (mailto:/tel:) : le vendeur appelle ou écrit
 *  directement depuis la commande plutôt que de recopier le champ. */
function ContactRow({
  icon,
  label,
  href,
  value,
}: {
  icon: ReactNode;
  label: string;
  href: string;
  value: string;
}) {
  return (
    <a
      href={href}
      className="group flex min-w-0 items-center gap-2.5 rounded-lg py-1 text-sm text-ink-soft transition-colors duration-150 hover:text-ink"
    >
      <span className="shrink-0 text-ink-faint transition-colors duration-150 group-hover:text-ink">
        {icon}
      </span>
      <span className="sr-only">{label} : </span>
      <span className="truncate">{value}</span>
    </a>
  );
}

export function ShippingSummary({ shipping }: { shipping: ShippingDetails }) {
  const { fullName, email, phone, addressLine, postalCode, city, country } =
    shipping;

  const cityLine = [postalCode, city].filter(Boolean).join(' ');
  const hasPostalAddress = Boolean(addressLine || cityLine || country);

  return (
    <address className="not-italic">
      <div className="flex items-start gap-3">
        {/* La pastille n'apparaît que s'il y a vraiment une adresse : sur une
            commande numérique, une épingle de carte induirait en erreur. */}
        {hasPostalAddress && (
          <span
            aria-hidden="true"
            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper-sunken text-ink-soft"
          >
            <MapPinIcon className="h-[18px] w-[18px]" />
          </span>
        )}

        <div className="min-w-0 text-sm leading-relaxed text-ink-soft">
          <p className="font-semibold text-ink">{fullName}</p>
          {addressLine && <p>{addressLine}</p>}
          {cityLine && <p>{cityLine}</p>}
          {country && <p>{country}</p>}
        </div>
      </div>

      <div className="mt-3 grid gap-1 border-t border-line pt-3 sm:grid-cols-2 sm:gap-x-4">
        <ContactRow
          icon={<MailIcon className="h-4 w-4" />}
          label="Email"
          href={`mailto:${email}`}
          value={email}
        />
        <ContactRow
          icon={<PhoneIcon className="h-4 w-4" />}
          label="Téléphone"
          // Les espaces de saisie ne sont pas composables par un téléphone.
          href={`tel:${phone.replace(/[^+\d]/g, '')}`}
          value={phone}
        />
      </div>
    </address>
  );
}

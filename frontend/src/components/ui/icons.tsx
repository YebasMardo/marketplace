// Jeu d'icônes partagé (en-tête, menu utilisateur). Toutes tracées sur une
// grille 24 et dessinées au trait : la taille se pilote par `className`
// (w-*/h-*) et la couleur par `currentColor`.
type IconProps = { className?: string };

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...stroke}
      fill={filled ? 'currentColor' : 'none'}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.7 1.1-1a5.5 5.5 0 0 0 0-7.7Z" />
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      {/* Anse à l'intérieur du sac : à 19 px, une anse posée sur le bord
          supérieur se lit comme le couvercle d'une poubelle. */}
      <path d="M5.2 7.5h13.6l-1 11.3a2.2 2.2 0 0 1-2.2 2H8.4a2.2 2.2 0 0 1-2.2-2L5.2 7.5Z" />
      <path d="M8.9 10.6V7.7a3.1 3.1 0 0 1 6.2 0v2.9" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="m6 9.5 6 5.5 6-5.5" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="m9.5 6 5.5 6-5.5 6" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

/** Curseurs de réglage — bouton « Filtres » de la version mobile. */
export function SlidersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M4 7h9M18.5 7H20M4 12h3.5M12.5 12H20M4 17h9M18.5 17H20" />
      <circle cx="15.5" cy="7" r="2.2" />
      <circle cx="10" cy="12" r="2.2" />
      <circle cx="15.5" cy="17" r="2.2" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6.4 3.5h3l1.4 3.6-2 1.3a11 11 0 0 0 4.8 4.8l1.3-2 3.6 1.4v3a1.9 1.9 0 0 1-2.1 1.9A14.8 14.8 0 0 1 4.5 5.6 1.9 1.9 0 0 1 6.4 3.5Z" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M4.5 12h14M13 6.5l5.5 5.5L13 17.5" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
      <path d="M6.5 6.5 7.4 19a1.8 1.8 0 0 0 1.8 1.7h5.6a1.8 1.8 0 0 0 1.8-1.7l.9-12.5" />
      <path d="M10.5 10v7M13.5 10v7" />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M5.5 12h13" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

/** Étiquette — champ « code promo » du récapitulatif de commande. */
export function TagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M11.6 3.5H4.9a1.4 1.4 0 0 0-1.4 1.4v6.7a1.4 1.4 0 0 0 .4 1l8 8a1.4 1.4 0 0 0 2 0l6.7-6.7a1.4 1.4 0 0 0 0-2l-8-8a1.4 1.4 0 0 0-1-.4Z" />
      <path d="M7.8 7.8h.01" />
    </svg>
  );
}

/** Billets + pièce — paiement en espèces à la livraison. */
export function BanknoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 10.2v3.6M18 10.2v3.6" />
    </svg>
  );
}

/**
 * Glyphe « S » officiel de Stripe — tracé plein, pas au trait comme le reste
 * du jeu d'icônes : c'est une marque, on ne la redessine pas.
 */
export function StripeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003Z" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M15 4.5h2.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H15" />
      <path d="M11 8.5 14.5 12 11 15.5M14 12H4.5" />
    </svg>
  );
}

/** Épingle de carte — bloc d'adresse de livraison. */
export function MapPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M19 10.3c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </svg>
  );
}

/** Carton — commande physique (à expédier). */
export function BoxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M20.5 7.8v8.4a1.6 1.6 0 0 1-.85 1.4l-6.9 3.7a1.6 1.6 0 0 1-1.5 0l-6.9-3.7a1.6 1.6 0 0 1-.85-1.4V7.8" />
      <path d="m3.7 7.1 7.55-3.9a1.6 1.6 0 0 1 1.5 0l7.55 3.9-8.3 4.4-8.3-4.4Z" />
      <path d="M12 11.5v9.4" />
    </svg>
  );
}

/** Flèche descendante vers un socle — commande numérique (téléchargement). */
export function DownloadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M12 3.5v10.5m0 0 4-4m-4 4-4-4" />
      <path d="M4.5 16v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V16" />
    </svg>
  );
}

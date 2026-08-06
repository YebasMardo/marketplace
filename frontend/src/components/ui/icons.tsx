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

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M15 4.5h2.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H15" />
      <path d="M11 8.5 14.5 12 11 15.5M14 12H4.5" />
    </svg>
  );
}

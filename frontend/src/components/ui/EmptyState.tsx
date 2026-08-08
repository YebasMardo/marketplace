import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  /** Précision facultative sous le message principal. */
  hint?: string;
  /** Pictogramme posé dans une pastille au-dessus du message. */
  icon?: ReactNode;
  /** Bouton/lien de sortie (« Parcourir le catalogue »…). */
  action?: ReactNode;
}

export function EmptyState({ message, hint, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      {icon && (
        <span
          aria-hidden="true"
          className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-paper-sunken text-ink-faint"
        >
          {icon}
        </span>
      )}
      <p className="font-medium text-ink-soft">{message}</p>
      {hint && <p className="mt-1.5 max-w-sm text-sm text-ink-faint">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

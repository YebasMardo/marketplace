export interface OrderStat {
  label: string;
  value: string;
  /** Précision sous la valeur (« sur 12 commandes », « à expédier »…). */
  hint?: string;
}

/** Bandeau de chiffres clés en tête des listes de commandes (achats/ventes).
 *  Volontairement sans couleur : ce sont des repères, pas des alertes. */
export function OrdersSummary({ stats }: { stats: OrderStat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          // Sur deux colonnes (mobile), une dernière tuile orpheline occupe
          // toute la largeur plutôt que de laisser un trou à côté d'elle.
          className={`rounded-2xl border border-line bg-paper-raised px-4 py-3.5 ${
            i === stats.length - 1 && stats.length % 2 === 1
              ? 'col-span-2 sm:col-span-1'
              : ''
          }`}
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            {stat.label}
          </dt>
          <dd className="mt-1.5 text-xl font-semibold text-ink tabular-nums">
            {stat.value}
            {stat.hint && (
              <span className="ml-1.5 text-xs font-normal normal-case tracking-normal text-ink-faint">
                {stat.hint}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

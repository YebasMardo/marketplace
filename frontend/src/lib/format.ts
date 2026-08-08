/** Montants : toujours deux décimales et le suffixe MAD, jamais un symbole —
 *  le backend ne stocke qu'une devise et l'app l'affiche partout pareil. */
export const formatMad = (amount: number) => `${amount.toFixed(2)} MAD`;

/** Date courte des listes de commandes (« 8 août 2026 »). */
export const formatOrderDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

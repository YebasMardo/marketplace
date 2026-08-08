import type { OrderStatus } from '../types/api';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'En attente de paiement',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

// Classes Tailwind prêtes pour un badge — voir features/orders/OrderStatusBadge.
// Teintes volontairement basses (fond -50, texte -700, anneau translucide) :
// la palette de l'app est encre + clay, un badge saturé y crierait. La couleur
// ne porte pas l'information seule — le libellé reste toujours affiché.
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-50 text-amber-800 ring-amber-600/15',
  processing: 'bg-blue-50 text-blue-800 ring-blue-600/15',
  shipped: 'bg-indigo-50 text-indigo-800 ring-indigo-600/15',
  delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
  completed: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
  cancelled: 'bg-red-50 text-red-800 ring-red-600/15',
};

/** Pastille du badge : même famille de teinte, saturation plus haute. */
export const ORDER_STATUS_DOTS: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-500',
  processing: 'bg-blue-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-emerald-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

// §6.2 : deux statuts terminaux différents pour un même concept de succès.
// Ne jamais filtrer une liste de commandes sur 'completed' seul — on
// perdrait silencieusement toutes les commandes physiques livrées.
export const SUCCESSFUL_STATUSES: OrderStatus[] = ['delivered', 'completed'];

/** Statuts encore « vivants » : la commande attend une action de l'une des
 *  deux parties. Complémentaire de SUCCESSFUL_STATUSES + 'cancelled'. */
export const ACTIVE_STATUSES: OrderStatus[] = [
  'pending_payment',
  'processing',
  'shipped',
];

/** Regroupements proposés en filtre sur les listes de commandes. */
export type OrderStatusGroup = 'all' | 'active' | 'done' | 'cancelled';

export const ORDER_STATUS_GROUP_LABELS: Record<OrderStatusGroup, string> = {
  all: 'Toutes',
  active: 'En cours',
  done: 'Terminées',
  cancelled: 'Annulées',
};

export function matchesStatusGroup(
  status: OrderStatus,
  group: OrderStatusGroup,
): boolean {
  if (group === 'all') return true;
  if (group === 'active') return ACTIVE_STATUSES.includes(status);
  if (group === 'done') return SUCCESSFUL_STATUSES.includes(status);
  return status === 'cancelled';
}

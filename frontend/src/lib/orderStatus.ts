import type { OrderStatus } from '../types/api';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'En attente de paiement',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

// Classes Tailwind prêtes pour un badge — voir components/ui/Badge (à créer)
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

// §6.2 : deux statuts terminaux différents pour un même concept de succès.
// Ne jamais filtrer une liste de commandes sur 'completed' seul — on
// perdrait silencieusement toutes les commandes physiques livrées.
export const SUCCESSFUL_STATUSES: OrderStatus[] = ['delivered', 'completed'];
import type { OrderStatus } from '../../types/api';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_DOTS,
  ORDER_STATUS_LABELS,
} from '../../lib/orderStatus';

/** Badge de statut, identique dans la liste et sur le détail d'une commande :
 *  un même statut ne doit jamais avoir deux apparences selon la page. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${ORDER_STATUS_COLORS[status]}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${ORDER_STATUS_DOTS[status]}`}
      />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

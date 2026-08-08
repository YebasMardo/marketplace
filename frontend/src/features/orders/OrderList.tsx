import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../../types/api';
import {
  ORDER_STATUS_GROUP_LABELS,
  matchesStatusGroup,
  type OrderStatusGroup,
} from '../../lib/orderStatus';
import { formatMad, formatOrderDate } from '../../lib/format';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  BagIcon,
  BoxIcon,
  ChevronRightIcon,
  DownloadIcon,
} from '../../components/ui/icons';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderListProps {
  orders: Order[];
  emptyMessage: string;
  /** Lien de sortie proposé quand la liste est vide (facultatif). */
  emptyAction?: ReactNode;
}

const GROUPS: OrderStatusGroup[] = ['all', 'active', 'done', 'cancelled'];

/** Référence courte affichée à l'utilisateur — l'ObjectId complet reste dans
 *  l'URL, mais 24 caractères hexadécimaux ne se lisent ni ne se dictent. */
const orderRef = (id: string) => id.slice(-6).toUpperCase();

function OrderRow({ order }: { order: Order }) {
  const isPhysical = order.fulfillmentType === 'physical';
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const titles = order.items.map((item) => item.title).join(', ');

  return (
    <li>
      <Link
        to={`/orders/${order._id}`}
        className="group flex items-start gap-4 rounded-2xl border border-line bg-paper-raised p-4 sm:items-center sm:p-5
                   transition-[border-color,box-shadow,transform] duration-150 ease-out
                   hover:border-line-strong hover:shadow-[0_10px_30px_-22px_rgba(17,17,17,0.55)]
                   active:scale-[0.995] motion-reduce:active:scale-100"
      >
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper-sunken text-ink-soft
                     transition-colors duration-150 ease-out group-hover:bg-ink group-hover:text-paper"
        >
          {isPhysical ? (
            <BoxIcon className="h-5 w-5" />
          ) : (
            <DownloadIcon className="h-5 w-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate font-semibold text-ink">
              Commande #{orderRef(order._id)}
            </p>
            <span className="shrink-0 font-semibold text-ink tabular-nums">
              {formatMad(order.total)}
            </span>
          </div>

          <p className="mt-0.5 truncate text-sm text-ink-soft">{titles}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-ink-faint">
            <OrderStatusBadge status={order.status} />
            <span>{formatOrderDate(order.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </span>
            <span aria-hidden="true">·</span>
            <span>{isPhysical ? 'Physique' : 'Numérique'}</span>
          </div>
        </div>

        <ChevronRightIcon
          className="mt-3 hidden h-4 w-4 shrink-0 text-ink-faint transition-[transform,color] duration-150 ease-out
                     group-hover:translate-x-0.5 group-hover:text-ink motion-reduce:group-hover:translate-x-0 sm:mt-0 sm:block"
        />
      </Link>
    </li>
  );
}

export function OrderList({ orders, emptyMessage, emptyAction }: OrderListProps) {
  const [group, setGroup] = useState<OrderStatusGroup>('all');

  // Compteurs calculés sur la liste complète : un onglet doit garder son
  // compte même quand un autre filtre est actif.
  const counts = useMemo(
    () =>
      GROUPS.reduce(
        (acc, key) => {
          acc[key] = orders.filter((order) =>
            matchesStatusGroup(order.status, key),
          ).length;
          return acc;
        },
        {} as Record<OrderStatusGroup, number>,
      ),
    [orders],
  );

  const visible = useMemo(
    () => orders.filter((order) => matchesStatusGroup(order.status, group)),
    [orders, group],
  );

  if (orders.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        icon={<BagIcon className="h-6 w-6" />}
        action={emptyAction}
      />
    );
  }

  return (
    <div>
      {/* Filtres masqués tant qu'une seule catégorie est représentée : un
          filtre à un seul choix n'est pas un filtre. Boutons bascules plutôt
          qu'un `tablist` — il n'y a pas de panneaux distincts à annoncer,
          juste une même liste filtrée. */}
      {GROUPS.filter((key) => key !== 'all' && counts[key] > 0).length > 1 && (
        <div
          role="group"
          aria-label="Filtrer par statut"
          className="mb-5 flex flex-wrap gap-2"
        >
          {GROUPS.map((key) => {
            const active = key === group;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setGroup(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium
                            transition-[background-color,color,border-color,transform] duration-150 ease-out
                            active:scale-[0.97] motion-reduce:active:scale-100 ${
                              active
                                ? 'bg-ink text-paper'
                                : 'border border-line bg-paper-raised text-ink-soft hover:border-line-strong hover:text-ink'
                            }`}
              >
                {ORDER_STATUS_GROUP_LABELS[key]}
                <span
                  className={`tabular-nums text-xs ${active ? 'text-paper/60' : 'text-ink-faint'}`}
                >
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          message="Aucune commande dans cette catégorie"
          action={
            <button
              type="button"
              onClick={() => setGroup('all')}
              className="rounded-full border border-line bg-paper-raised px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-sunken"
            >
              Voir toutes les commandes
            </button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((order) => (
            <OrderRow key={order._id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** Squelette affiché pendant le chargement : garde la hauteur et le rythme de
 *  la liste réelle, pour que rien ne saute quand les données arrivent. */
export function OrderListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-line bg-paper-raised p-4 sm:p-5"
        >
          <span className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-paper-sunken" />
          <div className="flex-1 space-y-2">
            <span className="block h-4 w-40 animate-pulse rounded bg-paper-sunken" />
            <span className="block h-3 w-2/3 animate-pulse rounded bg-paper-sunken" />
            <span className="block h-3 w-32 animate-pulse rounded bg-paper-sunken" />
          </div>
        </li>
      ))}
    </ul>
  );
}

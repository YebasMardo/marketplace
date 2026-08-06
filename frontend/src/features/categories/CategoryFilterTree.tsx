import { useState } from 'react';
import type { Category } from '../../types/api';
import {
  buildCategoryTree,
  getAncestorIds,
  type CategoryNode,
} from './categoryTree';
import { ChevronRightIcon } from '../../components/ui/icons';

interface CategoryFilterTreeProps {
  categories: Category[];
  /** Catégorie active, ou `undefined` pour « toutes ». */
  selectedId?: string;
  onSelect: (categoryId: string) => void;
}

/**
 * Arbre de catégories repliable du panneau de filtres.
 *
 * Deux cibles de clic distinctes par ligne : le chevron déplie la branche,
 * le libellé filtre. Confondre les deux (un seul bouton qui fait tout)
 * empêche de regarder ce que contient une branche sans quitter la sélection
 * en cours — et de sélectionner un parent sans déplier ses enfants.
 */
export function CategoryFilterTree({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterTreeProps) {
  const tree = buildCategoryTree(categories);

  // Le chemin menant à la catégorie active est déplié d'office : arriver sur
  // /products?categoryId=<sous-catégorie> depuis le menu de l'en-tête doit
  // montrer la sélection, pas la cacher dans une branche fermée.
  const ancestors = selectedId ? getAncestorIds(categories, selectedId) : [];
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(ancestors));

  // Ajustement pendant le rendu plutôt que dans un effet — même motif que
  // `useDropdown` : on recalcule un état à partir d'une prop qui change, sans
  // provoquer un second rendu en cascade.
  const [lastSelectedId, setLastSelectedId] = useState(selectedId);
  if (selectedId !== lastSelectedId) {
    setLastSelectedId(selectedId);
    if (ancestors.length > 0) {
      setExpanded((prev) => new Set([...prev, ...ancestors]));
    }
  }

  const toggle = (categoryId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(categoryId)) next.add(categoryId);
      return next;
    });
  };

  return (
    <ul className="-mx-1.5 space-y-0.5">
      <li>
        <CategoryRow
          label="Toutes les catégories"
          active={!selectedId}
          onClick={() => onSelect('')}
        />
      </li>
      {tree.map((node) => (
        <CategoryBranch
          key={node.category._id}
          node={node}
          selectedId={selectedId}
          expandedIds={expanded}
          onToggle={toggle}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function CategoryBranch({
  node,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
}: {
  node: CategoryNode;
  selectedId?: string;
  expandedIds: Set<string>;
  onToggle: (categoryId: string) => void;
  onSelect: (categoryId: string) => void;
}) {
  const { category, children } = node;
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(category._id);

  return (
    <li>
      <CategoryRow
        label={category.name}
        active={selectedId === category._id}
        onClick={() => onSelect(category._id)}
        disclosure={
          hasChildren
            ? { expanded: isExpanded, onToggle: () => onToggle(category._id) }
            : undefined
        }
      />

      {hasChildren && (
        // grid-rows 0fr → 1fr : la seule façon d'animer vers une hauteur
        // inconnue en CSS pur. Le fils doit porter overflow-hidden, sinon le
        // contenu déborde de la piste au lieu d'être rogné.
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <ul className="ml-[1.35rem] space-y-0.5 border-l border-line pl-1.5 pt-0.5">
              {children.map((child) => (
                <CategoryBranch
                  key={child.category._id}
                  node={child}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

function CategoryRow({
  label,
  active,
  onClick,
  disclosure,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disclosure?: { expanded: boolean; onToggle: () => void };
}) {
  return (
    <div className="flex items-center gap-0.5">
      {disclosure ? (
        <button
          type="button"
          onClick={disclosure.onToggle}
          aria-expanded={disclosure.expanded}
          aria-label={disclosure.expanded ? `Replier ${label}` : `Déplier ${label}`}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink-faint transition-colors duration-150 hover:bg-paper-sunken hover:text-ink"
        >
          <ChevronRightIcon
            className={`h-3.5 w-3.5 transition-transform duration-200 ease-out motion-reduce:transition-none ${
              disclosure.expanded ? 'rotate-90' : ''
            }`}
          />
        </button>
      ) : (
        // Gouttière fantôme : sans elle, les feuilles ne s'alignent pas sur
        // les libellés de leurs frères dépliables.
        <span className="h-6 w-6 shrink-0" aria-hidden="true" />
      )}

      <button
        type="button"
        onClick={onClick}
        aria-current={active ? 'true' : undefined}
        className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-left text-sm transition-[background-color,color] duration-150 ${
          active
            ? 'bg-clay-soft font-semibold text-clay-dark'
            : 'text-ink-soft hover:bg-paper-sunken hover:text-ink'
        }`}
      >
        {label}
      </button>
    </div>
  );
}

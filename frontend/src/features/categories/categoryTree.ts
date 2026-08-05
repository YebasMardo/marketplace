import type { Category } from '../../types/api';

export interface CategoryOption {
  category: Category;
  depth: number;
}

// Regroupe d'abord les catégories par parent, puis parcourt l'arbre en
// profondeur à partir des racines (parentId === null). Le résultat est
// une liste plate mais ORDONNÉE (parent toujours avant ses enfants),
// avec la profondeur de chacun — pratique pour indenter visuellement
// sans construire un vrai composant d'arbre récursif.
export function flattenCategoryTree(categories: Category[]): CategoryOption[] {
  const byParent = new Map<string | null, Category[]>();
  for (const cat of categories) {
    const key = cat.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(cat);
  }

  const result: CategoryOption[] = [];
  function walk(parentId: string | null, depth: number) {
    const children = byParent.get(parentId) ?? [];
    for (const child of children) {
      result.push({ category: child, depth });
      walk(child._id, depth + 1);
    }
  }
  walk(null, 0);
  return result;
}
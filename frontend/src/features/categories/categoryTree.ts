import type { Category } from '../../types/api';

export interface CategoryOption {
  category: Category;
  depth: number;
}

export interface CategoryNode {
  category: Category;
  children: CategoryNode[];
}

function groupByParent(categories: Category[]): Map<string | null, Category[]> {
  const byParent = new Map<string | null, Category[]>();
  for (const cat of categories) {
    const key = cat.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(cat);
  }
  return byParent;
}

// Regroupe d'abord les catégories par parent, puis parcourt l'arbre en
// profondeur à partir des racines (parentId === null). Le résultat est
// une liste plate mais ORDONNÉE (parent toujours avant ses enfants),
// avec la profondeur de chacun — pratique pour indenter visuellement
// sans construire un vrai composant d'arbre récursif.
export function flattenCategoryTree(categories: Category[]): CategoryOption[] {
  const byParent = groupByParent(categories);

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

// Version arborescente (et non plate) de la même donnée, pour les UI qui
// replient/déplient réellement leurs branches — la liste plate ne permet pas
// de masquer une sous-arborescence entière sans la reparcourir à chaque rendu.
//
// `seen` protège d'un arbre malformé (A parent de B, B parent de A), qui
// ferait sinon boucler la récursion à l'infini.
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const byParent = groupByParent(categories);
  const seen = new Set<string>();

  function build(parentId: string | null): CategoryNode[] {
    return (byParent.get(parentId) ?? [])
      .filter((category) => !seen.has(category._id))
      .map((category) => {
        seen.add(category._id);
        return { category, children: build(category._id) };
      });
  }

  return build(null);
}

// Chaîne des parents d'une catégorie, du plus proche à la racine. Sert à
// déplier automatiquement le chemin qui mène à la catégorie sélectionnée.
export function getAncestorIds(
  categories: Category[],
  categoryId: string,
): string[] {
  const byId = new Map(categories.map((category) => [category._id, category]));
  const ancestors: string[] = [];
  const seen = new Set<string>();

  let current = byId.get(categoryId)?.parentId ?? null;
  while (current && byId.has(current) && !seen.has(current)) {
    seen.add(current);
    ancestors.push(current);
    current = byId.get(current)!.parentId;
  }

  return ancestors;
}
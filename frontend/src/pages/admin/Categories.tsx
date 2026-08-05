import { useState, type FormEvent } from 'react';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../features/categories/categoriesApi';
import { flattenCategoryTree } from '../../features/categories/categoryTree';
import { Spinner } from '../../components/ui/Spinner';

export function Categories() {
  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating, isError: createFailed }] =
    useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');

  const options = categories ? flattenCategoryTree(categories) : [];

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({ name, parentId: parentId || undefined }).unwrap();
      setName('');
      setParentId('');
    } catch {
      // isError ci-dessous gère déjà l'affichage
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
    } catch (err) {
      // Le backend renvoie un message précis ("contient N produits"...) —
      // on l'affiche tel quel plutôt qu'un message générique.
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Suppression impossible';
      alert(message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Catégories</h1>

      <form
        onSubmit={handleCreate}
        className="flex flex-col sm:flex-row gap-3 mb-8 bg-white border border-slate-200 rounded-xl p-4"
      >
        <input
          type="text"
          placeholder="Nom de la catégorie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="">Catégorie racine</option>
          {options.map(({ category, depth }) => (
            <option key={category._id} value={category._id}>
              {'—'.repeat(depth)} {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isCreating}
          className="bg-teal-700 text-white rounded-lg px-4 py-2 font-medium hover:bg-teal-800 disabled:opacity-50"
        >
          Ajouter
        </button>
      </form>
      {createFailed && (
        <p className="text-sm text-red-600 -mt-6 mb-6">
          Impossible de créer cette catégorie.
        </p>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <ul className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {options.map(({ category, depth }) => (
            <li
              key={category._id}
              className="flex items-center justify-between px-4 py-3"
              style={{ paddingLeft: 16 + depth * 20 }}
            >
              <span className="text-slate-800">
                {depth > 0 && '— '}
                {category.name}
                <span className="text-xs text-slate-400 ml-2">/{category.slug}</span>
              </span>
              <button
                onClick={() => handleDelete(category._id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
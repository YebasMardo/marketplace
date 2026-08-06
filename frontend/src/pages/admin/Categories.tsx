import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../features/categories/categoriesApi';
import { flattenCategoryTree } from '../../features/categories/categoryTree';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Spinner } from '../../components/ui/Spinner';
import { categorySchema, type CategoryFormValues } from '../../lib/schemas';
import { getErrorMessage } from '../../lib/errorUtils';
import type { Category } from '../../types/api';

const emptyForm: CategoryFormValues = { name: '', parentId: '', imageUrl: null };

export function Categories() {
  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating, error: createError }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating, error: updateError }] =
    useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyForm,
  });

  const options = categories ? flattenCategoryTree(categories) : [];
  // Une catégorie ne peut pas devenir son propre parent — on la retire donc
  // des options du select pendant qu'on l'édite.
  const parentOptions = options.filter(({ category }) => category._id !== editingId);
  const imageUrl = watch('imageUrl');

  const startEdit = (category: Category) => {
    setEditingId(category._id);
    reset({
      name: category.name,
      parentId: category.parentId ?? '',
      imageUrl: category.imageUrl ?? null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset(emptyForm);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = { ...values, parentId: values.parentId || undefined };
    try {
      if (editingId) {
        await updateCategory({ id: editingId, ...payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }
      cancelEdit();
    } catch {
      // Le message d'erreur ci-dessous (createError/updateError) gère déjà l'affichage.
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
      if (editingId === id) cancelEdit();
    } catch (err) {
      // Le backend renvoie un message précis ("contient N produits"...) —
      // on l'affiche tel quel plutôt qu'un message générique.
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Suppression impossible';
      alert(message);
    }
  };

  const formError = editingId ? updateError : createError;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl text-ink mb-6">Catégories</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 mb-8 bg-paper-raised border border-line rounded-xl p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Nom de la catégorie"
              {...register('name')}
              className="w-full rounded-lg border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink transition-shadow"
            />
            {errors.name && (
              <p className="text-sm text-clay mt-1">{errors.name.message}</p>
            )}
          </div>
          <select
            {...register('parentId')}
            className="rounded-lg border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink transition-shadow"
          >
            <option value="">Catégorie racine</option>
            {parentOptions.map(({ category, depth }) => (
              <option key={category._id} value={category._id}>
                {'—'.repeat(depth)} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">Image</label>
          <ImageUploader
            images={imageUrl ? [imageUrl] : []}
            onChange={(next) => setValue('imageUrl', next[next.length - 1] ?? null)}
            folder="categories"
          />
        </div>

        <div className="flex gap-4 items-center">
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="bg-ink text-paper rounded-full px-4 py-2 text-sm font-medium hover:bg-ink-hover disabled:opacity-50 transition-colors active:scale-95"
          >
            {editingId ? 'Enregistrer' : 'Ajouter'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-ink-soft hover:text-ink transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
      {formError && (
        <p className="text-sm text-clay -mt-4 mb-6">{getErrorMessage(formError)}</p>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <ul className="divide-y divide-line bg-paper-raised border border-line rounded-xl overflow-hidden">
          {options.map(({ category, depth }) => (
            <li
              key={category._id}
              className="flex items-center justify-between px-4 py-3"
              style={{ paddingLeft: 16 + depth * 20 }}
            >
              <span className="flex items-center gap-3 text-ink">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt=""
                    className="w-8 h-8 rounded object-cover border border-line"
                  />
                ) : (
                  <span className="w-8 h-8 rounded bg-paper border border-line" />
                )}
                <span>
                  {depth > 0 && '— '}
                  {category.name}
                  <span className="text-xs text-ink-faint ml-2">/{category.slug}</span>
                </span>
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => startEdit(category)}
                  className="text-sm text-ink-soft hover:text-ink transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="text-sm text-clay hover:text-clay-dark transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

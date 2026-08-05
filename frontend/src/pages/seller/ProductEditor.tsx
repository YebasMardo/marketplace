import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { productSchema, type ProductFormValues } from '../../lib/schemas';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetProductQuery,
} from '../../features/products/productsApi';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import { flattenCategoryTree } from '../../features/categories/categoryTree';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Spinner } from '../../components/ui/Spinner';

export function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: existing, isLoading: isLoadingExisting } = useGetProductQuery(
    id!,
    { skip: !isEditing },
  );
  const { data: categories } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const categoryOptions = categories ? flattenCategoryTree(categories) : [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { type: 'physical', images: [] } as any,
    // "values" (pas "defaultValues") : pattern recommandé par RHF quand les
    // données initiales arrivent de façon asynchrone (ici via la query).
    values: existing
      ? ({
          type: existing.type,
          categoryId:
            typeof existing.categoryId === 'object'
              ? existing.categoryId._id
              : existing.categoryId,
          title: existing.title,
          description: existing.description,
          price: existing.price,
          promoPrice: existing.promoPrice,
          images: existing.images,
          ...(existing.type === 'physical'
            ? {
                stock: existing.stock,
                weightGrams: existing.weightGrams,
                shippingOptions: existing.shippingOptions,
              }
            : {
                fileKey: existing.fileKey,
                downloadLimit: existing.downloadLimit,
              }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
      : undefined,
  });

  const type = watch('type');
  const images = watch('images') ?? [];

  // Les erreurs par champ conditionnel (stock, fileKey...) sont pénibles à
  // typer strictement contre une union discriminée — on relâche le typage
  // ici uniquement pour l'affichage des messages, Zod continue de valider
  // strictement au submit.
  const fieldErrors = errors as Record<string, { message?: string } | undefined>;

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (isEditing) {
        await updateProduct({ id: id!, ...values }).unwrap();
      } else {
        await createProduct(values).unwrap();
      }
      navigate('/seller/products');
    } catch {
      alert('Une erreur est survenue — vérifiez les champs.');
    }
  };

  if (isEditing && isLoadingExisting) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 bg-white border border-slate-200 rounded-xl p-6"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Type de produit
          </label>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 cursor-pointer has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
              <input type="radio" value="physical" {...register('type')} className="accent-teal-700" />
              Physique
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 cursor-pointer has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
              <input type="radio" value="digital" {...register('type')} className="accent-teal-700" />
              Numérique
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
          <input
            {...register('title')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          {fieldErrors.title && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
          <select
            {...register('categoryId')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="">Choisir...</option>
            {categoryOptions.map(({ category, depth }) => (
              <option key={category._id} value={category._id}>
                {'—'.repeat(depth)} {category.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.categoryId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prix</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            {fieldErrors.price && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.price.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prix promo (optionnel)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('promoPrice', { valueAsNumber: true })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {type === 'physical' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
              <input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              {fieldErrors.stock && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.stock.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Poids (grammes)
              </label>
              <input
                type="number"
                {...register('weightGrams', { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
        )}

        {type === 'digital' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Référence du fichier
              </label>
              <input
                {...register('fileKey')}
                placeholder="URL Cloudinary du fichier à livrer"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              {fieldErrors.fileKey && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.fileKey.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Limite de téléchargements
              </label>
              <input
                type="number"
                {...register('downloadLimit', { valueAsNumber: true })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Images</label>
          <ImageUploader images={images} onChange={(next) => setValue('images', next)} />
        </div>

        <button
          type="submit"
          disabled={isCreating || isUpdating}
          className="w-full bg-teal-700 text-white rounded-lg py-2.5 font-medium hover:bg-teal-800 disabled:opacity-50"
        >
          {isEditing ? 'Enregistrer' : 'Créer le produit'}
        </button>
      </form>
    </div>
  );
}
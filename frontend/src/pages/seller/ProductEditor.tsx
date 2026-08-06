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

  const inputClass =
    'w-full rounded-lg border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink transition-shadow';
  const labelClass = 'block text-sm font-medium text-ink-soft mb-1';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl text-ink mb-6">
        {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 bg-paper-raised border border-line rounded-xl p-6"
      >
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            Type de produit
          </label>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 border border-line rounded-lg py-2 text-sm text-ink-soft cursor-pointer transition-colors has-[:checked]:border-clay has-[:checked]:bg-clay-soft has-[:checked]:text-clay-dark">
              <input type="radio" value="physical" {...register('type')} className="accent-clay" />
              Physique
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 border border-line rounded-lg py-2 text-sm text-ink-soft cursor-pointer transition-colors has-[:checked]:border-clay has-[:checked]:bg-clay-soft has-[:checked]:text-clay-dark">
              <input type="radio" value="digital" {...register('type')} className="accent-clay" />
              Numérique
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>Titre</label>
          <input {...register('title')} className={inputClass} />
          {fieldErrors.title && (
            <p className="text-sm text-clay mt-1">{fieldErrors.title.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Catégorie</label>
          <select {...register('categoryId')} className={inputClass}>
            <option value="">Choisir...</option>
            {categoryOptions.map(({ category, depth }) => (
              <option key={category._id} value={category._id}>
                {'—'.repeat(depth)} {category.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && (
            <p className="text-sm text-clay mt-1">{fieldErrors.categoryId.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea {...register('description')} rows={4} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Prix</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className={inputClass}
            />
            {fieldErrors.price && (
              <p className="text-sm text-clay mt-1">{fieldErrors.price.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Prix promo (optionnel)</label>
            <input
              type="number"
              step="0.01"
              {...register('promoPrice', { valueAsNumber: true })}
              className={inputClass}
            />
          </div>
        </div>

        {type === 'physical' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Stock</label>
              <input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className={inputClass}
              />
              {fieldErrors.stock && (
                <p className="text-sm text-clay mt-1">{fieldErrors.stock.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Poids (grammes)</label>
              <input
                type="number"
                {...register('weightGrams', { valueAsNumber: true })}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {type === 'digital' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Référence du fichier</label>
              <input
                {...register('fileKey')}
                placeholder="URL Cloudinary du fichier à livrer"
                className={inputClass}
              />
              {fieldErrors.fileKey && (
                <p className="text-sm text-clay mt-1">{fieldErrors.fileKey.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Limite de téléchargements</label>
              <input
                type="number"
                {...register('downloadLimit', { valueAsNumber: true })}
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">Images</label>
          <ImageUploader images={images} onChange={(next) => setValue('images', next)} />
        </div>

        <button
          type="submit"
          disabled={isCreating || isUpdating}
          className="w-full bg-ink text-paper rounded-full py-2.5 font-medium hover:bg-ink-hover disabled:opacity-50 transition-[background-color,transform] duration-150 ease-out active:scale-[0.98]"
        >
          {isEditing ? 'Enregistrer' : 'Créer le produit'}
        </button>
      </form>
    </div>
  );
}

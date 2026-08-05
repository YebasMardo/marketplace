import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  name: z.string().optional(),
  role: z.enum(['buyer', 'seller']),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

const shippingOptionSchema = z.object({
  label: z.string().min(1),
  cost: z.number().min(0),
});

const commonProductFields = {
  categoryId: z.string().min(1, 'Catégorie requise'),
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  price: z.number().min(0),
  // ≥0 et < price est vérifié côté backend (§7 nº6) ; on pourrait dupliquer
  // la règle ici avec .superRefine, mais le formulaire n'a qu'à laisser
  // passer et laisser le 400 backend faire foi pour ce cas limite.
  promoPrice: z.number().min(0).optional(),
  images: z.array(z.string().url()).optional(),
};

// Miroir exact de CreateProductDto + @ValidateIf() côté backend : le champ
// discriminant 'type' détermine quel jeu de champs est exigé.
export const productSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('physical'),
    stock: z.number().int().min(0),
    weightGrams: z.number().int().min(0),
    shippingOptions: z.array(shippingOptionSchema).optional(),
    ...commonProductFields,
  }),
  z.object({
    type: z.literal('digital'),
    fileKey: z.string().min(1),
    downloadLimit: z.number().int().min(1),
    ...commonProductFields,
  }),
]);
export type ProductFormValues = z.infer<typeof productSchema>;
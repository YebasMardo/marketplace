export type Role = 'admin' | 'seller' | 'buyer';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl?: string | null;
}

export type ProductStatus = 'draft' | 'active' | 'suspended';
export type ProductType = 'physical' | 'digital';

export interface ShippingOption {
  label: string;
  cost: number;
}

// sellerId/categoryId sont peuplés (objet) sur les routes d'affichage,
// bruts (string) sur les routes internes — voir l'encadré §7 nº8 du
// dossier technique ("populate casse .toString()").
export interface Product {
  _id: string;
  sellerId: string | { _id: string; name?: string };
  categoryId: string | { _id: string; name: string; slug: string };
  title: string;
  description?: string;
  price: number;
  promoPrice?: number;
  images: string[];
  status: ProductStatus;
  type: ProductType;
  stock?: number;
  weightGrams?: number;
  shippingOptions?: ShippingOption[];
  fileKey?: string;
  downloadLimit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  title: string;
  price: number; // toujours le montant réellement facturé
  originalPrice?: number; // présent uniquement si une promo s'applique
  images: string[];
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export type FulfillmentType = 'physical' | 'digital';
export type PaymentMethod = 'stripe' | 'cash';

// Deux statuts terminaux distincts pour un même concept de "commande
// aboutie" — voir §6.2. Ne jamais filtrer sur 'completed' seul.
export type OrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  buyerId: string;
  sellerId: string;
  fulfillmentType: FulfillmentType;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  status: OrderStatus;
  createdAt: string;
}
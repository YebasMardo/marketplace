import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  create(dto: CreateProductDto, sellerId: string) {
    return this.productModel.create({ ...dto, sellerId });
  }

  // Catalogue public : uniquement les produits publiés, paginés.
  async findAll(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const filter: Record<string, unknown> = { status: 'active' };
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.sellerId) filter.sellerId = query.sellerId;

    if (query.q) {
      // Regex plutôt que $text : recherche partielle ("clav" trouve
      // "clavier"), là où un index texte n'indexe que des mots entiers.
      const term = new RegExp(this.escapeRegex(query.q), 'i');
      filter.$or = [{ title: term }, { description: term }];
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'name slug')
        .populate('sellerId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Tableau de bord vendeur : tous statuts confondus, brouillons inclus.
  findAllBySeller(sellerId: string) {
    return this.productModel
      .find({ sellerId })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Version brute, sans populate — utilisée en interne par CartService et
  // OrdersService, qui lisent sellerId/categoryId comme de vrais ObjectId.
  // Un populate ici casserait `product.sellerId.toString()`.
  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Produit ${id} introuvable`);
    }
    return product;
  }

  // Version enrichie pour l'affichage d'une fiche produit.
  async findOneDetailed(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('categoryId', 'name slug')
      .populate('sellerId', 'name')
      .exec();
    if (!product) {
      throw new NotFoundException(`Produit ${id} introuvable`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto, sellerId: string) {
    const product = await this.productModel
      .findOneAndUpdate({ _id: id, sellerId }, dto, { new: true })
      .exec();
    if (!product) {
      throw new NotFoundException(
        `Produit ${id} introuvable, ou vous n'en êtes pas le vendeur`,
      );
    }
    return product;
  }

  // Publier / dépublier — action métier distincte d'une simple édition.
  async setStatus(id: string, status: 'draft' | 'active', sellerId: string) {
    const product = await this.productModel
      .findOneAndUpdate({ _id: id, sellerId }, { status }, { new: true })
      .exec();
    if (!product) {
      throw new NotFoundException(
        `Produit ${id} introuvable, ou vous n'en êtes pas le vendeur`,
      );
    }
    return product;
  }

  async remove(id: string, sellerId: string) {
    const result = await this.productModel
      .deleteOne({ _id: id, sellerId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Produit ${id} introuvable, ou vous n'en êtes pas le vendeur`,
      );
    }
  }

  // Décrément atomique : la condition stock >= quantity fait partie du
  // filtre, donc deux commandes simultanées ne peuvent pas passer sous
  // zéro — la seconde ne matchera aucun document.
  // Renvoie false si le stock est insuffisant.
  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    const result = await this.productModel
      .updateOne(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
      )
      .exec();
    return result.modifiedCount === 1;
  }

  async restoreStock(productId: string, quantity: number): Promise<void> {
    await this.productModel
      .updateOne({ _id: productId }, { $inc: { stock: quantity } })
      .exec();
  }

  // Neutralise les métacaractères pour qu'une recherche du type "c++"
  // ne soit pas interprétée comme une expression régulière.
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Utilisé par CategoriesService avant une suppression de catégorie.
  countByCategory(categoryId: string): Promise<number> {
    return this.productModel.countDocuments({ categoryId }).exec();
  }
}

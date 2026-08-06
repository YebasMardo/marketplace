import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    // Le modèle Category est injecté directement, sans passer par
    // CategoriesService : ce dernier dépend déjà de ProductsService
    // (countByCategory avant suppression), l'inverse créerait un cycle.
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  create(dto: CreateProductDto, sellerId: string) {
    return this.productModel.create({ ...dto, sellerId });
  }

  // Catalogue public : uniquement les produits publiés, paginés.
  async findAll(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const filter: Record<string, unknown> = { status: 'active' };
    if (query.categoryId) {
      // Une catégorie parente doit remonter le contenu de ses sous-catégories :
      // cliquer sur « Informatique » sans voir les produits rangés sous
      // « Claviers » donnerait un rayon vide sans raison apparente.
      filter.categoryId = {
        $in: await this.collectCategoryBranch(query.categoryId),
      };
    }
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

  // Renvoie l'id de la catégorie demandée suivi de ceux de toute sa
  // descendance, à n'importe quelle profondeur.
  //
  // L'arbre est parcouru en mémoire à partir d'un seul `find` : une taxonomie
  // de marketplace compte quelques dizaines d'entrées, et cette approche reste
  // insensible au type sous lequel les références sont stockées — un
  // $graphLookup, lui, ne relierait pas un `_id` ObjectId à un `parentId`
  // chaîne (voir la remarque sur les champs Mixed plus bas).
  private async collectCategoryBranch(
    categoryId: string,
  ): Promise<(string | Types.ObjectId)[]> {
    const categories = await this.categoryModel
      .find({}, { _id: 1, parentId: 1 })
      .lean()
      .exec();

    const childrenOf = new Map<string, string[]>();
    for (const category of categories) {
      if (!category.parentId) continue; // racine
      const parentId = String(category.parentId);
      const siblings = childrenOf.get(parentId) ?? [];
      siblings.push(String(category._id));
      childrenOf.set(parentId, siblings);
    }

    // Parcours en largeur. `seen` sert de garde-fou : un arbre malformé
    // (A parent de B, B parent de A) boucherait sinon la requête à l'infini.
    const branch = [categoryId];
    const seen = new Set(branch);
    for (let i = 0; i < branch.length; i++) {
      for (const childId of childrenOf.get(branch[i]) ?? []) {
        if (seen.has(childId)) continue;
        seen.add(childId);
        branch.push(childId);
      }
    }

    // Chaque id est comparé sous ses deux formes. Les références sont
    // aujourd'hui stockées en chaîne : `@Prop({ type: Types.ObjectId })` n'est
    // plus reconnu par Mongoose 9, qui traite ces champs comme du Mixed et ne
    // convertit donc rien. Interroger les deux formes garde ce filtre correct
    // avant comme après la correction des schémas.
    return branch.flatMap((id) =>
      Types.ObjectId.isValid(id) ? [id, new Types.ObjectId(id)] : [id],
    );
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

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      await this.findOne(dto.parentId); // throws NotFoundException if it doesn't exist
    }
    const slug = this.slugify(dto.name);
    return this.categoryModel.create({ ...dto, slug });
  }

  findAll() {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Catégorie ${id} introuvable`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException(
          'Une catégorie ne peut pas être son propre parent',
        );
      }
      await this.findOne(dto.parentId); // throws NotFoundException if it doesn't exist
    }

    const update: Partial<Category> = {
      ...dto,
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : undefined,
    };
    if (dto.name) {
      update.slug = this.slugify(dto.name);
    }
    const category = await this.categoryModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!category) {
      throw new NotFoundException(`Catégorie ${id} introuvable`);
    }
    return category;
  }

  // Suppression refusée tant que la catégorie est référencée : sans ces
  // gardes, sous-catégories et produits se retrouveraient orphelins,
  // pointant vers un ObjectId qui n'existe plus.
  async remove(id: string) {
    await this.findOne(id); // 404 si elle n'existe pas

    const childCount = await this.categoryModel
      .countDocuments({ parentId: id })
      .exec();
    if (childCount > 0) {
      throw new BadRequestException(
        `Cette catégorie contient ${childCount} sous-catégorie(s) — supprimez-les d'abord`,
      );
    }

    const productCount = await this.productsService.countByCategory(id);
    if (productCount > 0) {
      throw new BadRequestException(
        `Cette catégorie contient ${productCount} produit(s) — déplacez-les d'abord`,
      );
    }

    await this.categoryModel.deleteOne({ _id: id }).exec();
  }

  // Simple, dependency-free slugify: lowercase, strip accents, replace
  // anything that isn't a-z/0-9 with a hyphen. Good enough for MVP —
  // swap in the `slugify` npm package later if you need edge cases covered.
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip accents (é -> e, etc.)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
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

  async remove(id: string) {
    const result = await this.categoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Catégorie ${id} introuvable`);
    }
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
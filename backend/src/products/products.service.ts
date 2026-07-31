import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  create(dto: CreateProductDto, sellerId: string) {
    return this.productModel.create({ ...dto, sellerId });
  }

  findAll(filters: { categoryId?: string; sellerId?: string } = {}) {
    const query: Record<string, unknown> = { status: 'active' };
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.sellerId) query.sellerId = filters.sellerId;
    return this.productModel.find(query).exec();
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
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
}
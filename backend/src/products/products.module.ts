import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Category,
  CategorySchema,
} from '../categories/schemas/category.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      // Modèle seul, pas CategoriesModule : filtrer sur une branche de l'arbre
      // demande de lire les catégories, mais importer le module créerait un
      // cycle avec CategoriesModule qui importe déjà ProductsModule.
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

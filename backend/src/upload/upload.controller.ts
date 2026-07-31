import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // Test endpoint — POST /upload/image with a multipart form field named "image".
  // Later, your ProductsService will call uploadService.uploadImage() directly
  // instead of exposing a standalone public endpoint like this one.
  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }
    const url = await this.uploadService.uploadImage(file);
    return { url };
  }
}
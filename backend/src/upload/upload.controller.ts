import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_MIME = /^image\/(jpeg|png|webp)$/;

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // POST /upload/image — champ multipart nommé "image".
  // Réservé aux vendeurs : sans garde, n'importe qui pourrait remplir
  // le compte Cloudinary avec des fichiers arbitraires.
  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: MAX_IMAGE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.test(file.mimetype)) {
          // Passer une erreur (plutôt que cb(null, false)) donne un 400
          // explicite au lieu d'un silencieux "aucun fichier reçu".
          return cb(
            new BadRequestException(
              'Format non supporté — seuls JPEG, PNG et WebP sont acceptés',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }
    const url = await this.uploadService.uploadImage(file);
    return { url };
  }
}

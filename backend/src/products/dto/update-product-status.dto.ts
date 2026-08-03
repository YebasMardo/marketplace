import { IsEnum } from 'class-validator';

// 'suspended' est volontairement absent : c'est un statut de modération,
// il n'appartient pas au vendeur de se suspendre ou de se réactiver.
export class UpdateProductStatusDto {
  @IsEnum(['draft', 'active'])
  status: 'draft' | 'active';
}

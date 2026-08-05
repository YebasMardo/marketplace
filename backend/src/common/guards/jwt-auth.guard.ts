import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard('jwt') automatically uses JwtStrategy under the hood.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

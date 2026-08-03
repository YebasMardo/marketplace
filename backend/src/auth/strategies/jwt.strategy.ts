import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';

export interface JwtPayload {
  sub: string;
  role: 'admin' | 'seller' | 'buyer';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  // Whatever this returns becomes req.user in every guarded route.
  async validate(req: Request, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const blacklisted =
      token && (await this.redisService.get(`auth:blacklist:${token}`));
    if (blacklisted) {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
    }

    return { userId: payload.sub, role: payload.role };
  }
}
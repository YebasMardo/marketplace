import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role ?? 'buyer',
    });

    // Le compte est déjà créé : un email de bienvenue en échec ne doit pas
    // faire échouer l'inscription, sinon l'utilisateur voit une erreur alors
    // que son compte existe — et ne peut plus se réinscrire (409).
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
    } catch (err) {
      this.logger.warn(
        `Email de bienvenue non envoyé à ${user.email}`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    return this.signToken(user._id.toString(), user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return this.signToken(user._id.toString(), user.role);
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async logout(token: string) {
    const decoded = this.jwtService.decode(token);
    const ttlSeconds = decoded?.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 0;

    if (ttlSeconds > 0) {
      await this.redisService.set(`auth:blacklist:${token}`, '1', ttlSeconds);
    }

    return { message: 'Déconnecté avec succès' };
  }

  private signToken(sub: string, role: string) {
    return { access_token: this.jwtService.sign({ sub, role }) };
  }
}

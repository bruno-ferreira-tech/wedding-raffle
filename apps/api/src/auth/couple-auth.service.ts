import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { users } from '../db/schema';
import {
  createCoupleSession,
  hashPassword,
  verifyPassword,
} from './couple-session';

export type CoupleUserDto = {
  id: number;
  name: string;
  email: string;
  role: string;
};

@Injectable()
export class CoupleAuthService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async register(input: {
    name?: string;
    email?: string;
    password?: string;
  }): Promise<{ token: string; user: CoupleUserDto }> {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!name || !email || !password || password.length < 6) {
      throw new BadRequestException(
        'Nome, e-mail e senha (mínimo 6 caracteres) são obrigatórios.',
      );
    }

    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    const passwordHash = hashPassword(password);

    const [created] = await this.db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: 'couple',
      })
      .returning();

    const token = createCoupleSession(created.id, created.email);

    return {
      token,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
      },
    };
  }

  async login(input: {
    email?: string;
    password?: string;
  }): Promise<{ token: string; user: CoupleUserDto }> {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      throw new BadRequestException('E-mail e senha são obrigatórios.');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const token = createCoupleSession(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: number): Promise<CoupleUserDto> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

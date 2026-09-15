import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Response } from 'express';
import {
  COUPLE_SESSION_COOKIE,
} from './couple-session';
import { CoupleAuthService, type CoupleUserDto } from './couple-auth.service';
import { CoupleGuard, type AuthenticatedCoupleRequest } from './couple.guard';
import {
  SESSION_COOKIE_NAME,
  createSessionCookie,
  sessionCookieOptions,
  type SessionRole,
} from './session';

type LoginBody = {
  password?: string;
};

type CoupleRegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

type CoupleLoginBody = {
  email?: string;
  password?: string;
};

function requireEnvPassword(name: 'PADRINHO_PASSWORD' | 'ADMIN_PASSWORD'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function passwordsMatch(provided: string | undefined, expected: string): boolean {
  if (typeof provided !== 'string') {
    return false;
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

@Controller('auth')
export class AuthController {
  constructor(private readonly coupleAuth: CoupleAuthService) {}

  @Post('register')
  async registerCouple(
    @Body() body: CoupleRegisterBody,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true; user: CoupleUserDto }> {
    const result = await this.coupleAuth.register(body);
    res.cookie(COUPLE_SESSION_COOKIE, result.token, sessionCookieOptions());
    return { ok: true, user: result.user };
  }

  @Post('login')
  async loginCouple(
    @Body() body: CoupleLoginBody,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true; user: CoupleUserDto }> {
    const result = await this.coupleAuth.login(body);
    res.cookie(COUPLE_SESSION_COOKIE, result.token, sessionCookieOptions());
    return { ok: true, user: result.user };
  }

  @Get('me')
  @UseGuards(CoupleGuard)
  async getMe(@Req() req: AuthenticatedCoupleRequest): Promise<{ ok: true; user: CoupleUserDto }> {
    const user = await this.coupleAuth.getProfile(req.user.userId);
    return { ok: true, user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { ok: true } {
    res.clearCookie(COUPLE_SESSION_COOKIE, { path: '/' });
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return { ok: true };
  }

  @Post('padrinho')
  loginPadrinho(
    @Body() body: LoginBody,
    @Res({ passthrough: true }) res: Response,
  ): { ok: true } {
    return this.login(body, 'padrinho', requireEnvPassword('PADRINHO_PASSWORD'), res);
  }

  @Post('admin')
  loginAdmin(
    @Body() body: LoginBody,
    @Res({ passthrough: true }) res: Response,
  ): { ok: true } {
    return this.login(body, 'admin', requireEnvPassword('ADMIN_PASSWORD'), res);
  }

  private login(
    body: LoginBody,
    role: SessionRole,
    expectedPassword: string,
    res: Response,
  ): { ok: true } {
    if (!passwordsMatch(body.password, expectedPassword)) {
      throw new UnauthorizedException();
    }

    res.cookie(SESSION_COOKIE_NAME, createSessionCookie(role), sessionCookieOptions());
    return { ok: true };
  }
}

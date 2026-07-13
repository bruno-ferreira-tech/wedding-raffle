import {
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Response } from 'express';
import {
  SESSION_COOKIE_NAME,
  createSessionCookie,
  sessionCookieOptions,
  type SessionRole,
} from './session';

type LoginBody = {
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

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { COUPLE_SESSION_COOKIE, verifyCoupleSession } from './couple-session';

export type AuthenticatedCoupleRequest = Request & {
  user: {
    userId: number;
    email: string;
  };
};

@Injectable()
export class CoupleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const cookies = req.cookies as Record<string, string | undefined> | undefined;
    const cookieToken = cookies?.[COUPLE_SESSION_COOKIE];

    let token = cookieToken;
    const authHeader = req.headers.authorization;
    if (!token && authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    const session = verifyCoupleSession(token);
    if (!session) {
      throw new UnauthorizedException('Acesso restrito aos noivos');
    }

    (req as AuthenticatedCoupleRequest).user = session;
    return true;
  }
}

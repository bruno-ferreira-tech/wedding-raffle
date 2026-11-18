import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SESSION_COOKIE_NAME, verifySessionCookie } from './session';

@Injectable()
export class PadrinhoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const role = verifySessionCookie(request.cookies?.[SESSION_COOKIE_NAME]);
    if (role !== 'padrinho' && role !== 'admin') {
      throw new UnauthorizedException();
    }
    return true;
  }
}

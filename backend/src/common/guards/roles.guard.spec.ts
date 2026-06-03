import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

/**
 * Helper: monta um ExecutionContext fake que devolve `user` em
 * request.user. Suficiente porque RolesGuard so usa
 * context.switchToHttp().getRequest().user.
 */
function ctxWithUser(user: unknown): ExecutionContext {
  const req = { user };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('libera quando o decorator @Roles nao definiu papeis', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(ctxWithUser({ id: 'u1', role: 'ADOPTER' }))).toBe(true);
  });

  it('libera quando @Roles foi declarado mas sem nenhum papel', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([] as UserRole[]);
    expect(guard.canActivate(ctxWithUser({ id: 'u1', role: 'ADOPTER' }))).toBe(true);
  });

  it('bloqueia quando nao existe user no request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN'] as UserRole[]);
    expect(guard.canActivate(ctxWithUser(undefined))).toBe(false);
  });

  it('bloqueia quando user existe mas nao tem role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN'] as UserRole[]);
    expect(guard.canActivate(ctxWithUser({ id: 'u1' }))).toBe(false);
  });

  it('bloqueia quando o papel do user nao esta entre os requeridos', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN'] as UserRole[]);
    expect(guard.canActivate(ctxWithUser({ id: 'u1', role: 'ADOPTER' }))).toBe(false);
  });

  it('libera quando o papel do user esta entre os requeridos', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['ADMIN', 'ONG_ADMIN'] as UserRole[]);
    expect(guard.canActivate(ctxWithUser({ id: 'u1', role: 'ONG_ADMIN' }))).toBe(true);
  });
});

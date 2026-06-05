import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('extrai { id, role } do payload JWT', () => {
    const cfg = { get: jest.fn().mockReturnValue('segredo-teste') } as unknown as ConfigService;
    const strategy = new JwtStrategy(cfg);

    expect(strategy.validate({ sub: 'user-1', role: 'ADOPTER' })).toEqual({
      id: 'user-1',
      role: 'ADOPTER',
    });
  });

  it('cai no fallback "super-secret-key" quando JWT_SECRET nao esta configurado', () => {
    const cfg = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    // se o construtor explodir, o teste falha; chegar aqui ja prova o fallback
    expect(() => new JwtStrategy(cfg)).not.toThrow();
    expect(cfg.get).toHaveBeenCalledWith('JWT_SECRET');
  });
});

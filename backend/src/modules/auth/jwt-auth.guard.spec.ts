import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
    it('deve ser definido', () => {
        // Como ele apenas estende o AuthGuard do NestJS,
        // garantir que ele é instanciável já conta como cobertura.
        expect(new JwtAuthGuard()).toBeDefined();
    });
});
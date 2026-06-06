import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [UsersModule, PrismaModule, JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '1d' } })],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
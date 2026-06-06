import { Module } from '@nestjs/common';
import { AdoptionsService } from './adoptions.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [AdoptionsService],
    exports: [AdoptionsService],
})
export class AdoptionsModule {}
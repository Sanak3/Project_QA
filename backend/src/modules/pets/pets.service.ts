import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PetsService {
    constructor(private prisma: PrismaService) {}

    async create(data: any, userId: string) {
        return this.prisma.pet.create({
            data: { ...data, registeredById: userId },
        });
    }

    async findAll(filters: any = {}) {
        const where: any = {};

        if (filters && filters.species) {
            const allowed = ['DOG', 'CAT', 'OTHER'];
            const species = String(filters.species).toUpperCase();
            if (!allowed.includes(species)) {
                throw new BadRequestException('Invalid "species" filter. Accepted values: DOG, CAT, OTHER');
            }
            where.species = species;
        }

        return this.prisma.pet.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async findOne(id: string) {
        const pet = await this.prisma.pet.findUnique({ where: { id } });
        if (!pet) throw new NotFoundException(`Pet with id "${id}" was not found.`);
        return pet;
    }

    async update(id: string, data: any, userId: string) {
        const pet = await this.findOne(id);
        if (pet.registeredById !== userId) {
            throw new ForbiddenException('Voce nao tem permissao para alterar este pet.');
        }
        return this.prisma.pet.update({ where: { id }, data });
    }

    async remove(id: string, userId: string) {
        const pet = await this.findOne(id);
        if (pet.registeredById !== userId) {
            throw new ForbiddenException('Voce nao tem permissao para alterar este pet.');
        }
        return this.prisma.pet.delete({ where: { id } });
    }

    async uploadPhoto(id: string, userId: string, photoUrl: string) {
        const pet = await this.findOne(id);
        if (pet.registeredById !== userId) {
            throw new ForbiddenException('Voce nao tem permissao para alterar este pet.');
        }
        return this.prisma.pet.update({ where: { id }, data: { photoUrl } }); //tmnc com essa merda viu
    }
}
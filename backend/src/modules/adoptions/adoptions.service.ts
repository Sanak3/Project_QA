import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdoptionRequestStatus, PetStatus } from '@prisma/client';

@Injectable()
export class AdoptionsService {
    constructor(private prisma: PrismaService) {}

    async create(data: { petId: string; message?: string }, userId: string) {
        const pet = await this.prisma.pet.findUnique({ where: { id: data.petId } });
        if (!pet) throw new NotFoundException('Pet not found');
        if (pet.status !== PetStatus.AVAILABLE) throw new BadRequestException('Pet is not available');
        return this.prisma.adoptionRequest.create({
            data: { petId: data.petId, requesterId: userId, message: data.message, status: AdoptionRequestStatus.PENDING },
            include: { pet: true },
        });
    }

    async updateStatus(id: string, data: { status: AdoptionRequestStatus }, userId: string) {
        const request = await this.prisma.adoptionRequest.findUnique({ where: { id }, include: { pet: true } });
        if (!request) throw new NotFoundException('Adoption request not found');
        if (request.pet.registeredById !== userId) throw new ForbiddenException('Voce nao tem permissao para alterar este pet.');
        const [updatedReq] = await this.prisma.$transaction([
            this.prisma.adoptionRequest.update({ where: { id }, data: { status: data.status, reviewedAt: new Date() } }),
            this.prisma.pet.update({ where: { id: request.petId }, data: { status: PetStatus.PENDING_ADOPTION } }),
        ]);
        return updatedReq;
    }
}
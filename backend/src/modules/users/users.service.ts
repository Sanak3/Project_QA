import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async create(data: any) {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            return await this.prisma.user.create({ data: { ...data, password: hashedPassword } });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('Email is already in use.');
            throw error;
        }
    }

    async findAll() { return this.prisma.user.findMany({ select: { id: true, fullName: true, email: true, role: true, isActive: true } }); }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, fullName: true, email: true, role: true, isActive: true } });
        if (!user) throw new NotFoundException(`User with id "${id}" was not found.`);
        return user;
    }

    async update(id: string, data: any) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException(`User with id "${id}" was not found.`);
        let updateData = { ...data };
        if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
        try { return await this.prisma.user.update({ where: { id }, data: updateData }); }
        catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('Email is already in use.');
            throw error;
        }
    }

    async remove(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException(`User with id "${id}" was not found.`);
        return this.prisma.user.delete({ where: { id } });
    }

    async findByEmailForAuth(email: string) {
        return this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    }
}
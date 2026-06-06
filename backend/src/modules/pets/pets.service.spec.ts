import { Test, TestingModule } from '@nestjs/testing';
import { PetsService } from './pets.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('PetsService', () => {
  let service: PetsService;
  let prisma: PrismaService;

  const prismaMock = {
    pet: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um pet', async () => {
    prismaMock.pet.create.mockResolvedValue({ id: '1' });
    const result = await service.create({ name: 'Rex' }, 'user-1');
    expect(result).toEqual({ id: '1' });
    expect(prismaMock.pet.create).toHaveBeenCalled();
  });

  it('deve listar todos os pets sem filtro', async () => {
    prismaMock.pet.findMany.mockResolvedValue([]);
    await service.findAll({});
    expect(prismaMock.pet.findMany).toHaveBeenCalledWith({ where: {}, orderBy: { createdAt: 'desc' } });
  });

  it('deve listar pets filtrando por especie valida', async () => {
    prismaMock.pet.findMany.mockResolvedValue([]);
    await service.findAll({ species: 'dog' });
    expect(prismaMock.pet.findMany).toHaveBeenCalledWith({ where: { species: 'DOG' }, orderBy: { createdAt: 'desc' } });
  });

  it('deve lancar erro ao filtrar por especie invalida', async () => {
    await expect(service.findAll({ species: 'hamster' })).rejects.toThrow(BadRequestException);
  });

  it('deve buscar um pet unico', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({ id: '1' });
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1' });
  });

  it('deve lancar erro se nao encontrar o pet no findOne', async () => {
    prismaMock.pet.findUnique.mockResolvedValue(null);
    await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar um pet se for o dono', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({ id: '1', registeredById: 'user-1' });
    prismaMock.pet.update.mockResolvedValue({ id: '1' });
    const result = await service.update('1', { name: 'Rex' }, 'user-1');
    expect(result).toEqual({ id: '1' });
  });

  it('deve lancar erro ao atualizar pet se nao for o dono', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({ id: '1', registeredById: 'user-2' });
    await expect(service.update('1', { name: 'Rex' }, 'user-1')).rejects.toThrow(ForbiddenException);
  });

  it('deve remover um pet se for o dono', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({ id: '1', registeredById: 'user-1' });
    prismaMock.pet.delete.mockResolvedValue({ id: '1' });
    const result = await service.remove('1', 'user-1');
    expect(result).toEqual({ id: '1' });
  });

  it('deve lancar erro ao remover pet se nao for o dono', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({ id: '1', registeredById: 'user-2' });
    await expect(service.remove('1', 'user-1')).rejects.toThrow(ForbiddenException);
  });

  it('deve fazer upload de foto se for o dono', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({ id: '1', registeredById: 'user-1' });
    prismaMock.pet.update.mockResolvedValue({ id: '1', photoUrl: 'url' });
    const result = await service.uploadPhoto('1', 'user-1', 'url');
    expect(result).toEqual({ id: '1', photoUrl: 'url' });
  });

  it('deve lancar erro ao fazer upload se nao for o dono', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({ id: '1', registeredById: 'user-2' });
    await expect(service.uploadPhoto('1', 'user-1', 'url')).rejects.toThrow(ForbiddenException);
  });
});
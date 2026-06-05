import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PetSize, PetStatus, Sex, Species } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { PetsService } from './pets.service';

describe('PetsService', () => {
  let service: PetsService;

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
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
  });

  it('deve criar pet usando o id do usuario logado como registeredById', async () => {
    prismaMock.pet.create.mockResolvedValue({
      id: 'pet-1',
      name: 'Thor',
      registeredById: 'user-1',
    });

    await service.create(
      {
        name: 'Thor',
        species: Species.DOG,
        sex: Sex.MALE,
      },
      'user-1',
    );

    expect(prismaMock.pet.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Thor',
        species: Species.DOG,
        sex: Sex.MALE,
        registeredById: 'user-1',
      }),
    });
  });

  it('deve aplicar filtros dinamicos ao listar pets', async () => {
    prismaMock.pet.findMany.mockResolvedValue([]);

    await service.findAll({
      species: 'dog',
      size: 'small',
      sex: 'female',
      status: 'available',
      breed: ' vira-lata ',
      name: ' mel ',
      city: ' sao paulo ',
      state: ' sp ',
      organizationId: ' org-1 ',
      registeredById: ' user-1 ',
    });

    expect(prismaMock.pet.findMany).toHaveBeenCalledWith({
      where: {
        species: Species.DOG,
        size: PetSize.SMALL,
        sex: Sex.FEMALE,
        status: PetStatus.AVAILABLE,
        breed: { contains: 'vira-lata' },
        name: { contains: 'mel' },
        city: { contains: 'sao paulo' },
        state: { equals: 'SP' },
        organizationId: 'org-1',
        registeredById: 'user-1',
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('deve retornar 400 ao receber enum invalido nos filtros', () => {
    expect(() => service.findAll({ species: 'hamster' })).toThrow(
      new BadRequestException('Invalid "species" filter. Accepted values: DOG, CAT, OTHER'),
    );
    expect(prismaMock.pet.findMany).not.toHaveBeenCalled();
  });

  it('deve impedir update quando o usuario nao e dono do pet', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({
      id: 'pet-1',
      registeredById: 'user-dono',
    });

    await expect(service.update('pet-1', { name: 'Novo Nome' }, 'user-outro')).rejects.toThrow(
      new ForbiddenException('Voce nao tem permissao para alterar este pet.'),
    );

    expect(prismaMock.pet.update).not.toHaveBeenCalled();
  });

  it('deve impedir delete quando o usuario nao e dono do pet', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({
      id: 'pet-1',
      registeredById: 'user-dono',
    });

    await expect(service.remove('pet-1', 'user-outro')).rejects.toThrow(
      new ForbiddenException('Voce nao tem permissao para alterar este pet.'),
    );

    expect(prismaMock.pet.delete).not.toHaveBeenCalled();
  });

  it('deve retornar 404 ao buscar pet inexistente', async () => {
    prismaMock.pet.findUnique.mockResolvedValue(null);

    await expect(service.findOne('inexistente')).rejects.toThrow(
      new NotFoundException('Pet with id "inexistente" was not found.'),
    );
  });

  it('deve retornar 404 ao atualizar pet inexistente', async () => {
    prismaMock.pet.findUnique.mockResolvedValue(null);

    await expect(
      service.update('inexistente', { name: 'X' }, 'user-dono'),
    ).rejects.toThrow(NotFoundException);
    expect(prismaMock.pet.update).not.toHaveBeenCalled();
  });

  it('deve atualizar pet com sucesso quando o user e dono', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({
      id: 'pet-1',
      registeredById: 'user-dono',
    });
    const updated = { id: 'pet-1', name: 'Thor 2' };
    prismaMock.pet.update.mockResolvedValue(updated);

    await expect(
      service.update('pet-1', { name: 'Thor 2' }, 'user-dono'),
    ).resolves.toEqual(updated);

    expect(prismaMock.pet.update).toHaveBeenCalledWith({
      where: { id: 'pet-1' },
      data: { name: 'Thor 2' },
    });
  });

  it('deve remover pet com sucesso quando o user e dono', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({
      id: 'pet-1',
      registeredById: 'user-dono',
    });
    prismaMock.pet.delete.mockResolvedValue({ id: 'pet-1' });

    await expect(service.remove('pet-1', 'user-dono')).resolves.toEqual({
      id: 'pet-1',
    });
    expect(prismaMock.pet.delete).toHaveBeenCalledWith({ where: { id: 'pet-1' } });
  });

  it('deve aceitar uploadPhoto do dono e gravar photoUrl', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({
      id: 'pet-1',
      registeredById: 'user-dono',
    });
    prismaMock.pet.update.mockResolvedValue({ id: 'pet-1', photoUrl: '/uploads/x.jpg' });

    await expect(
      service.uploadPhoto('pet-1', 'user-dono', '/uploads/x.jpg'),
    ).resolves.toEqual(expect.objectContaining({ photoUrl: '/uploads/x.jpg' }));

    expect(prismaMock.pet.update).toHaveBeenCalledWith({
      where: { id: 'pet-1' },
      data: { photoUrl: '/uploads/x.jpg' },
    });
  });

  it('deve impedir uploadPhoto quando o user nao e dono do pet', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({
      id: 'pet-1',
      registeredById: 'user-dono',
    });

    await expect(
      service.uploadPhoto('pet-1', 'user-outro', '/uploads/x.jpg'),
    ).rejects.toThrow(ForbiddenException);
    expect(prismaMock.pet.update).not.toHaveBeenCalled();
  });
});

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  const prismaMock = {
    organization: {
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
        OrganizationsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  // ---------------------- create ----------------------

  it('deve criar uma ONG com sucesso', async () => {
    const ong = { id: 'org-1', legalName: 'Instituto Teste', email: 'ong@email.com' };
    prismaMock.organization.create.mockResolvedValue(ong);

    await expect(
      service.create({
        legalName: 'Instituto Teste',
        email: 'ong@email.com',
      }),
    ).resolves.toEqual(ong);

    expect(prismaMock.organization.create).toHaveBeenCalledWith({
      data: { legalName: 'Instituto Teste', email: 'ong@email.com' },
    });
  });

  it('deve retornar erro ao criar uma ONG com CNPJ ja existente', async () => {
    prismaMock.organization.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['cnpj'] },
      }),
    );

    await expect(
      service.create({
        legalName: 'Instituto Teste',
        email: 'ong@email.com',
        cnpj: '12345678000190',
      }),
    ).rejects.toThrow(new BadRequestException('CNPJ is already in use.'));
  });

  it('deve retornar erro ao criar uma ONG com email ja existente', async () => {
    prismaMock.organization.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      }),
    );

    await expect(
      service.create({
        legalName: 'Instituto Teste',
        email: 'ong@email.com',
      }),
    ).rejects.toThrow(new BadRequestException('Email is already in use.'));
  });

  it('deve repassar P2002 generico como BadRequest com mensagem padrao', async () => {
    prismaMock.organization.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['some_other_field'] },
      }),
    );

    await expect(
      service.create({ legalName: 'X', email: 'x@x.com' }),
    ).rejects.toThrow(new BadRequestException('Unique field already exists for organization.'));
  });

  it('deve propagar erros nao tratados ao criar ONG', async () => {
    const boom = new Error('boom');
    prismaMock.organization.create.mockRejectedValue(boom);

    await expect(
      service.create({ legalName: 'X', email: 'x@x.com' }),
    ).rejects.toThrow(boom);
  });

  // ---------------------- findAll / findOne ----------------------

  it('deve listar ONGs em ordem de criacao desc', async () => {
    prismaMock.organization.findMany.mockResolvedValue([]);

    await service.findAll();

    expect(prismaMock.organization.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });

  it('deve buscar ONG por id', async () => {
    const ong = { id: 'org-1', legalName: 'X', email: 'x@x.com' };
    prismaMock.organization.findUnique.mockResolvedValue(ong);

    await expect(service.findOne('org-1')).resolves.toEqual(ong);
    expect(prismaMock.organization.findUnique).toHaveBeenCalledWith({
      where: { id: 'org-1' },
    });
  });

  it('deve retornar 404 ao buscar ONG inexistente', async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nao-existe')).rejects.toThrow(
      new NotFoundException('Organization with id "nao-existe" was not found.'),
    );
  });

  // ---------------------- update ----------------------

  it('deve atualizar ONG existente', async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: 'org-1' });
    const updated = { id: 'org-1', legalName: 'Novo Nome' };
    prismaMock.organization.update.mockResolvedValue(updated);

    await expect(
      service.update('org-1', { legalName: 'Novo Nome' }),
    ).resolves.toEqual(updated);

    expect(prismaMock.organization.update).toHaveBeenCalledWith({
      where: { id: 'org-1' },
      data: { legalName: 'Novo Nome' },
    });
  });

  it('deve retornar 404 ao atualizar ONG inexistente', async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);

    await expect(
      service.update('nao-existe', { legalName: 'X' }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.organization.update).not.toHaveBeenCalled();
  });

  it('deve traduzir P2002 (email) ao atualizar ONG', async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: 'org-1' });
    prismaMock.organization.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      }),
    );

    await expect(
      service.update('org-1', { email: 'duplicado@x.com' }),
    ).rejects.toThrow(new BadRequestException('Email is already in use.'));
  });

  it('deve propagar erros nao P2002 ao atualizar ONG', async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: 'org-1' });
    const boom = new Error('boom');
    prismaMock.organization.update.mockRejectedValue(boom);

    await expect(
      service.update('org-1', { legalName: 'X' }),
    ).rejects.toThrow(boom);
  });

  // ---------------------- remove ----------------------

  it('deve remover ONG existente', async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: 'org-1' });
    prismaMock.organization.delete.mockResolvedValue({ id: 'org-1' });

    await expect(service.remove('org-1')).resolves.toEqual({ id: 'org-1' });
    expect(prismaMock.organization.delete).toHaveBeenCalledWith({
      where: { id: 'org-1' },
    });
  });

  it('deve retornar 404 ao remover ONG inexistente', async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);

    await expect(service.remove('nao-existe')).rejects.toThrow(
      new NotFoundException('Organization with id "nao-existe" was not found.'),
    );
    expect(prismaMock.organization.delete).not.toHaveBeenCalled();
  });
});

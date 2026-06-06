import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Species, PetSize, PetStatus, Sex } from '@prisma/client';

export class CreatePetDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(Species)
    species: Species;

    @IsEnum(Sex)
    sex: Sex;

    @IsEnum(PetSize)
    size: PetSize;

    @IsOptional()
    @IsString()
    breed?: string;
}
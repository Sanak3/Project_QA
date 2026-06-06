import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
    constructor(private readonly petsService: PetsService) {}

    @Post()
    create(@Body() data: any) { return this.petsService.create(data, 'user-1'); }

    @Get()
    findAll(@Body() filters: any) { return this.petsService.findAll(filters); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.petsService.findOne(id); }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) { return this.petsService.update(id, data, 'user-1'); }

    @Delete(':id')
    remove(@Param('id') id: string) { return this.petsService.remove(id, 'user-1'); }

    @Post(':id/photo')
    uploadPhoto(@Param('id') id: string, @Body() body: any, @Body() file: any) {
        if (!file || !file.photoUrl) {
            throw new BadRequestException('Arquivo de foto nao enviado.');
        }
        return this.petsService.uploadPhoto(id, 'user-1', file.photoUrl);
    }
}
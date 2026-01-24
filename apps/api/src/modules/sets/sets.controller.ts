import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SetsService } from './sets.service';
import { StudySet } from '@nostalgic/shared';

@Controller('sets')
export class SetsController {
  constructor(private readonly setsService: SetsService) {}

  @Get()
  findAll(): StudySet[] {
    console.log('GET /api/sets');
    return this.setsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): StudySet | undefined {
    console.log(`GET /api/sets/${id}`);
    return this.setsService.findOne(id);
  }

  @Post()
  create(@Body() payload: Omit<StudySet, 'createdAt' | 'updatedAt'>): StudySet {
    console.log('POST /api/sets', payload);
    return this.setsService.create(payload);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() payload: Omit<StudySet, 'createdAt' | 'updatedAt' | 'id'>): StudySet | null {
    console.log(`PUT /api/sets/${id}`, payload);
    return this.setsService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    console.log(`DELETE /api/sets/${id}`);
    return this.setsService.delete(id);
  }
}

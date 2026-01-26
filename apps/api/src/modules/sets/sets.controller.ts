import { Body, Controller, Delete, Get, Param, Post, Put, Req, UnauthorizedException } from '@nestjs/common';
import { SetsService } from './sets.service';
import { StudySet } from '@nostalgic/shared';
import { JwtService } from '@nestjs/jwt';

@Controller('sets')
export class SetsController {
  constructor(
    private readonly setsService: SetsService,
    private readonly jwtService: JwtService,
  ) {}

  private getAuthPayload(req: { headers?: Record<string, string | string[]> }): { sub?: string; email?: string } | null {
    const raw = req.headers?.authorization;
    const auth = Array.isArray(raw) ? raw[0] : raw;
    if (!auth) return false;
    const [type, token] = auth.split(' ');
    if (type !== 'Bearer' || !token) return false;
    try {
      return this.jwtService.verify(token) as { sub?: string; email?: string };
    } catch {
      return null;
    }
  }

  @Get()
  findAll(@Req() req: { headers?: Record<string, string | string[]> }): StudySet[] {
    console.log('GET /api/sets');
    const payload = this.getAuthPayload(req);
    return this.setsService.findAll(!payload);
  }

  @Get(':id')
  findOne(@Param('id') id: string): StudySet | undefined {
    console.log(`GET /api/sets/${id}`);
    return this.setsService.findOne(id);
  }

  @Post()
  create(@Body() payload: Omit<StudySet, 'createdAt' | 'updatedAt'>, @Req() req: { headers?: Record<string, string | string[]> }): StudySet {
    console.log('POST /api/sets', payload);
    const payloadAuth = this.getAuthPayload(req);
    if (payload.visibility === 'public' && !payloadAuth) {
      throw new UnauthorizedException('Login required to publish sets');
    }
    return this.setsService.create(payload);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() payload: Omit<StudySet, 'createdAt' | 'updatedAt' | 'id'>,
    @Req() req: { headers?: Record<string, string | string[]> },
  ): StudySet | null {
    console.log(`PUT /api/sets/${id}`, payload);
    const payloadAuth = this.getAuthPayload(req);
    if (payload.visibility === 'public' && !payloadAuth) {
      throw new UnauthorizedException('Login required to publish sets');
    }
    return this.setsService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    console.log(`DELETE /api/sets/${id}`);
    return this.setsService.delete(id);
  }
}

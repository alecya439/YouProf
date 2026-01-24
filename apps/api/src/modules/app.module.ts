import { Module } from '@nestjs/common';
import { SetsModule } from './sets/sets.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [SetsModule, AuthModule]
})
export class AppModule {}

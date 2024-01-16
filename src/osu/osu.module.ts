import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { OsuService } from './osu.service';

@Module({
  imports: [ConfigModule],
  providers: [OsuService],
  exports: [OsuService],
})
export class OsuModule {}

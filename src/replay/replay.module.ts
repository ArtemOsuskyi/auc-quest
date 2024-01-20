import { Module } from '@nestjs/common';

import { OsuModule } from '@src/osu/osu.module';
import { ReplayService } from '@src/replay/replay.service';

@Module({
  imports: [OsuModule],
  providers: [ReplayService],
  exports: [ReplayService],
})
export class ReplayModule {}

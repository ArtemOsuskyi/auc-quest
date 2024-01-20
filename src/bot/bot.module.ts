import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';

import { DiscordModule } from '@discord-nestjs/core';
import { QuestAuthorizeSubCommand } from '@src/bot/commands/quest/quest-authorize.sub-command';
import { ReplayModule } from '@src/replay/replay.module';
import { OsuModule } from '../osu/osu.module';
import { QuestCommand } from './commands/quest/quest.command';
import { QuestClaimSubCommand } from './commands/quest/quest-claim.sub-command';
import { QuestCreateSubCommand } from './commands/quest/quest-create.sub-command';
import { BotGateway } from './bot.gateway';

@Module({
  imports: [
    DiscordModule.forFeature(),
    OsuModule,
    PrismaModule,
    ReplayModule,
  ],
  providers: [
    QuestCommand,
    QuestCreateSubCommand,
    QuestClaimSubCommand,
    QuestAuthorizeSubCommand,
    BotGateway,
  ],
})
export class BotModule {}

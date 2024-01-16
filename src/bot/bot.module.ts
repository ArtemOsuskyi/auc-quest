import { Module } from '@nestjs/common';

import { DiscordModule } from '@discord-nestjs/core';
import { OsuModule } from '../osu/osu.module';
import { QuestCommand } from './commands/quest/quest.command';
import { QuestClaimSubCommand } from './commands/quest/quest-claim.sub-command';
import { QuestCreateSubCommand } from './commands/quest/quest-create.sub-command';
import { BotGateway } from './bot.gateway';

@Module({
  imports: [DiscordModule.forFeature(), OsuModule],
  providers: [
    QuestCommand,
    QuestCreateSubCommand,
    QuestClaimSubCommand,
    BotGateway,
  ],
})
export class BotModule {}

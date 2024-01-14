import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { QuestCommand } from './commands/quest/quest.command';
import { QuestCreateSubCommand } from './commands/quest/quest-create.sub-command';
import { QuestClaimSubCommand } from './commands/quest/quest-claim.sub-command';
import { BotGateway } from './bot.gateway';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    QuestCommand,
    QuestCreateSubCommand,
    QuestClaimSubCommand,
    // BotGateway,
  ],
})
export class BotModule {}

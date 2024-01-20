import { Command } from '@discord-nestjs/core';
import { QuestAuthorizeSubCommand } from '@src/bot/commands/quest/quest-authorize.sub-command';
import { QuestClaimSubCommand } from './quest-claim.sub-command';
import { QuestCreateSubCommand } from './quest-create.sub-command';

@Command({
  name: 'quest',
  description: 'Quest Command',
  include: [
    QuestCreateSubCommand,
    QuestClaimSubCommand,
    QuestAuthorizeSubCommand,
  ],
})
export class QuestCommand {}

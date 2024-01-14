import { Command } from '@discord-nestjs/core';
import { QuestCreateSubCommand } from './quest-create.sub-command';
import { QuestClaimSubCommand } from './quest-claim.sub-command';

@Command({
  name: 'quest',
  description: 'Quest Command',
  include: [QuestCreateSubCommand, QuestClaimSubCommand],
})
export class QuestCommand {}

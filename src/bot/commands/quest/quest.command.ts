import { Command } from '@discord-nestjs/core';
import { QuestClaimSubCommand } from './quest-claim.sub-command';
import { QuestCreateSubCommand } from './quest-create.sub-command';

@Command({
  name: 'quest',
  description: 'Quest Command',
  include: [QuestCreateSubCommand, QuestClaimSubCommand],
})
export class QuestCommand {}

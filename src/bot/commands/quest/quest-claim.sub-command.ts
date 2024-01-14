import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, IA, SubCommand } from '@discord-nestjs/core';
import { QuestCreateSubCommand } from './quest-create.sub-command';

@SubCommand({ name: 'claim', description: 'Claim quest' })
export class QuestClaimSubCommand {
  @Handler()
  questClaim(@IA(SlashCommandPipe) claimQuestDto: QuestCreateSubCommand) {
    console.log(claimQuestDto);
    return 'Quest claimed';
  }
}

import { Attachment } from 'discord.js';

import { Param, ParamType } from '@discord-nestjs/core';

export class ClaimQuestDto {
  @Param({
    name: 'replay',
    description: 'Replay file',
    required: true,
    type: ParamType.ATTACHMENT,
  })
  replay: Attachment;
}

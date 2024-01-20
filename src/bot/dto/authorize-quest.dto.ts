import { Param, ParamType } from '@discord-nestjs/core';

export class AuthorizeQuestDto {
  @Param({
    name: 'osu_id',
    description: 'ID of your osu account',
    required: true,
    type: ParamType.NUMBER,
  })
  osuId: number;
}

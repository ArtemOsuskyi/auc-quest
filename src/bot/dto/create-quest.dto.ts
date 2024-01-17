import { Attachment } from 'discord.js';

import { Choice, Param, ParamType } from '@discord-nestjs/core';
import { QuestDifficulty } from '../enums/quest-difficulty.enum';

export class CreateQuestDto {
  @Param({
    name: 'beatmap_id',
    description: 'osu! Beatmap ID',
    required: true,
    type: ParamType.INTEGER,
  })
  beatmap_id: number;

  @Choice(QuestDifficulty)
  @Param({
    name: 'difficulty',
    description: 'Quest difficulty',
    required: true,
    type: ParamType.STRING,
  })
  difficulty: QuestDifficulty;

  @Param({
    name: 'description',
    description:
      'Quest brief description (what skillsets a map is testing)',
    required: true,
    type: ParamType.STRING,
  })
  description: string;

  @Param({
    name: 'screenshot',
    description: 'Screenshot',
    required: true,
    type: ParamType.ATTACHMENT,
  })
  screenshot: Attachment;

  @Param({
    name: 'mods',
    description: 'Required mods for quest',
    required: false,
    type: ParamType.STRING,
  })
  mods: string;

  @Param({
    name: 'allow_hd',
    description:
      'Allows to use HD with HR/DT/EZ, if HD was not chosen',
    required: false,
    type: ParamType.BOOLEAN,
  })
  allow_hd: boolean;

  @Param({
    name: 'accuracy',
    description: 'Min accuracy',
    required: false,
    type: ParamType.INTEGER,
  })
  accuracy: number;

  @Param({
    name: 'misses',
    description: 'Max amount of misses',
    required: false,
    type: ParamType.INTEGER,
  })
  misses: number;

  @Param({
    name: 'combo',
    description: 'Min combo',
    required: false,
    type: ParamType.INTEGER,
  })
  combo: number;

  @Param({
    name: 'score_amount',
    description: 'Min ScoreV2 score amount',
    required: false,
    type: ParamType.INTEGER,
  })
  scoreAmount: number;

  @Param({
    name: 'unstable_rate',
    description: 'Max unstable rate',
    required: false,
    type: ParamType.INTEGER,
  })
  ur: number;
}

import { EmbedBuilder, Message } from 'discord.js';
import { isNil } from 'lodash';

import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, IA, MSG, SubCommand } from '@discord-nestjs/core';
import { CreateQuestDto } from '@src/bot/dto/create-quest.dto';
import { difficultyLevelsMap } from '@src/bot/enums/difficulty-levels.map';
import { OsuService } from '@src/osu/osu.service';

@SubCommand({
  name: 'create',
  description: 'Create quest',
})
export class QuestCreateSubCommand {
  private readonly questCreateRoleId = '1196916668081913887';

  constructor(private readonly osuService: OsuService) {}

  @Handler()
  public async questCreate(
    @IA(SlashCommandPipe) createQuestDto: CreateQuestDto,
    @MSG() message: Message,
  ) {
    const role = await message.guild.roles.fetch(
      this.questCreateRoleId,
    );

    if (
      !role.members.find((member) => message.member.id === member.id)
    ) {
      return {
        content: 'Ви не можете створювати квести!',
        ephemeral: true,
      };
    }

    const beatmap = await this.osuService.getMapUrl(
      createQuestDto.beatmap_id,
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (beatmap.error === null) {
      return 'Карта з введеним ID не існує або видалена!';
    }

    const difficultyEmoji = difficultyLevelsMap
      .get(createQuestDto.difficulty)
      .join(' ');

    if (this.checkConditions(createQuestDto)) {
      return 'Не надано вимог для квесту!';
    }

    const embed = new EmbedBuilder()
      .setTitle('Challenge')
      .setFields([
        {
          name: 'ПОСИЛАННЯ',
          value: beatmap.url,
        },
        {
          name: 'ВАЖКІСТЬ',
          value: `${createQuestDto.difficulty} - ${difficultyEmoji}`,
        },
        {
          name: 'ОПИС',
          value: createQuestDto.description,
        },
        {
          name: 'ВИМОГИ',
          value: this.buildQuestConditions(createQuestDto),
        },
      ])
      .setImage(createQuestDto.screenshot.url);

    return {
      embeds: [embed],
    };
  }

  private checkConditions(questDto: CreateQuestDto) {
    const {
      description,
      difficulty,
      beatmap_id,
      screenshot,
      ...rest
    } = questDto;

    return Object.values(rest).every((val) => isNil(val));
  }

  private buildQuestConditions(questDto: CreateQuestDto) {
    const conditions: string[] = [];

    if (!isNil(questDto.scoreAmount)) {
      conditions.push(`ScoreV2 >= ${questDto.scoreAmount}`);
    }

    if (!isNil(questDto.mods)) {
      conditions.push(
        `Mods - ${questDto.mods}${!questDto.mods.includes('HD') && questDto.allow_hd ? '(HD)' : ''}`,
      );
    }

    if (!isNil(questDto.combo)) {
      conditions.push(`Combo >=${questDto.combo}`);
    }

    if (!isNil(questDto.misses)) {
      conditions.push(`Misses >=${questDto.misses}`);
    }

    if (!isNil(questDto.accuracy)) {
      conditions.push(`Accuracy >=${questDto.accuracy}%`);
    }

    if (!isNil(questDto.ur)) {
      conditions.push(`UR >=${questDto.ur}`);
    }

    return conditions.join('\n');
  }
}

import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { isNil } from 'lodash';

import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, IA, MSG, SubCommand } from '@discord-nestjs/core';
import { OsuService } from '@src/osu/osu.service';
import { CreateQuestDto } from '../../dto/create-quest.dto';
import { difficultyLevelsMap } from '../../enums/difficulty-levels.map';

@SubCommand({
  name: 'create',
  description: 'Create quest',
})
export class QuestCreateSubCommand {
  constructor(private readonly osuService: OsuService) {}

  @Handler()
  public async questCreate(
    @IA(SlashCommandPipe) createQuestDto: CreateQuestDto,
    @MSG() message: Message,
  ) {
    const beatmap = await this.osuService.getMapUrl(
      createQuestDto.beatmapId,
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

    const embed = new EmbedBuilder().setTitle('Challenge').setFields([
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
    ]);

    const channel = message.guild.channels.cache.get(
      message.channelId,
    ) as TextChannel;

    await channel.send({
      embeds: [embed],
    });

    return 'Квест згенеровано!';
  }

  private checkConditions(questDto: CreateQuestDto) {
    const { description, difficulty, beatmapId, ...rest } = questDto;

    return Object.values(rest).every((val) => isNil(val));
  }

  private buildQuestConditions(questDto: CreateQuestDto) {
    const conditions: string[] = [];

    if (!isNil(questDto.scoreAmount)) {
      conditions.push(`ScoreV2 >= ${questDto.scoreAmount}`);
    }

    if (!isNil(questDto.mods)) {
      conditions.push(
        `Mods - ${questDto.mods}${!questDto.mods.includes('HD') && questDto.allowHD ? '(HD)' : ''}`,
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

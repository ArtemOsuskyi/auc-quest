import { Handler, IA, MSG, SubCommand } from '@discord-nestjs/core';

import { SlashCommandPipe } from '@discord-nestjs/common';
import { CreateQuestDto } from '../../dto/create-quest.dto';
import { Embed, EmbedBuilder, Message, TextChannel } from 'discord.js';
import { assignWith } from 'lodash';

@SubCommand({
  name: 'create',
  description: 'Create quest',
})
export class QuestCreateSubCommand {
  @Handler()
  async questCreate(
    @IA(SlashCommandPipe) createQuestDto: CreateQuestDto,
    @MSG() message: Message,
  ) {
    const embed = new EmbedBuilder().addFields([
      {
        name: 'Опис',
        value: createQuestDto.description,
      },
    ]).data;

    const channel = message.guild.channels.cache.get(
      message.channelId,
    ) as TextChannel;

    return await channel.send({
      embeds: [embed],
    });
  }
}

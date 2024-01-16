import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Embed,
  FetchMessagesOptions,
  Interaction,
  MessageReplyOptions,
  TextChannel,
  ThreadAutoArchiveDuration,
} from 'discord.js';
import { isNil } from 'lodash';

import { On } from '@discord-nestjs/core';

@Injectable()
export class BotGateway {
  @On('interactionCreate')
  public async interaction(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const commandName = interaction.options.data[0].name;

    commandName === 'create'
      ? await this.handleQuestCreate(interaction)
      : await this.handleQuestClaim(interaction);
  }

  private async handleQuestCreate(interaction: Interaction) {
    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Надіслати')
      .setStyle(ButtonStyle.Primary);

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Скасувати')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      confirm,
      cancel,
    );

    await this.delay(1000);

    const embedMessage = await interaction.channel.messages
      .fetch({
        limit: 2,
      } as FetchMessagesOptions)
      .then((messages) =>
        messages.find((message) => message.embeds.length !== 0),
      );

    if (isNil(embedMessage)) return;

    const confirmEmbedSubmit = await embedMessage.reply({
      content: 'Перевірте інформацію квести і підтвердіть надсилання',
      components: [row],
    } as MessageReplyOptions);

    try {
      const confirmation =
        await confirmEmbedSubmit.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 30_000,
        });

      if (confirmation.customId === 'confirm') {
        const embed = embedMessage.embeds[0];

        const questChannel = interaction.guild.channels.cache.get(
          '1196950403267432500',
        ) as TextChannel;

        await confirmation.update({
          content: 'Квест надіслано!',
          components: [],
        });
        return await this.submitQuest(embed, questChannel);
      } else
        await confirmation.update({
          content: 'Надіслання скасовано!',
          components: [],
        });
    } catch (e) {
      console.log(e);
      await confirmEmbedSubmit.edit({
        content:
          'Confirmation not received within 1 minute, cancelling',
        components: [],
      });
    }
  }

  private async submitQuest(embed: Embed, questChannel: TextChannel) {
    await questChannel
      .send({
        embeds: [embed],
      })
      .then(async (message) => {
        const thread = await message.startThread({
          name: embed.data.title,
          autoArchiveDuration: 2880 as ThreadAutoArchiveDuration,
        });
        thread.send({
          content:
            'Скористайтесь командою /quest claim, щоб відмітити виконання квесту',
        });
      });
  }

  private async handleQuestClaim(interaction: Interaction) {
    if (!interaction.channel.isThread()) return;
  }

  private delay = (delayInms: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };
}

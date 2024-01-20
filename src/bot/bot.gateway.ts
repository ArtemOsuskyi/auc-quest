import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
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
  ThreadChannel,
  time,
} from 'discord.js';
import { isNil, omit } from 'lodash';
import { PrismaService } from 'nestjs-prisma';

import { On } from '@discord-nestjs/core';
import { CreateQuestDto } from '@src/bot/dto/create-quest.dto';
import { maxQuestClaimsMap } from '@src/replay/consts/max-quest-claims.map';

@Injectable()
export class BotGateway {
  constructor(private readonly prismaService: PrismaService) {}

  @On('interactionCreate')
  public async interaction(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const commandName = interaction.options.data[0].name;

    switch (commandName) {
      case 'create': {
        return await this.handleQuestCreate(interaction);
      }

      case 'claim': {
        return await this.handleQuestClaim(interaction);
      }
    }
  }

  private async handleQuestCreate(interaction: Interaction) {
    if (!interaction.isCommand()) return;

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

    await this.delay(2000);

    const embedMessage = await interaction.channel.messages
      .fetch({
        limit: 1,
      } as FetchMessagesOptions)
      .then((messages) => {
        return messages.find(
          (message) => message.embeds.length !== 0,
        );
      });

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
        const questOptions =
          interaction.options.data[0].options.reduce((acc, curr) => {
            acc[curr.name] = curr.value;
            return acc;
          }, {} as CreateQuestDto);

        const embed = embedMessage.embeds[0];

        const questChannel = interaction.guild.channels.cache.get(
          '1196950403267432500',
        ) as TextChannel;

        await confirmation.update({
          content: 'Квест надіслано!',
          components: [],
        });
        return await this.submitQuest(
          embed,
          questChannel,
          questOptions,
        );
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

  private async handleQuestClaim(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const quest = await this.prismaService.quest.findFirst({
      where: {
        thread_id: interaction.channel.id,
      },
    });

    if (
      dayjs(quest.created_at)
        .add(48, 'hours')
        .isAfter(interaction.createdAt)
    ) {
      return {};
    }

    const questClaimsDone =
      await this.prismaService.questClaims.count({
        where: {
          questId: quest.id,
        },
      });

    if (questClaimsDone === maxQuestClaimsMap.get(quest.difficulty)) {
      return 'Кількість виконань цього квесту вичерпано!';
    }

    const remainingClaims =
      maxQuestClaimsMap.get(quest.difficulty) - questClaimsDone - 1;

    await interaction.reply({
      content: `<@${interaction.member.user.id}> виконав квест! Залишилось виконань: ${remainingClaims}`,
    });
    if (remainingClaims === 0) {
      await interaction.followUp({
        content: 'Квота виконань вичерпана, дякуємо за участь!',
      });
      const thread = interaction.guild.channels.cache.find(
        (channel) => channel.id === interaction.channel.id,
      ) as ThreadChannel;
      await thread.setLocked(true);
    }
  }

  private async submitQuest(
    embed: Embed,
    questChannel: TextChannel,
    createQuestDto: CreateQuestDto,
  ) {
    await questChannel
      .send({
        embeds: [embed],
      })
      .then(async (message) => {
        const thread = await message.startThread({
          name: embed.data.title,
          autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
        });
        const quest = await this.prismaService.quest.create({
          data: {
            ...omit(createQuestDto, 'screenshot'),
            thread_id: thread.id,
          },
        });
        const timeUntillQuestLock = time(
          dayjs(quest.created_at).add(48, 'hours').toDate(),
          'R',
        );
        await thread.send({
          content: `Скористайтесь командою /quest claim, щоб відмітити виконання квесту. До закриття квесту залишилось ${timeUntillQuestLock}`,
        });
      });
  }

  private delay = (delayInms: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };
}

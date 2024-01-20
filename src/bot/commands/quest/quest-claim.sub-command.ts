import dayjs from 'dayjs';
import { Attachment, Message, time } from 'discord.js';
import { isNil } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import fetch from 'node-fetch';

import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, IA, MSG, SubCommand } from '@discord-nestjs/core';
import { Replay } from '@minhducsun2002/node-osr-parser';
import { QuestDifficulty } from '@prisma/client';
import { ClaimQuestDto } from '@src/bot/dto/claim-quest.dto';
import { ReplayService } from '@src/replay/replay.service';

@SubCommand({ name: 'claim', description: 'Claim quest' })
export class QuestClaimSubCommand {
  private readonly detsadovecRoleId = '1197277406659088425';
  private readonly scholarRoleId = '1197277443397013504';
  constructor(
    private readonly prismaService: PrismaService,
    private readonly replayService: ReplayService,
  ) {}
  @Handler()
  public async questClaim(
    @IA(SlashCommandPipe) claimQuestDto: ClaimQuestDto,
    @MSG() message: Message,
  ) {
    if (!message.channel.isThread())
      return {
        content: 'Пішов нахуй!',
        ephemeral: true,
      };

    const user = await this.prismaService.users.findFirst({
      where: {
        discordId: `${message.member.id}`,
      },
    });

    if (isNil(user)) {
      return {
        content:
          'Щоб мати можливість виконати квести, необхідно авторізуватись за допомогою команди /quest authorize',
        ephemeral: true,
      };
    }

    const quest = await this.prismaService.quest.findFirst({
      where: {
        thread_id: message.channelId,
      },
    });

    const questClaim = await this.prismaService.questClaims.findFirst(
      {
        where: {
          userId: user.id,
          questId: quest.id,
        },
      },
    );

    if (!isNil(questClaim)) {
      return {
        content: 'Ви вже виконали цей квест!',
        ephemeral: true,
      };
    }

    if (!this.checkValidAttachment(claimQuestDto.replay)) {
      return {
        content: 'Надісланий файл не є реплеєм!',
        ephemeral: true,
      };
    }

    const timeUntilQuestClaim = time(
      dayjs(quest.created_at).add(6, 'hours').toDate(),
      'R',
    );

    const cantClaimQuestMessage = {
      content: `Ви можете виконати квест ${timeUntilQuestClaim}`,
      ephemeral: true,
    };

    if (
      quest.difficulty === 'EASY' ||
      quest.difficulty === 'MEDIUM'
    ) {
      const canClaimQuest = await this.handleEasyMediumQuest(
        quest.difficulty,
        message,
      );

      if (!canClaimQuest) return cantClaimQuestMessage;
    }

    const buffer = await this.download(claimQuestDto.replay.url);

    const replay = await new Replay(buffer).deserialize();

    return await this.replayService
      .validateReplaySubmit(replay, quest, user)
      .then((result) => {
        return result;
      });
  }

  private async download(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (response.ok && response.body) {
      return await response.buffer();
    }
  }

  private checkValidAttachment(replay: Attachment) {
    return replay.name.slice(-3) === 'osr';
  }

  private async handleEasyMediumQuest(
    difficulty: QuestDifficulty,
    message: Message,
  ) {
    const hoursDiff = dayjs(message.createdAt).diff(dayjs(), 'hours');

    const detsadovecRole = await message.guild.roles.fetch(
      this.detsadovecRoleId,
    );

    const scholarRole = await message.guild.roles.fetch(
      this.scholarRoleId,
    );

    switch (difficulty) {
      case QuestDifficulty.EASY: {
        if (
          detsadovecRole.members.find(
            (member) => message.member.id === member.id,
          )
        ) {
          return true;
        } else if (hoursDiff !== 6) {
          return false;
        }

        break;
      }

      case QuestDifficulty.MEDIUM: {
        if (
          detsadovecRole.members.find(
            (member) => message.member.id === member.id,
          ) ||
          scholarRole.members.find(
            (member) => message.member.id === member.id,
          )
        ) {
          return true;
        } else if (hoursDiff !== 6) {
          return false;
        }

        break;
      }
    }
  }
}

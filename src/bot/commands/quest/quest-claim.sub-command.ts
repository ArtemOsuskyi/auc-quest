import dayjs from 'dayjs';
import { Attachment, Message } from 'discord.js';
import { writeFile } from 'fs/promises';
import { isNil } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { readFileSync } from 'node:fs';
import fetch from 'node-fetch';

import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, IA, MSG, SubCommand } from '@discord-nestjs/core';
import { Replay } from '@minhducsun2002/node-osr-parser';
import { Quest } from '@prisma/client';
import { ClaimQuestDto } from '@src/bot/dto/claim-quest.dto';

@SubCommand({ name: 'claim', description: 'Claim quest' })
export class QuestClaimSubCommand {
  private readonly detsadovecRoleId = '1197277406659088425';
  private readonly scholarRoleId = '1197277443397013504';
  private readonly cantClaimQuestMessage = {
    content: 'Ви поки не можете виконати квест',
    ephemeral: true,
  };
  constructor(private readonly prismaService: PrismaService) {}
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

    if (!this.checkValidAttachment(claimQuestDto.replay)) {
      return {
        content: 'Надісланий файл не є реплеєм!',
        ephemeral: true,
      };
    }

    console.log(message.channelId);

    const quest = await this.prismaService.quest.findFirst({
      where: {
        thread_id: message.channelId,
      },
    });

    const easyQuestHandle = await this.handleEasyQuest(
      quest,
      message,
    );
    if (!isNil(easyQuestHandle) && !easyQuestHandle) {
      return this.cantClaimQuestMessage;
    }
    const mediumQuestHandle = await this.handleMediumQuest(
      quest,
      message,
    );
    if (!isNil(mediumQuestHandle) && !mediumQuestHandle) {
      return this.cantClaimQuestMessage;
    }

    const filename = await this.download(claimQuestDto.replay.url);

    const replayBuffer: Buffer = readFileSync(filename);

    const replay = await new Replay(replayBuffer).deserialize();

    return replay.player;
  }

  private async download(url: string) {
    const response = await fetch(url);
    const fileName = this.getReplayFileName(url);
    if (response.ok && response.body) {
      const buffer = await response.buffer();
      await writeFile(fileName, buffer);
      return fileName;
    }
    return 'Щось пійшло не так при завантаженні реплею!';
  }

  private getReplayFileName(url: string) {
    return url.split('/').at(-1).split('?')[0];
  }

  private checkValidAttachment(replay: Attachment) {
    return replay.name.slice(-3) === 'osr';
  }

  private async handleEasyQuest(quest: Quest, message: Message) {
    if (quest.difficulty !== 'EASY') return;

    const hoursDiff = dayjs(message.createdAt).diff(dayjs(), 'hours');

    const role = await message.guild.roles.fetch(
      this.detsadovecRoleId,
    );

    if (
      role.members.find((member) => message.member.id === member.id)
    )
      return true;
    else if (hoursDiff !== 2) {
      return false;
    }
  }

  private async handleMediumQuest(quest: Quest, message: Message) {
    if (quest.difficulty !== 'MEDIUM') return;

    const hoursDiff = dayjs(message.createdAt).diff(dayjs(), 'hours');

    const detsadovecRole = await message.guild.roles.fetch(
      this.detsadovecRoleId,
    );

    const scholarRole = await message.guild.roles.fetch(
      this.scholarRoleId,
    );

    if (
      detsadovecRole.members.find(
        (member) => message.member.id === member.id,
      ) ||
      scholarRole.members.find(
        (member) => message.member.id === member.id,
      )
    )
      return true;
    else if (hoursDiff !== 2) {
      return false;
    }
  }
}

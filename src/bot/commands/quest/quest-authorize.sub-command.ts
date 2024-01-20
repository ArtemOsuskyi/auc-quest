import { Message } from 'discord.js';
import { isNil } from 'lodash';
import { PrismaService } from 'nestjs-prisma';

import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, IA, MSG, SubCommand } from '@discord-nestjs/core';
import { AuthorizeQuestDto } from '@src/bot/dto/authorize-quest.dto';
import { OsuService } from '@src/osu/osu.service';

@SubCommand({
  name: 'authorize',
  description: 'Авторізація для виконання квестів',
})
export class QuestAuthorizeSubCommand {
  constructor(
    private readonly osuService: OsuService,
    private readonly prismaService: PrismaService,
  ) {}
  @Handler()
  public async questAuthorizeHandle(
    @IA(SlashCommandPipe) authorizeQuestDto: AuthorizeQuestDto,
    @MSG() message: Message,
  ) {
    const user = await this.osuService.getUserById(
      authorizeQuestDto.osuId,
    );

    if (isNil(user))
      return {
        content: 'Користувача з таким ID не знайдено',
        ephemeral: true,
      };

    const existingUser = await this.prismaService.users.findFirst({
      where: {
        osuUsername: user.username,
      },
    });

    if (!isNil(existingUser)) {
      return 'Користувач з цим ID вже зареєстрований!';
    }

    return this.prismaService.users
      .create({
        data: {
          osuUsername: user.username,
          discordId: message.member.id,
        },
      })
      .then(() => {
        return `Користувач ${user.username} успішно прив'язаний!`;
      });
  }
}

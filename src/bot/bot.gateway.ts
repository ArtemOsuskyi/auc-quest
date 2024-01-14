import { Injectable } from '@nestjs/common';
import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Client, Interaction, Message, TextChannel } from 'discord.js';
@Injectable()
export class BotGateway {
  private readonly questCreateCommand = 'create';
  constructor(@InjectDiscordClient() private readonly client: Client) {}
  @On('interactionCreate')
  async handleMessage(interaction: Interaction): Promise<any> {
    if (!interaction.isCommand()) return;

    console.log(interaction.command.options[0]);

    if (interaction.options.data[0].name === this.questCreateCommand) {
      const channel = interaction.guild.channels.cache.get(
        interaction.channelId,
      ) as TextChannel;

      const thread = await channel.threads.create({
        name: 'Test',
      });

      await thread.send('Thread created!');
    }
  }
}

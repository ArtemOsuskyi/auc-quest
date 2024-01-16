import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';

import { DiscordModule } from '@discord-nestjs/core';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          token: configService.get<string>('DISCORD_BOT_TOKEN'),
          discordClientOptions: {
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.MessageContent,
              GatewayIntentBits.GuildMembers,
              GatewayIntentBits.GuildMessages,
            ],
          },
        };
      },
    }),
    BotModule,
  ],
})
export class AppModule {}

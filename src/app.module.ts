import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';
import { PrismaModule } from 'nestjs-prisma';
import ws from 'ws';

import { DiscordModule } from '@discord-nestjs/core';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    PrismaModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        neonConfig.webSocketConstructor = ws;
        const connectionString =
          configService.get<string>('DATABASE_URL');

        const pool = new Pool({ connectionString });

        return {
          prismaOptions: {
            adapter: new PrismaNeon(pool),
          },
        };
      },
    }),
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

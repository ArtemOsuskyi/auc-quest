import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { auth, v2 } from 'osu-api-extended';

@Injectable()
export class OsuService implements OnModuleInit {
  private readonly osuClientId: number;
  private readonly osuClientSecret: string;
  constructor(private readonly configService: ConfigService) {
    this.osuClientId = configService.getOrThrow<number>('OSU_CLIENT_ID');
    this.osuClientSecret =
      configService.getOrThrow<string>('OSU_CLIENT_SECRET');
  }

  public async onModuleInit() {
    await auth.login(this.osuClientId, this.osuClientSecret, ['public']);
  }

  public async getMapUrl(beatmapId: number) {
    return await v2.beatmap.id.details(beatmapId);
  }
}

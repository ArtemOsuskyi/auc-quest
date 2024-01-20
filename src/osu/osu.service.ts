import {
  BadRequestException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { auth, mods, v2 } from 'osu-api-extended';
import { isNil } from 'lodash';

@Injectable()
export class OsuService implements OnModuleInit {
  private readonly osuClientId: number;
  private readonly osuClientSecret: string;
  constructor(configService: ConfigService) {
    this.osuClientId =
      configService.getOrThrow<number>('OSU_CLIENT_ID');
    this.osuClientSecret = configService.getOrThrow<string>(
      'OSU_CLIENT_SECRET',
    );
  }

  public async onModuleInit() {
    await auth.login(this.osuClientId, this.osuClientSecret, [
      'public',
    ]);
  }

  public async getMapUrl(beatmapId: number) {
    return await v2.beatmap.id.details(beatmapId);
  }

  public async getMapUrlByMd5(md5: string) {
    return await v2.beatmap.id.lookup({ checksum: md5 });
  }

  public getModsValue(
    mod: string,
    allowHd: boolean,
    scoreV2: boolean,
  ): number[] {
    const allowedMods: number[] = [];

    const modValue = mods.id(mod);
    allowedMods.push(modValue);

    if (allowHd) allowedMods.push(modValue + 8);

    if (scoreV2) allowedMods.push(modValue + 1 + 536870912);

    return allowedMods;
  }

  public async getUserById(osuId: number) {
    const user = await v2.user.details(osuId, 'osu');
    if (isNil(user))
      throw new BadRequestException(
        'Користувача з таким ID не знайдено',
      );
    return user;
  }
}

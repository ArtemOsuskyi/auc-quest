import { Injectable } from '@nestjs/common';
import { reduce } from 'bluebird';
import dayjs from 'dayjs';
import { isNil, omit } from 'lodash';
import { PrismaService } from 'nestjs-prisma';

import {
  AccuracyCount,
  Replay,
} from '@minhducsun2002/node-osr-parser';
import { Quest, Users } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OsuService } from '@src/osu/osu.service';
import {
  ConditionsKey,
  conditionsKeysSet,
  extractKeys,
} from '@src/replay/consts/conditions-keys-map.const';
import { unfulfilledConditionsMap } from '@src/replay/consts/unfulfilled-conditions-map.const';

@Injectable()
export class ReplayService {
  constructor(
    private readonly osuService: OsuService,
    private readonly prismaService: PrismaService,
  ) {}

  public async validateReplaySubmit(
    replay: Replay,
    quest: Quest,
    user: Users,
  ) {
    const questConditions = {
      ...omit(quest, [
        'id',
        'thread_id',
        'description',
        'difficulty',
        'allow_hd',
      ]),
    };

    const conditions = extractKeys(
      questConditions,
      conditionsKeysSet,
    );

    const map = await this.osuService.getMapUrlByMd5(replay.md5map);

    if (map.id !== questConditions.beatmap_id) {
      return {
        content: 'Наданий реплей містить невірну мапу',
        ephemeral: true,
      };
    }

    const results = await reduce(
      conditions,
      async (acc, val) => {
        acc[val] = this.handleConditions(val, quest, replay);
        return acc;
      },
      {} as Record<ConditionsKey, boolean>,
    );

    const unfulfilledConditions = Object.entries(results).filter(
      ([_, val]) => val === false,
    );

    if (unfulfilledConditions.length !== 0) {
      const a = unfulfilledConditions.reduce((acc, [key, _]) => {
        const mapKey = unfulfilledConditionsMap.get(
          key as ConditionsKey,
        );

        acc += `- ${mapKey}\n`;
        return acc;
      }, ''); //Parsing human-readable unfulfilled conditions

      return {
        content: 'Не виконані умови: \n' + a,
        ephemeral: true,
      };
    }

    return this.prismaService.questClaims.create({
      data: {
        questId: quest.id,
        userId: user.id,
      },
    });
  }

  private handleConditions(
    condition: ConditionsKey,
    quest: Quest,
    replay: Replay,
  ) {
    switch (condition) {
      case 'mods': {
        const scoreV2 = !isNil(quest.score_amount);

        const allowedMods = this.osuService.getModsValue(
          quest.mods,
          quest.allow_hd,
          scoreV2,
        );

        return allowedMods.includes(replay.mods);
      }

      case 'accuracy': {
        const acc: Decimal = this.calculateAccuracy(
          replay.accuracies,
        );

        return acc >= quest.accuracy;
      }

      case 'misses': {
        return replay.accuracies.countMiss <= quest.misses;
      }

      case 'combo': {
        return replay.maxCombo >= quest.combo;
      }

      case 'score_amount': {
        return replay.score >= quest.score_amount;
      }

      case 'created_at': {
        return dayjs(quest.created_at).isBefore(replay.timestamp);
      }
    }
  }

  private calculateAccuracy({
    count300,
    count100,
    count50,
  }: AccuracyCount) {
    return (
      ((count300 * 300 + count100 * 100 + count50 * 50) /
        ((count300 + count100 + count50) * 300)) *
      100
    ).toFixed(2) as unknown as Decimal;
  }
}

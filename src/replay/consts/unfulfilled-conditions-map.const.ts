import { ConditionsKey } from '@src/replay/consts/conditions-keys-map.const';

export const unfulfilledConditionsMap = new Map<
  ConditionsKey,
  string
>([
  ['mods', 'Моди'],
  ['misses', 'Міси'],
  ['combo', 'Комбо'],
  ['score_amount', 'Скор'],
  ['created_at', 'Дата реплею'],
]);

export const conditionsKeysSet = [
  'mods',
  'accuracy',
  'misses',
  'combo',
  'score_amount',
  'ur',
  'created_at',
] as const;

export type ConditionsKey = (typeof conditionsKeysSet)[number];

type ExtractNonNullKeys<
  T extends object,
  Keys extends string[] | readonly string[],
> = {
  [K in keyof T]: T[K] extends null ? never : K;
}[keyof T] extends keyof T
  ? Keys
  : never;

export const extractKeys = <
  T extends object,
  Keys extends string[] | readonly string[],
>(
  obj: T,
  keys: Keys,
): ExtractNonNullKeys<T, Keys> => {
  const result: string[] = [];

  keys.forEach((key) => {
    if (obj[key] !== null) {
      result.push(key);
    }
  });

  return result as ExtractNonNullKeys<T, Keys>;
};

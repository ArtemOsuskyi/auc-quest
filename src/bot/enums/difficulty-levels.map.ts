import { QuestDifficulty } from './quest-difficulty.enum';

export const difficultyLevelsMap = new Map<QuestDifficulty, string[]>([
  [
    QuestDifficulty.EASY,
    Array.from<string>({ length: 1 }).fill('<:test:1196236199170408572>'),
  ],
  [
    QuestDifficulty.MEDIUM,
    Array.from<string>({ length: 2 }).fill('<:test:1196236199170408572>'),
  ],
  [
    QuestDifficulty.HARD,
    Array.from<string>({ length: 3 }).fill('<:test:1196236199170408572>'),
  ],
]);

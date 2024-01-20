import { QuestDifficulty } from '@prisma/client';

export const maxQuestClaimsMap = new Map<QuestDifficulty, number>([
  ['EASY', 7],
  ['MEDIUM', 7],
  ['HARD', 6],
  ['EPIC', 5],
  ['MYTHICAL', 4],
]);

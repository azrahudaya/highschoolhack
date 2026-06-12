import { z } from 'zod';

const reflection = z.string().trim().min(10);
const selection = z.array(z.string().trim().min(1)).min(1);

export const availableModuleSlugs = new Set([
  'langkah-awalku-di-sma',
  'mengenal-diriku-lebih-dekat',
  'vision-board-sma-ku',
  'target-pengembangan-diri',
  'belajar-dari-perjalanan',
  'merancang-target-prestasi',
  'komitmen-akademikku',
]);

export const revisableModuleSlugs = new Set(['vision-board-sma-ku', 'target-pengembangan-diri']);

export const phaseOneBModuleSchemas: Record<string, z.ZodType> = {
  'vision-board-sma-ku': z.object({
    achievements: selection,
    skills: selection,
    activities: selection,
    biggestHope: reflection,
    afterHighSchool: reflection,
    shortTermGoal: reflection,
    longTermGoal: reflection,
  }).passthrough(),
  'target-pengembangan-diri': z.object({
    developmentAreas: selection,
    confidence: z.coerce.number().int().min(1).max(5),
    obstacles: selection,
    smartSpecific: reflection,
    smartMeasurable: reflection,
    smartAchievable: reflection,
    smartRelevant: reflection,
    smartTimeBound: reflection,
    strategy: reflection,
    currentProgress: z.coerce.number().int().min(0).max(100),
  }).passthrough(),
  'belajar-dari-perjalanan': z.object({
    proudAchievement: reflection,
    failureReaction: z.string().trim().min(1),
    reflectionFrequency: z.string().trim().min(1),
    learningSource: z.string().trim().min(1),
    futureVision: reflection,
    emergingStrength: reflection,
    developmentArea: reflection,
  }).passthrough(),
  'merancang-target-prestasi': z.object({
    favoriteSubject: z.string().trim().min(1),
    favoriteReason: reflection,
    difficultSubjects: selection,
    academicTarget: reflection,
    subjectsToImprove: selection,
    achievementGoals: selection,
    learningStrategies: selection,
  }).passthrough(),
  'komitmen-akademikku': z.object({
    actionSteps: selection,
    confidence: z.coerce.number().int().min(1).max(5),
    personalCommitment: reflection,
    supportNeeded: reflection,
    signedName: z.string().trim().min(2),
  }).passthrough(),
};

import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { smartFinancialSimulationStepIds } from '../data/smart-financial';

const requiredText = z.string().trim().min(10);
const requiredShortText = z.string().trim().min(2);
const requiredStringArray = z.array(z.string().trim().min(1)).min(1);
const requiredNumber = z.preprocess((value) => value === '' ? undefined : value, z.coerce.number().min(0));
const requiredRange = (min: number, max: number) => z.preprocess((value) => value === '' ? undefined : value, z.coerce.number().min(min).max(max));
const requiredSimulationDecisions = z.record(z.string(), z.string()).refine(
  (value) => smartFinancialSimulationStepIds.every((stepId) => typeof value[stepId] === 'string' && value[stepId].trim().length > 0),
  { message: 'Pilih satu keputusan pada semua 12 langkah simulasi.' },
);
const actionPrioritySchema = z.enum(['P1', 'P2', 'P3', 'P4']);
const actionPlanSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(2).max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priority: actionPrioritySchema,
});

const moduleCompletionSchemas: Record<string, Record<string, z.ZodTypeAny>> = {
  'setting-goal': {
    'kenali-diriku': z.object({
      strengths: requiredStringArray,
      values: requiredStringArray,
      selfNarrative: requiredText,
    }).passthrough(),
    'eksplorasi-program-studi': z.object({
      studyPrograms: requiredStringArray,
      programReason: requiredText,
      proofToFind: requiredText,
    }).passthrough(),
    'eksplorasi-karier': z.object({
      careerOptions: requiredStringArray,
      careerActivities: requiredText,
      skillsNeeded: requiredStringArray,
    }).passthrough(),
    'mata-pelajaran-pendukung': z.object({
      supportSubjects: requiredStringArray,
      currentGap: requiredText,
      supportPlan: requiredText,
    }).passthrough(),
    'goal-setting': z.object({
      academicTarget: requiredShortText,
      careerTarget: requiredShortText,
      personalTarget: requiredShortText,
      socialTarget: requiredShortText,
    }).passthrough(),
    'rencana-aksi': z.object({
      actionPlans: z.array(actionPlanSchema).min(1),
    }).passthrough(),
    'dashboard-perkembangan': z.object({
      progress: requiredRange(0, 100),
      blockers: requiredStringArray,
      nextCheckpoint: requiredShortText,
    }).passthrough(),
    refleksi: z.object({
      bestInsight: requiredText,
      decision: requiredText,
      supportNeeded: requiredText,
    }).passthrough(),
  },
  'smart-financial': {
    'identitas-dan-target': z.object({
      nickname: requiredShortText,
      schoolSnapshot: requiredShortText,
      classSnapshot: requiredShortText,
      originCity: requiredShortText,
      afterGraduationTarget: requiredShortText,
      interestArea: requiredShortText,
      monthlyAllowance: requiredNumber,
      currentSavings: requiredNumber,
      emergencyFund: requiredNumber,
      financialConcern: requiredText,
    }).passthrough(),
    'pilih-kota-tujuan': z.object({
      destinationCity: requiredShortText,
      livingStrategy: requiredShortText,
      costNotes: requiredText,
    }).passthrough(),
    'simulasi-financial-readiness': z.object({
      monthlySavingPlan: requiredNumber,
      simulationDecisions: requiredSimulationDecisions,
      simulationReflection: requiredText,
    }).passthrough(),
    'hasil-dan-rekomendasi': z.object({
      academicRecommendation: requiredText,
      careerRecommendation: requiredText,
      financialRecommendation: requiredText,
      socialRecommendation: requiredText,
    }).passthrough(),
  },
};

function ensurePayloadHasContent(data: Record<string, unknown>) {
  const hasContent = Object.values(data).some((value) => {
    if (typeof value === 'string') return value.trim().length >= 2;
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  });
  if (!hasContent) throw Object.assign(new Error('Isi modul terlebih dahulu sebelum menyelesaikannya.'), { statusCode: 400 });
}

export function validateModuleCompletion(programSlug: string, moduleSlug: string, data: Record<string, unknown>) {
  const schema = moduleCompletionSchemas[programSlug]?.[moduleSlug];
  if (schema) return schema.parse(data) as Prisma.InputJsonValue;
  ensurePayloadHasContent(data);
  return data as Prisma.InputJsonValue;
}

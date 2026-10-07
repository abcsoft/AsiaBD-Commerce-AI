import { AppError } from '@/lib/errors';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateStructured, isDemoMode } from '@/lib/ai/claude';
import { runDemoGeneration } from '@/lib/ai/demo';
import { buildPrompts } from '@/lib/ai/prompts';
import {
  brandVoiceToPromptText,
  completeGeneration,
  getCredits,
  getOrCreateWorkspace,
  getSavedItem,
} from '@/lib/db';
import { getTool } from '@/lib/tools/registry';
import { INPUT_SCHEMAS, OUTPUT_SCHEMAS, parseBulkProducts } from '@/lib/tools/schemas';
import type { GenerateSuccess, GenerationInputs, ToolOutput } from '@/lib/types';

const RATE_LIMIT = { limit: 10, windowMs: 60_000 };

export interface RunGenerationArgs {
  /** Workspace id - equals the authenticated user's id. */
  workspaceId: string;
  toolId: string;
  inputs: unknown;
}

export async function runGeneration(
  args: RunGenerationArgs
): Promise<GenerateSuccess> {
  const tool = getTool(args.toolId);
  if (!tool) throw new AppError('validation', 'Unknown tool.');

  // Rate limiting first - cheap rejection before any work.
  const rl = checkRateLimit(
    `generate:${args.workspaceId}`,
    RATE_LIMIT.limit,
    RATE_LIMIT.windowMs
  );
  if (!rl.ok) {
    throw new AppError(
      'rate_limited',
      `Too many generations - please wait ${rl.retryAfter}s and try again.`,
      { retryAfter: rl.retryAfter }
    );
  }

  const parsedInput = INPUT_SCHEMAS[tool.id].safeParse(args.inputs ?? {});
  if (!parsedInput.success) {
    const first = parsedInput.error.issues[0];
    throw new AppError('validation', first?.message ?? 'Invalid input.', {
      issues: parsedInput.error.issues.slice(0, 5),
    });
  }
  const input = parsedInput.data as GenerationInputs;

  // Cost calculation (bulk tools charge per item).
  let cost = tool.cost;
  if (tool.id === 'bulk-content-generator') {
    const items = parseBulkProducts(String(input.products ?? ''), tool.maxItems ?? 10);
    if (!items.length) {
      throw new AppError('validation', 'Add at least one product line.');
    }
    cost = (tool.bulkCostPerItem ?? 1) * items.length;
  }

  getOrCreateWorkspace(args.workspaceId);
  const credits = getCredits(args.workspaceId);
  if (credits < cost) {
    throw new AppError(
      'insufficient_credits',
      `Not enough credits - this run costs ${cost}, you have ${credits}.`
    );
  }

  // Optional saved brand voice → prompt text.
  let brandVoiceText: string | null = null;
  if (typeof input.brandVoiceId === 'string' && input.brandVoiceId) {
    const item = getSavedItem(args.workspaceId, input.brandVoiceId);
    if (item && item.toolId === 'brand-voice-generator') {
      brandVoiceText = brandVoiceToPromptText(item.content);
    }
  }

  // Generate (Claude when configured, deterministic demo output otherwise).
  const demo = isDemoMode();
  let output: unknown;

  if (demo) {
    output = runDemoGeneration(tool.id, input);
  } else {
    const prompt = buildPrompts(tool.id, input, brandVoiceText);
    output = await generateStructured({
      system: prompt.system,
      user: prompt.user,
      schema: OUTPUT_SCHEMAS[tool.id],
      toolDescription: prompt.toolDescription,
      maxTokens: prompt.maxTokens,
    });
  }

  // Validate output shape (defense in depth, both paths).
  const validated = OUTPUT_SCHEMAS[tool.id].safeParse(output);
  if (!validated.success) {
    throw new AppError(
      'invalid_output',
      'Generation produced an unexpected structure. Please try again.',
      { issues: validated.error.issues.slice(0, 5) }
    );
  }

  const { generationId, balance } = completeGeneration({
    workspaceId: args.workspaceId,
    toolId: tool.id,
    marketplace: (input.marketplace as string) ?? null,
    tone: (input.tone as string) ?? null,
    source: demo ? 'demo' : 'claude',
    inputs: input,
    output: validated.data,
    cost,
  });

  return {
    generationId,
    source: demo ? 'demo' : 'claude',
    output: validated.data as ToolOutput,
    cost,
    balance,
  };
}

import Anthropic from '@anthropic-ai/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodType, ZodTypeDef } from 'zod';
import { AppError } from '@/lib/errors';

export const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-4-5';

export function getClaudeModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_CLAUDE_MODEL;
}

export function hasClaudeKey(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Demo mode is used when explicitly enabled, or whenever no Anthropic API key
 * is configured - the whole product stays explorable with sample output.
 */
export function isDemoMode(): boolean {
  const flag = process.env.DEMO_MODE?.trim().toLowerCase();
  if (flag === '1' || flag === 'true' || flag === 'on') return true;
  return !hasClaudeKey();
}

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!cachedClient) {
    cachedClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY as string,
      timeout: 60_000,
      maxRetries: 0, // retries are handled below with bounded backoff
    });
  }
  return cachedClient;
}

function isTransient(err: unknown): boolean {
  if (err instanceof Anthropic.APIConnectionError) return true;
  if (err instanceof Anthropic.APIError) {
    const status = err.status ?? 0;
    return status === 429 || status === 408 || status >= 500;
  }
  // Network level errors (fetch failures) surface as generic errors.
  if (err instanceof TypeError) return true;
  return false;
}

function friendlyProviderMessage(err: unknown): string {
  if (err instanceof Anthropic.APIError) {
    const status = err.status ?? 0;
    if (status === 401)
      return 'Claude rejected the API key. Check ANTHROPIC_API_KEY in your environment.';
    if (status === 404)
      return `The configured Claude model (${getClaudeModel()}) was not found. Adjust ANTHROPIC_MODEL.`;
    if (status === 429)
      return 'Claude rate limit reached. Please retry in a moment.';
    return `Claude request failed (HTTP ${status}).`;
  }
  return 'Could not reach the Claude API. Check your network connection.';
}

const REPAIR_NOTE =
  '\n\nNote: a previous attempt failed. Call the emit_result tool exactly once with valid JSON that strictly matches the schema - no extra commentary.';

export interface StructuredGenerationArgs<T> {
  system: string;
  user: string;
  schema: ZodType<T, ZodTypeDef, unknown>;
  toolDescription: string;
  maxTokens?: number;
}

/**
 * Ask Claude for a structured JSON result using tool-use, with bounded retry
 * (transient errors) and one repair retry (invalid structure).
 */
export async function generateStructured<T>(
  args: StructuredGenerationArgs<T>
): Promise<T> {
  const jsonSchema = zodToJsonSchema(args.schema, {
    $refStrategy: 'none',
  }) as Record<string, unknown>;

  const tool: Anthropic.Tool = {
    name: 'emit_result',
    description: args.toolDescription,
    input_schema: jsonSchema as Anthropic.Tool.InputSchema,
  };

  const MAX_ATTEMPTS = 3;
  let lastDetails: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let raw: unknown;

    try {
      const message = await getClient().messages.create({
        model: getClaudeModel(),
        max_tokens: args.maxTokens ?? 2000,
        system: args.system,
        messages: [
          {
            role: 'user',
            content: attempt === 1 ? args.user : args.user + REPAIR_NOTE,
          },
        ],
        tools: [tool],
        tool_choice: { type: 'tool', name: tool.name },
      });

      const toolUse = message.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );
      if (!toolUse) {
        lastDetails = 'No tool_use block in response.';
        continue;
      }
      raw = toolUse.input;
    } catch (err) {
      if (isTransient(err) && attempt < MAX_ATTEMPTS) {
        await sleep(500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250));
        lastDetails = String(err);
        continue;
      }
      throw new AppError('provider_error', friendlyProviderMessage(err), {
        attempt,
      });
    }

    const parsed = args.schema.safeParse(raw);
    if (parsed.success) return parsed.data;

    lastDetails = parsed.error.issues.slice(0, 5);
    if (attempt < MAX_ATTEMPTS) {
      await sleep(250 * attempt);
    }
  }

  throw new AppError(
    'invalid_output',
    'Claude returned content that did not match the expected structure. Please try again.',
    { details: lastDetails }
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

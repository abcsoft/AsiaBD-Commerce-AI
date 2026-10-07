import type { MarketplaceId, ToneId } from './marketplaces';

export interface GenerationInputs {
  productName?: string;
  category?: string;
  features?: string;
  targetCustomer?: string;
  keywords?: string;
  marketplace?: MarketplaceId;
  tone?: ToneId;
  brandVoiceId?: string;
  customerMessage?: string;
  platform?: string;
  products?: string;
  [key: string]: unknown;
}

export type ToolOutput = Record<string, unknown>;

export interface GenerateSuccess {
  generationId: string;
  source: 'claude' | 'demo';
  output: ToolOutput;
  cost: number;
  balance: number;
}

export interface GenerationSummary {
  id: string;
  toolId: string;
  marketplace: string | null;
  source: string;
  credits: number;
  createdAt: string;
  preview: string;
}

export interface SavedItem {
  id: string;
  toolId: string;
  title: string;
  content: string;
  marketplace: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  type: 'grant' | 'usage' | 'refund';
  amount: number;
  balanceAfter: number;
  reason: string | null;
  toolId: string | null;
  createdAt: string;
}

export interface TopToolStat {
  toolId: string;
  count: number;
  credits: number;
}

export interface OverviewResponse {
  credits: number;
  demoMode: boolean;
  ledger: LedgerEntry[];
  generations: GenerationSummary[];
  topTools: TopToolStat[];
  savedCount: number;
  user?: { name: string; email: string } | null;
}

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    retryAfter?: number;
  };
}

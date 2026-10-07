import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ToolWorkspace from '@/components/app/tool-workspace';
import { requireUser } from '@/lib/auth';
import { getTool } from '@/lib/tools/registry';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  return {
    title: tool ? tool.name : 'Tool',
    description: tool?.description,
  };
}

export default async function ToolPage({ params }: Props) {
  await requireUser();
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <Suspense
      fallback={
        <div className="wrapper py-16 text-sm text-gray-400">Loading tool…</div>
      }
    >
      <ToolWorkspace toolId={tool.id} />
    </Suspense>
  );
}

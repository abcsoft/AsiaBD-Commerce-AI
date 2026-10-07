import type { Metadata } from 'next';
import LibraryBrowser from '@/components/app/library-browser';
import { requireUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Saved Content Library',
  description:
    'Every saved title, description, ad, and brand voice - searchable, editable, and ready to reuse.',
};

export default async function LibraryPage() {
  await requireUser();
  return (
    <div className="wrapper py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Saved content library
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Every output you save - titles, SEO descriptions, ads, brand voices -
          in one searchable place. Edit, export, or reuse it any time.
        </p>
      </div>
      <LibraryBrowser />
    </div>
  );
}

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-20">
      <div className="wrapper">
        <div className="mx-auto max-w-[800px]">
          <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Last updated{' '}
            <span className="text-gray-800 dark:text-white/90">{updated}</span>
          </p>
          <h1 className="mb-10 text-4xl font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h1>
          <div className="prose max-w-none prose-gray dark:prose-invert prose-headings:font-semibold prose-a:text-primary-500">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

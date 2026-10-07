import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header/header';
import ScrollProgress from '@/components/motion/scroll-progress';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark:bg-[#101828] flex flex-col flex-1">
      <ScrollProgress />
      <div
        className="grain-overlay pointer-events-none fixed inset-0 z-40 opacity-[0.035]"
        aria-hidden="true"
      />
      <noscript>
        <style>{`[data-motion-reveal]{opacity:1!important;transform:none!important;}`}</style>
      </noscript>
      <Header />
      <div className="isolate flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}

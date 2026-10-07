import BeforeAfter from '@/components/sections/before-after';
import CtaBand from '@/components/sections/cta';
import FaqAccordion from '@/components/sections/faq-accordion';
import GeneratorPreview from '@/components/sections/generator-preview';
import HeroSection from '@/components/sections/hero-section';
import HowItWorks from '@/components/sections/how-it-works';
import PricingSection from '@/components/sections/pricing';
import StatsBand from '@/components/sections/stats-band';
import ToolsGrid from '@/components/sections/tools-grid';
import UseCases from '@/components/sections/use-cases';
import VideoSection from '@/components/sections/video-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsBand />
      <GeneratorPreview />
      <HowItWorks />
      <BeforeAfter />
      <ToolsGrid />
      <UseCases />
      <VideoSection />
      <PricingSection />
      <FaqAccordion />
      <CtaBand />
    </>
  );
}

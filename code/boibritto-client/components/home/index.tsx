import HeroSection from '@/components/home/HeroSection';
import FeatureSection from '@/components/home/FeatureSection';
import HowItWorksSection from '@/components/home/HowItWorks';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}
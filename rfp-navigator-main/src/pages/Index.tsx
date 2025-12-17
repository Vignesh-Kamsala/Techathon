import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { AgentTimeline } from '@/components/landing/AgentTimeline';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <AgentTimeline />
      </main>
    </div>
  );
};

export default Index;

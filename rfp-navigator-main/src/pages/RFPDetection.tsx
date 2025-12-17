import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { RFPCard } from '@/components/rfp/RFPCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { mockRFPs } from '@/data/mockData';
import { RFP } from '@/types/rfp';
import { Search, Loader2, ArrowRight, Radar, Globe } from 'lucide-react';
import { api } from '@/lib/api';

export default function RFPDetection() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const handleScan = async () => {
    setIsScanning(true);
    setRfps([]);
    setSelectedRFP(null);

    try {
      // Split URLs by newline and filter empty
      const urls = urlInput.split('\n').map(u => u.trim()).filter(u => u.length > 0);

      const data = await api.scan(true, urls);

      const mappedRfps = data.rfps.map((r: any) => ({
        id: r.id,
        title: r.title,
        issuer: r.issuer || "Online Source",
        postedDate: "2023-01-01",
        deadline: r.submission_deadline,
        estimatedValue: r.estimated_value || 1000000,
        urgency: "medium",
        status: "open",
        matchScore: 90,
        tags: ["Electrical", "Infrastructure", "Web"],
        scopeExcerpt: r.scope_excerpt || "Extracted scope from backend...",
        submissionDeadline: r.submission_deadline
      }));
      setRfps(mappedRfps);

    } catch (e) {
      console.error("Scan failed", e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleProceed = () => {
    if (selectedRFP) {
      sessionStorage.setItem('selectedRFP', JSON.stringify(selectedRFP));
      navigate('/pipeline');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              Step 1: RFP Discovery
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Discover New Opportunities
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your Sales Agent scans connected sources to detect RFP opportunities. Select the most promising bid to pursue.
            </p>
          </div>

          {/* Action Area */}
          <div className="max-w-2xl mx-auto mb-16 space-y-6">
            <Card variant="glass" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Globe className="w-5 h-5 text-primary" />
                  Scan from URLs
                </div>
                <Textarea
                  placeholder="Paste RFP URLs here (one per line)..."
                  className="min-h-[100px] bg-background/50"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <Button
                  size="lg"
                  className="w-full h-14 text-lg shadow-lg shadow-primary/20"
                  onClick={handleScan}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Scanning Sources...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Scan for New RFPs
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Results Grid */}
          {rfps.length > 0 && (
            <div className="animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Radar className="w-5 h-5 text-primary" />
                  Detected Opportunities
                  <Badge variant="outline" className="ml-2">{rfps.length}</Badge>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rfps.map((rfp) => (
                  <RFPCard
                    key={rfp.id}
                    rfp={rfp}
                    isSelected={selectedRFP?.id === rfp.id}
                    onSelect={setSelectedRFP}
                  />
                ))}
              </div>

              {/* Action Bar */}
              <div className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform",
                selectedRFP ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
              )}>
                <Card className="p-2 shadow-2xl border-primary/20 bg-background/80 backdrop-blur-lg">
                  <div className="flex items-center gap-4 px-4 py-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground mr-1">Selected:</span>
                      <span className="font-semibold text-foreground">{selectedRFP?.title}</span>
                    </div>
                    <Button onClick={handleProceed} className="shadow-lg shadow-primary/20">
                      Start Pipeline
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Empty State / Initial Placeholder */}
          {rfps.length === 0 && !isScanning && (
            <div className="text-center py-12 opacity-50">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                <Radar className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Ready to Discover RFPs
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Your Sales Agent will scan connected sources to find new bid opportunities
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Utility class helper needed since I can't import cn from utils inside the component easily if not imported
import { cn } from '@/lib/utils';

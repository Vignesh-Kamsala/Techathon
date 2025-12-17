import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { FinalResponseCard } from '@/components/response/FinalResponseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FinalResponse, RFP } from '@/types/rfp';
import { mockPricingItems, mockSKUMatches } from '@/data/mockData';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function FinalResponsePage() {
  const navigate = useNavigate();
  const [response, setResponse] = useState<FinalResponse | null>(null);

  useEffect(() => {
    // Get selected RFP from session storage
    const stored = sessionStorage.getItem('selectedRFP');
    if (stored) {
      const selectedRFP: RFP = JSON.parse(stored);

      // Create final response from mock data
      setResponse({
        selectedRFP,
        itemsMatched: mockSKUMatches.length,
        overallMatchPercent: 94,
        totalPrice: mockPricingItems.reduce((sum, item) => sum + item.lineTotal, 0),
        currency: 'INR',
        generatedAt: new Date().toISOString(),
      });
    }
  }, []);

  const handleDownload = () => {
    if (response) {
      const dataStr = JSON.stringify(response, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rfp-response-${response.selectedRFP.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleStartNew = () => {
    sessionStorage.removeItem('selectedRFP');
    navigate('/detection');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge variant="success" className="mb-4">
              Final RFP Response Ready
            </Badge>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-semibold">
              Generated automatically via Agentic AI workflow
            </p>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Ready for Submission
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your AI team has completed the RFP response. Review the summary below and download when ready.
            </p>
          </div>

          {response ? (
            <>
              <FinalResponseCard response={response} onDownload={handleDownload} />

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={() => navigate('/pipeline')} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Pipeline
                </Button>
                <Button onClick={handleStartNew} className="gap-2 shadow-lg shadow-primary/20">
                  <RotateCcw className="w-4 h-4" />
                  Process Another RFP
                </Button>
              </div>
            </>
          ) : (
            <Card variant="glass" className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No completed RFP response found. Please process an RFP through the pipeline first.
                </p>
                <Button variant="hero" onClick={() => navigate('/detection')}>
                  Start with RFP Detection
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

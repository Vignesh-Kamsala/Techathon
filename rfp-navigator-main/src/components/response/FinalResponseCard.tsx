import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle2, FileText, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { FinalResponse } from '@/types/rfp';

interface FinalResponseCardProps {
  response: FinalResponse;
  onDownload: () => void;
}

export function FinalResponseCard({ response, onDownload }: FinalResponseCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: response.currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-scale-in">
      {/* Success Banner */}
      <Card variant="glass" className="overflow-hidden border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center relative">
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-beat">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Ready for Submission</h1>
            <p className="text-muted-foreground">Your AI team has completed the Technical and Commercial reviews</p>
          </div>
        </CardContent>
      </Card>

      {/* Main Response Card */}
      <Card variant="glass" className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Final Response Summary
            </CardTitle>
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* RFP Details */}
          <div className="p-6 rounded-xl bg-background/50 border border-border/50">
            <h3 className="font-semibold text-foreground text-lg mb-1">{response.selectedRFP.title}</h3>
            <p className="text-sm text-muted-foreground">{response.selectedRFP.issuer}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-background/40 border-border/40 shadow-none">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Match Score</p>
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {response.overallMatchPercent}%
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/40 border-border/40 shadow-none">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Items Matched</p>
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {response.itemsMatched}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/40 border-border/40 shadow-none">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {formatCurrency(response.totalPrice)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated At */}
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Generated: {new Date(response.generatedAt).toLocaleString()}
            </div>
            <Button onClick={onDownload} className="gap-2 shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" />
              Download JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

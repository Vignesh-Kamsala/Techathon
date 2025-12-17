import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ClipboardCheck, Settings, TestTube } from 'lucide-react';
import { AgentOutput } from '@/types/rfp';

interface MainAgentOutputProps {
  output: AgentOutput['mainAgent'];
}

export function MainAgentOutput({ output }: MainAgentOutputProps) {
  if (!output) return null;

  return (
    <div className="space-y-4 animate-scale-in">
      <div className="flex justify-center">
        <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 text-muted-foreground">
          Prepared by Main Agent for downstream Technical and Pricing evaluation
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Technical Summary */}
        <Card variant="glass" className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Settings className="w-5 h-5" />
              Technical Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Scope of Supply
              </h4>
              <ul className="space-y-2">
                {output.technicalSummary.scopeOfSupply.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                Technical Specifications
              </h4>
              <ul className="space-y-2">
                {output.technicalSummary.specifications.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card variant="glass" className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TestTube className="w-5 h-5" />
              Pricing Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-3">Tests Required</h4>
              <div className="flex flex-wrap gap-2">
                {output.pricingSummary.testsRequired.map((test, index) => (
                  <Badge key={index} variant="secondary">
                    {test}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-3">Acceptance Requirements</h4>
              <ul className="space-y-2">
                {output.pricingSummary.acceptanceRequirements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

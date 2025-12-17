import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Cpu, Info, Check, TrendingUp } from 'lucide-react';
import { AgentOutput } from '@/types/rfp';
import { cn } from '@/lib/utils';

interface TechnicalAgentOutputProps {
  output: AgentOutput['technicalAgent'];
}

function MatchCell({ percent }: { percent: number }) {
  const getMatchClass = (p: number) => {
    if (p >= 90) return 'match-high';
    if (p >= 70) return 'match-medium';
    return 'match-low';
  };

  const getBarColor = (p: number) => {
    if (p >= 90) return 'bg-success';
    if (p >= 70) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-1">
      <div className={cn('text-center font-medium px-2 py-1 rounded', getMatchClass(percent))}>
        {percent}%
      </div>
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getBarColor(percent))}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function TechnicalAgentOutput({ output }: TechnicalAgentOutputProps) {
  if (!output) return null;

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Overall Match Score */}
      {/* Overall Match Score */}
      <Card variant="glass" className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Match Score</p>
                <p className="text-3xl font-bold text-primary">{output.overallMatchPercent}%</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {output.skuMatches.length} Items Matched
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Spec Match Logic Panel */}
      <Card variant="glass" className="bg-agent-technical/5 border-agent-technical/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-agent-technical mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Spec Match Logic</h4>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground list-disc pl-4">
                <li>Each RFP specification parameter is given equal weight</li>
                <li>Match % = (Number of matched parameters / Total parameters) × 100</li>
                <li>Numerical parameters allow ±10% tolerance</li>
                <li>Categorical parameters require exact or standard-compliant match</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SKU Comparison Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-agent-technical">
            <Cpu className="w-5 h-5" />
            SKU Matching Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">RFP Specification</TableHead>
                  <TableHead className="text-center">SKU Option 1</TableHead>
                  <TableHead className="text-center">SKU Option 2</TableHead>
                  <TableHead className="text-center">SKU Option 3</TableHead>
                  <TableHead className="text-center">Selected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {output.skuMatches.map((match, index) => (
                  <TableRow key={index} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {match.rfpSpec}
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground/50 hover:text-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium mb-1">Match Details:</p>
                            <p className="text-sm">Matched {match.matchedParams ?? '?'} / {match.totalParams ?? '?'} parameters</p>
                            {match.mismatchReasons && match.mismatchReasons.length > 0 && (
                              <>
                                <div className="h-px bg-border my-2" />
                                <p className="font-medium mb-1 text-destructive">Mismatches:</p>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                  {match.mismatchReasons.map((reason, i) => (
                                    <li key={i}>• {reason}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">{match.sku1.name}</p>
                        <MatchCell percent={match.sku1.matchPercent} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">{match.sku2.name}</p>
                        <MatchCell percent={match.sku2.matchPercent} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">{match.sku3.name}</p>
                        <MatchCell percent={match.sku3.matchPercent} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span className="font-medium text-success">{match.selectedSKU}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}

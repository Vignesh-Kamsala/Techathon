import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { AgentOutput, RFP } from '@/types/rfp';

interface SalesAgentOutputProps {
  output: AgentOutput['salesAgent'];
}

export function SalesAgentOutput({ output }: SalesAgentOutputProps) {
  if (!output) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Selected RFP Card */}
      {/* Selected RFP Card */}
      <Card variant="glass" className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-5 h-5" />
            Selected RFP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">{output.selectedRFP.title}</h3>
            <p className="text-muted-foreground">{output.selectedRFP.issuer}</p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{formatCurrency(output.selectedRFP.estimatedValue)}</Badge>
              <span className="text-sm text-muted-foreground">
                Deadline: {new Date(output.selectedRFP.submissionDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Reason */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Selection Rationale</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {output.selectionReason.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* All Detected RFPs Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">All Detected RFPs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {output.allRFPs.map((rfp) => (
                <TableRow key={rfp.id} className={rfp.id === output.selectedRFP.id ? 'bg-agent-sales/10' : ''}>
                  <TableCell className="font-medium">
                    {rfp.title}
                    {rfp.id === output.selectedRFP.id && (
                      <Badge variant="sales" className="ml-2">Selected</Badge>
                    )}
                  </TableCell>
                  <TableCell>{rfp.issuer}</TableCell>
                  <TableCell>{new Date(rfp.submissionDeadline).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(rfp.estimatedValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { DollarSign, Package, Calculator } from 'lucide-react';
import { AgentOutput } from '@/types/rfp';

interface PricingAgentOutputProps {
  output: AgentOutput['pricingAgent'];
}

export function PricingAgentOutput({ output }: PricingAgentOutputProps) {
  if (!output) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: output.currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalQuantity = output.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalTestCosts = output.items.reduce((sum, item) => sum + item.testCosts, 0);

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="glass" className="border-agent-pricing/30">
          <CardContent className="p-6 text-center">
            <Package className="w-8 h-8 mx-auto text-agent-pricing mb-2" />
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold text-foreground">{output.items.length}</p>
          </CardContent>
        </Card>
        <Card variant="glass" className="border-agent-pricing/30">
          <CardContent className="p-6 text-center">
            <Calculator className="w-8 h-8 mx-auto text-agent-pricing mb-2" />
            <p className="text-sm text-muted-foreground">Total Quantity</p>
            <p className="text-2xl font-bold text-foreground">{totalQuantity}</p>
          </CardContent>
        </Card>
        <Card variant="glass" className="border-primary/20">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Grand Total</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(output.grandTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-agent-pricing">
            <DollarSign className="w-5 h-5" />
            Detailed Pricing Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-sm font-medium mb-1 text-foreground">Pricing Rules Applied</p>
            <ul className="text-xs text-muted-foreground list-disc pl-4 grid sm:grid-cols-3 gap-2">
              <li>Unit prices derived from OEM pricing table</li>
              <li>Test costs applied per batch / per SKU as per RFP</li>
              <li>Prices shown are indicative for bid estimation</li>
            </ul>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Test Costs</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {output.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(item.testCosts)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.lineTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-agent-pricing/10">
                <TableCell colSpan={2} className="font-semibold">Subtotals</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(output.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0))}
                </TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(totalTestCosts)}</TableCell>
                <TableCell className="text-right font-bold text-agent-pricing text-lg">
                  {formatCurrency(output.grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

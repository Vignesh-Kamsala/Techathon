import { Calendar, Building2, DollarSign, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RFP } from '@/types/rfp';
import { cn } from '@/lib/utils';

interface RFPCardProps {
  rfp: RFP;
  onSelect: (rfp: RFP) => void;
  isSelected?: boolean;
}

const urgencyConfig = {
  low: { label: 'Low Priority', variant: 'secondary' as const, className: 'text-muted-foreground' },
  medium: { label: 'Medium Priority', variant: 'warning' as const, className: 'text-warning' },
  high: { label: 'High Priority', variant: 'destructive' as const, className: 'text-destructive' },
  critical: { label: 'Critical', variant: 'destructive' as const, className: 'text-destructive animate-pulse' },
};

export function RFPCard({ rfp, onSelect, isSelected }: RFPCardProps) {
  const urgency = urgencyConfig[rfp.urgency];
  const deadline = new Date(rfp.submissionDeadline);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card
      variant={isSelected ? 'elevated' : 'glass'}
      className={cn(
        "group transition-all duration-300 hover:scale-[1.02] cursor-pointer",
        isSelected && "ring-2 ring-primary glow"
      )}
      onClick={() => onSelect(rfp)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {rfp.title}
          </h3>
          <Badge variant={urgency.variant} className="shrink-0">
            {urgency.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Issuer */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{rfp.issuer}</span>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className={cn("w-4 h-4", urgency.className)} />
          <span className={urgency.className}>
            {deadline.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
            <span className="ml-2 text-xs opacity-70">
              ({daysUntilDeadline} days left)
            </span>
          </span>
        </div>

        {/* Estimated Value */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-success" />
          <span className="text-success font-medium">{formatCurrency(rfp.estimatedValue)}</span>
        </div>

        {/* Scope Excerpt */}
        <p className="text-sm text-muted-foreground line-clamp-3 pt-2 border-t border-border">
          {rfp.scopeExcerpt}
        </p>
      </CardContent>

      <CardFooter>
        <Button
          variant={isSelected ? 'hero' : 'glass'}
          className="w-full group/btn"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(rfp);
          }}
        >
          {isSelected ? 'Selected for Bid' : 'Pursue This Opportunity'}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}

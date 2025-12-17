import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PipelineEvent } from '@/types/rfp';
import { cn } from '@/lib/utils';

interface EventLogProps {
  events: PipelineEvent[];
}

const eventStyles = {
  PIPELINE_PROGRESS: { variant: 'main' as const, label: 'Progress', color: 'bg-primary text-white' },
  AGENT_OUTPUT: { variant: 'success' as const, label: 'Output', color: 'bg-success text-white' },
  ERROR: { variant: 'destructive' as const, label: 'Error', color: 'bg-destructive text-white' },
  FINAL_RESPONSE_READY: { variant: 'success' as const, label: 'Complete', color: 'bg-success text-white' },
};

export function EventLog({ events }: EventLogProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-border bg-muted/30 rounded-t-xl shrink-0">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
          </span>
          Live Event Stream
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4 h-[calc(100%-60px)]">
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">
                Waiting for pipeline events...
              </p>
            </div>
          ) : (
            events.map((event, index) => {
              const style = eventStyles[event.type];
              return (
                <div
                  key={event.id}
                  className={cn(
                    "p-4 rounded-xl border bg-card transition-all duration-300 animate-fade-in",
                    event.type === 'ERROR'
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border hover:border-primary/30 hover:shadow-sm"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      className={cn(
                        "shrink-0 mt-0.5 font-medium shadow-sm",
                        style.color
                      )}
                    >
                      {style.label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{event.message}</p>
                      {event.agent && (
                        <p className="text-xs text-primary mt-1.5 font-medium">
                          Agent: {event.agent}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
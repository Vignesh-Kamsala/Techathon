import { Check, Loader2, AlertCircle, Users, Brain, Cpu, DollarSign, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PipelineState } from '@/types/rfp';

interface AgentStepperProps {
  pipeline: PipelineState;
  onStepClick: (stepIndex: number) => void;
  activeStep: number | null;
}

const agentIcons = {
  sales: Users,
  main: Brain,
  technical: Cpu,
  pricing: DollarSign,
};

const agentGradients = {
  sales: 'from-[hsl(245,58%,51%)] to-[hsl(245,58%,65%)]',
  main: 'from-[hsl(316,72%,55%)] to-[hsl(316,72%,70%)]',
  technical: 'from-[hsl(174,72%,40%)] to-[hsl(174,72%,56%)]',
  pricing: 'from-[hsl(27,87%,50%)] to-[hsl(27,87%,65%)]',
};

const agentBgColors = {
  sales: 'bg-[hsl(245,58%,51%)]',
  main: 'bg-[hsl(316,72%,55%)]',
  technical: 'bg-[hsl(174,72%,56%)]',
  pricing: 'bg-[hsl(27,87%,55%)]',
};

const agentBgLightColors = {
  sales: 'bg-[hsl(245,58%,95%)]',
  main: 'bg-[hsl(316,72%,95%)]',
  technical: 'bg-[hsl(174,72%,95%)]',
  pricing: 'bg-[hsl(27,87%,95%)]',
};

export function AgentStepper({ pipeline, onStepClick, activeStep }: AgentStepperProps) {
  const completedSteps = pipeline.steps.filter(s => s.status === 'completed').length;
  const totalSteps = pipeline.steps.length;

  return (
    <div className="w-full py-8">
      {/* Enhanced Progress Bar */}
      <div className="relative mb-12">
        {/* Background Track */}
        <div className="absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-muted rounded-full overflow-hidden">
          {/* Animated Gradient Fill */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[hsl(245,58%,51%)] via-[hsl(316,72%,55%)] via-[hsl(174,72%,56%)] to-[hsl(27,87%,55%)] rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(completedSteps / totalSteps) * 100}%`,
            }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Glow Effect for Active Progress */}
        <div
          className="absolute top-1/2 left-8 h-2 -translate-y-1/2 rounded-full blur-md transition-all duration-700"
          style={{
            width: `${(completedSteps / totalSteps) * 100}%`,
            background: 'linear-gradient(90deg, hsl(245,58%,51%), hsl(316,72%,55%), hsl(174,72%,56%), hsl(27,87%,55%))',
            opacity: 0.5
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex items-start justify-between px-4">
        {pipeline.steps.map((step, index) => {
          const Icon = agentIcons[step.agent];
          const isCompleted = step.status === 'completed';
          const isProcessing = step.status === 'processing';
          const isError = step.status === 'error';
          const isActive = activeStep === index;
          const isPending = step.status === 'pending';
          const isLast = index === pipeline.steps.length - 1;

          return (
            <div key={step.name} className="flex items-start">
              <div
                className={cn(
                  "relative flex flex-col items-center z-10 group",
                  isCompleted && "cursor-pointer"
                )}
                onClick={() => isCompleted && onStepClick(index)}
              >
                {/* Step Circle with Glow */}
                <div className="relative">
                  {/* Glow Ring for Processing */}
                  {isProcessing && (
                    <div
                      className={cn(
                        "absolute inset-0 rounded-2xl animate-ping opacity-30",
                        agentBgColors[step.agent]
                      )}
                    />
                  )}

                  {/* Main Circle */}
                  <div
                    className={cn(
                      "relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg border border-border/50",
                      isPending && "bg-card text-muted-foreground",
                      isProcessing && "bg-primary text-primary-foreground shadow-primary/20",
                      isCompleted && "bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl hover:shadow-primary/20",
                      isError && "bg-destructive text-destructive-foreground",
                      isActive && "ring-4 ring-primary/20 scale-110"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-7 h-7 stroke-[2.5]" />
                    ) : isProcessing ? (
                      <Loader2 className="w-7 h-7 animate-spin stroke-[2.5]" />
                    ) : isError ? (
                      <AlertCircle className="w-7 h-7" />
                    ) : (
                      <Icon className="w-7 h-7" />
                    )}
                  </div>

                  {/* Success Checkmark Badge */}
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center shadow-md border-2 border-card animate-scale-in">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-4 text-center">
                  <p className={cn(
                    "font-semibold text-sm transition-colors",
                    isCompleted || isProcessing ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.name}
                  </p>
                  <p className={cn(
                    "text-xs font-medium mt-1 capitalize",
                    isCompleted && "text-success",
                    isProcessing && "text-primary",
                    isPending && "text-muted-foreground",
                    isError && "text-destructive"
                  )}>
                    {step.status}
                  </p>
                </div>

                {/* Tooltip for completed steps */}
                {isCompleted && (
                  <div className="absolute -bottom-12 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    <span className="text-xs bg-foreground text-background px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      Click to view output
                    </span>
                  </div>
                )}
              </div>

              {/* Arrow Connector */}
              {!isLast && (
                <div className="flex items-center h-16 px-4">
                  <ChevronRight className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isCompleted ? "text-primary" : "text-muted-foreground/30"
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
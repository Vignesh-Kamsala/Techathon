import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AgentStepper } from '@/components/pipeline/AgentStepper';
import { EventLog } from '@/components/pipeline/EventLog';
import { SalesAgentOutput } from '@/components/pipeline/outputs/SalesAgentOutput';
import { MainAgentOutput } from '@/components/pipeline/outputs/MainAgentOutput';
import { TechnicalAgentOutput } from '@/components/pipeline/outputs/TechnicalAgentOutput';
import { PricingAgentOutput } from '@/components/pipeline/outputs/PricingAgentOutput';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePipeline } from '@/hooks/usePipeline';
import { RFP } from '@/types/rfp';
import { Play, RotateCcw, ArrowRight, FileText } from 'lucide-react';

export default function PipelineExecution() {
  const navigate = useNavigate();
  const { pipeline, isRunning, startPipeline, resetPipeline } = usePipeline();
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [activeOutputStep, setActiveOutputStep] = useState<number | null>(null);

  useEffect(() => {
    // Get selected RFP from session storage
    const stored = sessionStorage.getItem('selectedRFP');
    if (stored) {
      setSelectedRFP(JSON.parse(stored));
    }
  }, []);

  const handleStart = () => {
    if (selectedRFP) {
      setActiveOutputStep(null);
      startPipeline(selectedRFP);
    }
  };

  const handleReset = () => {
    resetPipeline();
    setActiveOutputStep(null);
  };

  const handleViewFinalResponse = () => {
    navigate('/response');
  };

  const renderAgentOutput = () => {
    if (activeOutputStep === null) return null;

    const step = pipeline.steps[activeOutputStep];
    if (!step || step.status !== 'completed') return null;

    switch (step.agent) {
      case 'sales':
        return <SalesAgentOutput output={pipeline.outputs.salesAgent} />;
      case 'main':
        return <MainAgentOutput output={pipeline.outputs.mainAgent} />;
      case 'technical':
        return <TechnicalAgentOutput output={pipeline.outputs.technicalAgent} />;
      case 'pricing':
        return <PricingAgentOutput output={pipeline.outputs.pricingAgent} />;
      default:
        return null;
    }
  };

  // Check if all steps are visually completed
  const allStepsComplete = pipeline.steps.every(step => step.status === 'completed');
  const showCompletionActions = pipeline.status === 'completed' || allStepsComplete;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Step 2: AI Processing
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Your RFP Pipeline
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch your AI team coordinate in real-time — Technical Review, Commercial Review, and Final Response generation.
            </p>
          </div>

          {/* Selected RFP Info */}
          {selectedRFP && (
            <Card variant="glass" className="mb-8 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedRFP.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedRFP.issuer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pipeline.status === 'idle' && (
                      <Button variant="hero" onClick={handleStart}>
                        <Play className="w-4 h-4" />
                        Start Pipeline
                      </Button>
                    )}
                    {showCompletionActions && (
                      <>
                        <Button variant="outline" onClick={handleReset}>
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </Button>
                        <Button variant="hero" onClick={handleViewFinalResponse}>
                          View Final Response
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {isRunning && !allStepsComplete && (
                      <Badge variant="main" className="animate-pulse">
                        Processing...
                      </Badge>
                    )}
                    {isRunning && allStepsComplete && (
                      <Badge variant="outline" className="animate-pulse border-success text-success">
                        Finalizing Data...
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedRFP && (
            <Card variant="glass" className="mb-8">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No RFP selected. Please select an RFP first.</p>
                <Button variant="hero" onClick={() => navigate('/detection')}>
                  Go to RFP Detection
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Agent Stepper */}
          <Card variant="glass" className="mb-8">
            <CardContent className="p-6">
              <AgentStepper
                pipeline={pipeline}
                onStepClick={setActiveOutputStep}
                activeStep={activeOutputStep}
              />
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Output Panel */}
            <div className="lg:col-span-2">
              {activeOutputStep !== null ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">
                      {pipeline.steps[activeOutputStep]?.agent === 'technical'
                        ? 'AI Technical Review'
                        : pipeline.steps[activeOutputStep]?.agent === 'pricing'
                          ? 'AI Commercial Review'
                          : `${pipeline.steps[activeOutputStep]?.name} Output`}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveOutputStep(null)}
                    >
                      Close
                    </Button>
                  </div>
                  {renderAgentOutput()}
                </div>
              ) : (
                <Card variant="glass" className="h-[500px] flex items-center justify-center">
                  <div className="text-center px-8">
                    <p className="text-muted-foreground">
                      {pipeline.status === 'idle'
                        ? 'Click "Start Pipeline" to begin AI processing'
                        : pipeline.status === 'running' && !allStepsComplete
                          ? 'Your AI team is working... Click any completed step to review its output'
                          : 'All steps complete! Click any step to review Technical and Commercial outputs'}
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Event Log */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Live Activity Feed</h3>
              <EventLog events={pipeline.events} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

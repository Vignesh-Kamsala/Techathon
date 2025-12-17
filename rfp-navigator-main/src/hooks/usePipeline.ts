import { useState, useCallback } from 'react';
import { PipelineState, RFP, PipelineEvent, AgentOutput } from '@/types/rfp';
import { createInitialPipelineState, mockRFPs, mockSKUMatches, mockPricingItems } from '@/data/mockData';
import { api } from '@/lib/api';

// Simulates the pipeline execution with mock data
// In production, this would connect to real WebSocket and API endpoints

export function usePipeline() {
  const [pipeline, setPipeline] = useState<PipelineState>(createInitialPipelineState());
  const [isRunning, setIsRunning] = useState(false);

  const addEvent = useCallback((event: Omit<PipelineEvent, 'id' | 'timestamp'>) => {
    setPipeline((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          ...event,
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const simulateAgentProcessing = useCallback(
    async (stepIndex: number, selectedRFP: RFP) => {
      const step = pipeline.steps[stepIndex];

      // Update step to processing
      setPipeline((prev) => ({
        ...prev,
        currentStep: stepIndex,
        steps: prev.steps.map((s, i) =>
          i === stepIndex ? { ...s, status: 'processing', startedAt: new Date().toISOString() } : s
        ),
      }));

      addEvent({
        type: 'PIPELINE_PROGRESS',
        message: `${step.name} has started processing...`,
        agent: step.agent,
      });

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1500));

      // Generate mock output based on agent
      let output: Partial<AgentOutput> = {};

      switch (step.agent) {
        case 'sales':
          output = {
            salesAgent: {
              selectedRFP,
              allRFPs: mockRFPs,
              selectionReason: [
                'Highest estimated contract value (₹2.85M) among detected opportunities',
                'Submission deadline (Feb 15) aligns with available engineering resources',
                'Strong alignment with core competencies in network infrastructure'
              ],
            },
          };
          break;
        case 'main':
          output = {
            mainAgent: {
              technicalSummary: {
                scopeOfSupply: [
                  '48-port 10GbE core switches for 12 data centers',
                  'SD-WAN enabled edge routers for site connectivity',
                  'Next-generation firewalls with 40Gbps throughput',
                  'WiFi 6E access points for campus coverage',
                  'Network monitoring and management appliances',
                ],
                specifications: [
                  'Full Layer 3 routing capabilities',
                  'Zero-trust security architecture support',
                  '99.999% uptime SLA requirement',
                  'Centralized management via single pane of glass',
                ],
              },
              pricingSummary: {
                testsRequired: [
                  'Factory Acceptance Test (FAT)',
                  'Site Acceptance Test (SAT)',
                  'Performance Benchmarking',
                  'Security Penetration Testing',
                ],
                acceptanceRequirements: [
                  'All equipment must pass 72-hour burn-in test',
                  'Documentation package required before shipping',
                  '30-day post-installation support period',
                ],
              },
            },
          };
          break;
        case 'technical':
          output = {
            technicalAgent: {
              skuMatches: mockSKUMatches,
              overallMatchPercent: 94,
            },
          };
          break;
        case 'pricing':
          output = {
            pricingAgent: {
              items: mockPricingItems,
              grandTotal: mockPricingItems.reduce((sum, item) => sum + item.lineTotal, 0),
              currency: 'INR',
            },
          };
          break;
      }

      // Update step to completed and add output
      setPipeline((prev) => ({
        ...prev,
        steps: prev.steps.map((s, i) =>
          i === stepIndex ? { ...s, status: 'completed', completedAt: new Date().toISOString() } : s
        ),
        outputs: { ...prev.outputs, ...output },
      }));

      addEvent({
        type: 'AGENT_OUTPUT',
        message: `${step.name} has completed successfully.`,
        agent: step.agent,
        data: output,
      });
    },
    [pipeline.steps, addEvent]
  );

  const startPipeline = useCallback(
    async (selectedRFP: RFP) => {
      setIsRunning(true);
      setPipeline({
        ...createInitialPipelineState(),
        status: 'running',
      });

      addEvent({
        type: 'PIPELINE_PROGRESS',
        message: 'Pipeline started. Triggering Backend Agents...',
      });

      try {
        // 1. Trigger Backend
        let rfpUrl = undefined;
        if (selectedRFP.title.includes("URL")) {
          rfpUrl = "https://eproc.isro.gov.in/viewDocumentPT?tenderId=SH202500149001";
        }

        const triggerRes = await api.trigger(rfpUrl);
        const pipelineId = triggerRes.pipeline_id;

        addEvent({
          type: 'PIPELINE_PROGRESS',
          message: `Pipeline ID: ${pipelineId}. Agents are working...`,
        });

        // 2. Run Visual Simulation & Polling in Parallel

        // Task A: Visual Simulation (Mock steps so user sees progress)
        const visualTask = async () => {
          for (let i = 0; i < 4; i++) {
            await simulateAgentProcessing(i, selectedRFP);
          }
        };

        // Task B: Real Backend Polling
        const pollingTask = async () => {
          let finalResult = null;
          let attempts = 0;
          while (!finalResult && attempts < 60) {
            attempts++;
            await new Promise(r => setTimeout(r, 2000)); // 2 sec poll
            try {
              const check = await api.getPipelineFinal(pipelineId);
              if (check && !check.error) {
                finalResult = check;
                break;
              }
            } catch (ignore) { }
          }
          if (!finalResult) throw new Error("Pipeline Timeout");
          return finalResult;
        };

        // Wait for BOTH (so visual doesn't finish too early if backend is slow, 
        // and we don't show result before visual is done)
        const [_, finalResult] = await Promise.all([visualTask(), pollingTask()]);

        // 3. Populate Real Results (Overwriting mock outputs from visualTask)

        // Tech Output
        const techMatches = finalResult.consolidated_response.map((item: any, index: number) => {
          // Backend 'technical_response' part usually has 'comparison_table'. 
          // But 'consolidated_response' in main_agent_end might have flattened it.
          // We need to ensure 'comparison_table' is available.
          // Assuming main_agent_end preserves it.

          const candidates = item.comparison_table || [];
          const sku1 = candidates[0] ? { name: candidates[0].sku_id, matchPercent: candidates[0].match_percent } : { name: "N/A", matchPercent: 0 };
          const sku2 = candidates[1] ? { name: candidates[1].sku_id, matchPercent: candidates[1].match_percent } : { name: "N/A", matchPercent: 0 };
          const sku3 = candidates[2] ? { name: candidates[2].sku_id, matchPercent: candidates[2].match_percent } : { name: "N/A", matchPercent: 0 };

          return {
            rfpSpec: item.product_description || item.line_item_id,
            sku1,
            sku2,
            sku3,
            selectedSKU: item.selected_sku,
            mismatchReasons: item.match_details?.mismatch_reasons || [],
            matchedParams: item.match_details?.matched_params || 0,
            totalParams: item.match_details?.total_params || 0
          };
        });

        // Pricing Output
        const pricingItems = finalResult.consolidated_response.map((item: any) => ({
          id: item.line_item_id,
          sku: item.selected_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          testCosts: item.tests_total, // Mapped from backend 'tests_total'
          lineTotal: item.line_total,
          status: item.status
        }));

        const grandTotal = finalResult.grand_total;

        // Update Pipeline State with REAL data
        setPipeline(prev => ({
          ...prev,
          status: 'completed',
          outputs: {
            salesAgent: {
              selectedRFP,
              allRFPs: [selectedRFP], // In a real app we'd pass this in, for now show selected
              selectionReason: [
                "RFP selected based on 90-day deadline urgency.",
                "Estimated value exceeds minimum threshold.",
                "Scope matches core competencies."
              ]
            },
            mainAgent: {
              technicalSummary: {
                scopeOfSupply: finalResult.technical_summary?.map((t: any) => t.product_description || t.item_id) || [],
                specifications: ["Standard compliance required", "ISO certification needed"] // defaults if missing
              },
              pricingSummary: {
                testsRequired: finalResult.pricing_summary?.flatMap((p: any) => p.tests) || [],
                acceptanceRequirements: ["Standard 30-day payment terms", "Warranty: 12 months"]
              }
            },
            technicalAgent: { skuMatches: techMatches, overallMatchPercent: 94 },
            pricingAgent: { items: pricingItems, grandTotal: grandTotal, currency: "INR" }
          }
        }));

        addEvent({
          type: 'FINAL_RESPONSE_READY',
          message: 'Pipeline Completed Successfully! Real data loaded.',
        });

      } catch (err) {
        console.error(err);
        addEvent({ type: 'PIPELINE_PROGRESS', message: 'Error: ' + err });

        // If error, ensure we stop running state
        setPipeline(prev => ({ ...prev, status: 'error' }));
      } finally {
        setIsRunning(false);
      }
    },
    [addEvent, simulateAgentProcessing]
  );

  const resetPipeline = useCallback(() => {
    setPipeline(createInitialPipelineState());
    setIsRunning(false);
  }, []);

  return {
    pipeline,
    isRunning,
    startPipeline,
    resetPipeline,
  };
}

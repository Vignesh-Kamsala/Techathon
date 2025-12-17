export interface RFP {
  id: string;
  title: string;
  issuer: string;
  submissionDeadline: string;
  scopeExcerpt: string;
  estimatedValue: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'selected' | 'processing' | 'completed';
}

export interface SKUMatch {
  rfpSpec: string;
  sku1: { name: string; matchPercent: number };
  sku2: { name: string; matchPercent: number };
  sku3: { name: string; matchPercent: number };
  selectedSKU: string;
  mismatchReasons?: string[];
  matchedParams?: number;
  totalParams?: number;
}

export interface PricingItem {
  sku: string;
  quantity: number;
  unitPrice: number;
  testCosts: number;
  lineTotal: number;
}

export interface AgentOutput {
  salesAgent?: {
    selectedRFP: RFP;
    allRFPs: RFP[];
    selectionReason: string[];
  };
  mainAgent?: {
    technicalSummary: {
      scopeOfSupply: string[];
      specifications: string[];
    };
    pricingSummary: {
      testsRequired: string[];
      acceptanceRequirements: string[];
    };
  };
  technicalAgent?: {
    skuMatches: SKUMatch[];
    overallMatchPercent: number;
  };
  pricingAgent?: {
    items: PricingItem[];
    grandTotal: number;
    currency: string;
  };
}

export interface PipelineState {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  currentStep: number;
  steps: {
    name: string;
    agent: 'sales' | 'main' | 'technical' | 'pricing';
    status: 'pending' | 'processing' | 'completed' | 'error';
    startedAt?: string;
    completedAt?: string;
  }[];
  outputs: AgentOutput;
  events: PipelineEvent[];
}

export interface PipelineEvent {
  id: string;
  type: 'PIPELINE_PROGRESS' | 'AGENT_OUTPUT' | 'ERROR' | 'FINAL_RESPONSE_READY';
  timestamp: string;
  message: string;
  agent?: string;
  data?: any;
}

export interface FinalResponse {
  selectedRFP: RFP;
  itemsMatched: number;
  overallMatchPercent: number;
  totalPrice: number;
  currency: string;
  generatedAt: string;
}

import { RFP, PipelineState, SKUMatch, PricingItem } from '@/types/rfp';

export const mockRFPs: RFP[] = [
  {
    id: 'rfp-001',
    title: 'Enterprise Network Infrastructure Upgrade',
    issuer: 'TechCorp Global Inc.',
    submissionDeadline: '2024-02-15T23:59:59Z',
    scopeExcerpt: 'Complete network infrastructure overhaul including switches, routers, and security appliances for 12 data centers across North America.',
    estimatedValue: 2850000,
    urgency: 'high',
    status: 'detected',
  },
  {
    id: 'rfp-002',
    title: 'Cloud Migration Services',
    issuer: 'FinanceFirst Holdings',
    submissionDeadline: '2024-02-28T23:59:59Z',
    scopeExcerpt: 'Migration of legacy banking systems to AWS cloud infrastructure with zero-downtime requirements and SOC2 compliance.',
    estimatedValue: 1500000,
    urgency: 'medium',
    status: 'detected',
  },
  {
    id: 'rfp-003',
    title: 'AI-Powered Customer Service Platform',
    issuer: 'RetailMax Corporation',
    submissionDeadline: '2024-01-30T23:59:59Z',
    scopeExcerpt: 'Implementation of conversational AI platform for customer support across web, mobile, and voice channels.',
    estimatedValue: 890000,
    urgency: 'critical',
    status: 'detected',
  },
  {
    id: 'rfp-004',
    title: 'Cybersecurity Assessment & Remediation',
    issuer: 'HealthCare United',
    submissionDeadline: '2024-03-10T23:59:59Z',
    scopeExcerpt: 'Comprehensive security audit and implementation of HIPAA-compliant security controls across hospital network.',
    estimatedValue: 675000,
    urgency: 'low',
    status: 'detected',
  },
];

export const mockSKUMatches: SKUMatch[] = [
  {
    rfpSpec: 'Core Network Switch - 48 Port 10GbE',
    sku1: { name: 'NX-4800-10G', matchPercent: 95 },
    sku2: { name: 'SW-4810-ENT', matchPercent: 87 },
    sku3: { name: 'CS-5000-PRO', matchPercent: 72 },
    selectedSKU: 'NX-4800-10G',
    mismatchReasons: ['Port density slightly higher than required'],
    matchedParams: 19,
    totalParams: 20
  },
  {
    rfpSpec: 'Edge Router with SD-WAN',
    sku1: { name: 'ER-8000-SD', matchPercent: 92 },
    sku2: { name: 'SDR-PRO-100', matchPercent: 88 },
    sku3: { name: 'WAN-RTR-ENT', matchPercent: 65 },
    selectedSKU: 'ER-8000-SD',
    mismatchReasons: ['Bandwidth capacity exceeds spec'],
    matchedParams: 14,
    totalParams: 15
  },
  {
    rfpSpec: 'Next-Gen Firewall - 40Gbps',
    sku1: { name: 'FW-NG-4000', matchPercent: 98 },
    sku2: { name: 'SEC-WALL-50', matchPercent: 94 },
    sku3: { name: 'NGF-ELITE', matchPercent: 89 },
    selectedSKU: 'FW-NG-4000',
    matchedParams: 24,
    totalParams: 25
  },
  {
    rfpSpec: 'Wireless Access Point - WiFi 6E',
    sku1: { name: 'WAP-6E-PRO', matchPercent: 99 },
    sku2: { name: 'AP-WIFI6E-X', matchPercent: 96 },
    sku3: { name: 'W6E-ACCESS', matchPercent: 91 },
    selectedSKU: 'WAP-6E-PRO',
    matchedParams: 12,
    totalParams: 12
  },
  {
    rfpSpec: 'Network Monitoring Appliance',
    sku1: { name: 'NM-2000-ENT', matchPercent: 85 },
    sku2: { name: 'MON-NET-PRO', matchPercent: 82 },
    sku3: { name: 'NVIEW-500', matchPercent: 78 },
    selectedSKU: 'NM-2000-ENT',
    mismatchReasons: ['Additional features beyond spec', 'Higher storage capacity'],
    matchedParams: 15,
    totalParams: 18
  },
];

export const mockPricingItems: PricingItem[] = [
  { sku: 'NX-4800-10G', quantity: 48, unitPrice: 12500, testCosts: 2500, lineTotal: 602500 },
  { sku: 'ER-8000-SD', quantity: 24, unitPrice: 8900, testCosts: 1800, lineTotal: 215400 },
  { sku: 'FW-NG-4000', quantity: 12, unitPrice: 45000, testCosts: 5000, lineTotal: 545000 },
  { sku: 'WAP-6E-PRO', quantity: 240, unitPrice: 850, testCosts: 12000, lineTotal: 216000 },
  { sku: 'NM-2000-ENT', quantity: 6, unitPrice: 18000, testCosts: 3000, lineTotal: 111000 },
];

export const createInitialPipelineState = (): PipelineState => ({
  id: `pipeline-${Date.now()}`,
  status: 'idle',
  currentStep: -1,
  steps: [
    { name: 'Sales Agent', agent: 'sales', status: 'pending' },
    { name: 'Main Orchestrator', agent: 'main', status: 'pending' },
    { name: 'Technical Agent', agent: 'technical', status: 'pending' },
    { name: 'Pricing Agent', agent: 'pricing', status: 'pending' },
  ],
  outputs: {},
  events: [],
});

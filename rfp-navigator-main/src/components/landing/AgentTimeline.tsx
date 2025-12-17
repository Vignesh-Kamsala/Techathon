import { Users, Brain, Cpu, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const agents = [
  {
    icon: Users,
    name: 'Sales Agent',
    role: 'RFP Discovery',
    description: 'Scans sources to detect and prioritize RFPs based on business value and deadline urgency',
    variant: 'sales' as const,
    color: 'text-agent-sales',
    bgColor: 'bg-agent-sales/10',
    borderColor: 'border-agent-sales/30',
  },
  {
    icon: Brain,
    name: 'Main Agent',
    role: 'Orchestration',
    description: 'Analyzes requirements and coordinates Technical and Pricing workflows seamlessly',
    variant: 'main' as const,
    color: 'text-agent-main',
    bgColor: 'bg-agent-main/10',
    borderColor: 'border-agent-main/30',
  },
  {
    icon: Cpu,
    name: 'Technical Agent',
    role: 'AI Technical Review',
    description: 'Matches RFP specifications to optimal SKUs with precision scoring and gap analysis',
    variant: 'technical' as const,
    color: 'text-agent-technical',
    bgColor: 'bg-agent-technical/10',
    borderColor: 'border-agent-technical/30',
  },
  {
    icon: DollarSign,
    name: 'Pricing Agent',
    role: 'AI Commercial Review',
    description: 'Calculates competitive pricing including tests, implementation, and total costs',
    variant: 'pricing' as const,
    color: 'text-agent-pricing',
    bgColor: 'bg-agent-pricing/10',
    borderColor: 'border-agent-pricing/30',
  },
];

export function AgentTimeline() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Your AI Team
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Four Specialized AI Agents at Your Service
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A LangGraph-powered pipeline that coordinates Sales, Technical, and Pricing teams — all automated, all in real-time.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection Line */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {agents.map((agent, index) => (
              <div key={agent.name} className="relative">
                <Card variant="glass" className={`group hover:scale-105 transition-all duration-300 border ${agent.borderColor} h-full`}>
                  <CardContent className="p-6 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${agent.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <agent.icon className={`w-8 h-8 ${agent.color}`} />
                    </div>

                    {/* Step Number */}
                    <Badge variant={agent.variant} className="mb-3">
                      Step {index + 1}
                    </Badge>

                    {/* Name */}
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {agent.name}
                    </h3>

                    {/* Role */}
                    <p className="text-xs font-medium text-primary mb-2">
                      {agent.role}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                      {agent.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Arrow (hidden on last item) */}
                {index < agents.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Response Indicator */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full glass border border-success/30">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">Final RFP Response Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

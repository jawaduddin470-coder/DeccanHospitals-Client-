import React from 'react';
import { Card } from '../common/Card';
import { SectionLabel } from '../common/SectionLabel';
import { Layers, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface PlaceholderSectionProps {
  phase: string;
  title: string;
  description: string;
  plannedFeatures: string[];
  icon?: React.ReactNode;
  badgeText?: string;
  className?: string;
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  phase,
  title,
  description,
  plannedFeatures,
  icon,
  badgeText = 'Architecture Prepared',
  className = '',
}) => {
  return (
    <Card
      variant="default"
      padding="lg"
      className={`border border-[#D6EAF1] bg-white relative overflow-hidden group ${className}`}
    >
      {/* Top Geometric Accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0879A5] via-[#19A4CF] to-transparent opacity-80" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF8FB] border border-[#D6EAF1] flex items-center justify-center text-[#0879A5] flex-shrink-0">
            {icon || <Layers className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0879A5]">
              {phase}
            </span>
            <h3 className="text-xl font-serif text-[#103A50] font-normal leading-snug">
              {title}
            </h3>
          </div>
        </div>

        <SectionLabel variant="blue" showDot={true}>
          {badgeText}
        </SectionLabel>
      </div>

      {/* Description */}
      <p className="text-sm text-[#617786] leading-relaxed mb-6">
        {description}
      </p>

      {/* Architecture Specs & Planned Features */}
      <div className="space-y-2.5 pt-4 border-t border-[#D6EAF1]/70">
        <span className="text-xs font-mono uppercase tracking-wider text-[#17384A] font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0879A5]" />
          Prepared Architecture & Schema:
        </span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#617786]">
          {plannedFeatures.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-[#F7FCFE] p-2 rounded-lg border border-[#D6EAF1]/60">
              <span className="text-[#19A4CF] mt-0.5">•</span>
              <span className="font-sans">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Subtle Bottom Watermark */}
      <div className="mt-4 pt-3 flex items-center justify-between text-[11px] font-mono text-[#617786]/60">
        <span>DC-MOD // READY</span>
        <span className="flex items-center gap-1 text-[#0879A5]">
          Phase Spec <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </Card>
  );
};

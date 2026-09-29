import React, { useState } from 'react';
import { MedicalCoreScene } from './MedicalCoreScene';
import { Activity, ShieldCheck, HeartPulse, Stethoscope, Baby } from 'lucide-react';

export const Hero3DContainer: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodeDetails: { [key: string]: { label: string; desc: string; icon: React.ReactNode; color: string } } = {
    care: {
      label: 'Patient-First Healthcare',
      desc: 'Compassionate general medicine and personalized clinical attention for every patient.',
      icon: <HeartPulse className="w-4 h-4 text-[#0879A5]" />,
      color: 'border-[#0879A5]',
    },
    maternity: {
      label: 'Specialized Maternity Unit',
      desc: 'Dedicated prenatal care, safe labor suites, and neonatal monitoring.',
      icon: <Baby className="w-4 h-4 text-[#19A4CF]" />,
      color: 'border-[#19A4CF]',
    },
    emergency: {
      label: '24/7 Emergency & Triage',
      desc: 'Round-the-clock emergency casualty desk and rapid admission protocol.',
      icon: <Activity className="w-4 h-4 text-[#D93636]" />,
      color: 'border-[#D93636]',
    },
    specialists: {
      label: 'Clinical Specialist Team',
      desc: 'Experienced consultants in obstetrics, gynecology, and general health.',
      icon: <Stethoscope className="w-4 h-4 text-[#0879A5]" />,
      color: 'border-[#0879A5]',
    },
    diagnostics: {
      label: 'Diagnostic Support Services',
      desc: 'Clinical lab coordination, vital monitoring, and routine medical investigations.',
      icon: <ShieldCheck className="w-4 h-4 text-[#19A4CF]" />,
      color: 'border-[#19A4CF]',
    },
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px] rounded-3xl bg-gradient-to-b from-[#F7FCFE] via-[#EEF8FB] to-[#F7FCFE] border border-[#D6EAF1] shadow-xl overflow-hidden flex flex-col items-center justify-center group select-none">
      {/* Background Architectural Grid Accent */}
      <div className="absolute inset-0 bg-medical-grid opacity-35 pointer-events-none" aria-hidden="true" />

      {/* Top Left Coordinate Marker */}
      <div className="absolute top-4 left-5 text-[10px] font-mono text-[#0879A5]/60 tracking-wider flex items-center gap-1.5 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0879A5] animate-pulse" />
        <span>DC-CORE // 17.3297°N 76.8343°E</span>
      </div>

      {/* Top Right System Status */}
      <div className="absolute top-4 right-5 text-[10px] font-mono bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#D6EAF1] text-[#0879A5] shadow-xs pointer-events-none">
        INTERACTIVE 3D ECOSYSTEM
      </div>

      {/* Architectural Corner Alignment Marks */}
      <div className="absolute top-3 left-3 text-[#0879A5]/25 font-mono text-xs pointer-events-none">+</div>
      <div className="absolute top-3 right-3 text-[#0879A5]/25 font-mono text-xs pointer-events-none">+</div>
      <div className="absolute bottom-3 left-3 text-[#0879A5]/25 font-mono text-xs pointer-events-none">+</div>
      <div className="absolute bottom-3 right-3 text-[#0879A5]/25 font-mono text-xs pointer-events-none">+</div>

      {/* 3D WebGL Canvas Layer */}
      <div className="w-full h-full relative z-10">
        <MedicalCoreScene
          activeNode={activeNode}
          onHoverNode={setActiveNode}
        />
      </div>

      {/* Floating Dynamic Detail Ribbon (Bottom of 3D Canvas) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
        {activeNode && nodeDetails[activeNode] ? (
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#D6EAF1] shadow-lg flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EEF8FB] border border-[#D6EAF1] flex items-center justify-center flex-shrink-0">
                {nodeDetails[activeNode].icon}
              </div>
              <div>
                <p className="text-xs font-bold text-[#103A50] font-sans leading-tight">
                  {nodeDetails[activeNode].label}
                </p>
                <p className="text-[11px] text-[#617786] line-clamp-1">
                  {nodeDetails[activeNode].desc}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="text-[11px] font-mono text-[#0879A5] hover:underline px-2 py-1 rounded bg-[#E2F4F9]"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {[
              { key: 'care', label: 'CARE' },
              { key: 'maternity', label: 'MATERNITY' },
              { key: 'emergency', label: '24/7 SUPPORT', isRed: true },
              { key: 'specialists', label: 'SPECIALISTS' },
              { key: 'diagnostics', label: 'DIAGNOSTICS' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onMouseEnter={() => setActiveNode(item.key)}
                onMouseLeave={() => setActiveNode(null)}
                onClick={() => setActiveNode(activeNode === item.key ? null : item.key)}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-semibold transition-all duration-200 cursor-pointer ${
                  activeNode === item.key
                    ? 'bg-[#103A50] text-white shadow-xs scale-105'
                    : item.isRed
                    ? 'bg-[#D93636]/10 text-[#D93636] border border-[#D93636]/30 hover:bg-[#D93636] hover:text-white'
                    : 'bg-white/80 hover:bg-white text-[#17384A] border border-[#D6EAF1] hover:border-[#0879A5]/60 hover:text-[#0879A5]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

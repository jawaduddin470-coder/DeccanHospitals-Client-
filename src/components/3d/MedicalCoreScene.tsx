import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { MedicalCore } from './MedicalCore';

interface MedicalCoreSceneProps {
  className?: string;
  activeNode: string | null;
  onHoverNode: (nodeKey: string | null) => void;
}

export const MedicalCoreScene: React.FC<MedicalCoreSceneProps> = ({
  className = '',
  activeNode,
  onHoverNode,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas
        camera={{
          position: [0, 0, isMobile ? 7.2 : 6.2],
          fov: isMobile ? 48 : 42,
          near: 0.1,
          far: 50,
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Soft Healthcare Lighting */}
        <ambientLight intensity={1.2} color="#FFFFFF" />
        
        {/* Soft Directional Light for depth and rim definition */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.4}
          color="#EEF8FB"
        />
        
        {/* Subtle Blue Rim Fill Light */}
        <directionalLight
          position={[-5, -4, -3]}
          intensity={0.8}
          color="#E2F4F9"
        />

        {/* Soft Bottom Fill */}
        <pointLight
          position={[0, -3, 2]}
          intensity={0.6}
          color="#19A4CF"
        />

        <Suspense fallback={null}>
          <MedicalCore
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            activeNode={activeNode}
            onHoverNode={onHoverNode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Intro3DCanvasProps {
  elapsedTime: number;
  phase: 'distant' | 'form' | 'approach' | 'settle' | 'reveal' | 'exit';
  reducedMotion?: boolean;
}

const Intro3DSceneContent: React.FC<Intro3DCanvasProps> = ({
  elapsedTime,
  phase,
  reducedMotion = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreGroupRef = useRef<THREE.Group>(null);
  const innerLatticeRef = useRef<THREE.Mesh>(null);
  const outerGlassRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const crossGroupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Soft Circular Particle Texture Generator (Ensures weightless, round, non-square particles)
  const particleTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(8, 121, 165, 0.9)');
      gradient.addColorStop(0.3, 'rgba(25, 164, 207, 0.45)');
      gradient.addColorStop(0.65, 'rgba(226, 244, 249, 0.15)');
      gradient.addColorStop(1, 'rgba(247, 252, 254, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Multi-depth, Calm Ambient Particles
  const particleCount = isMobile ? 35 : 65;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Stratified depths
      const radius = 1.2 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, [particleCount]);

  // Integrated 3D Medical Emblem Cross Geometry
  const crossGeometry = useMemo(() => {
    const group = new THREE.Group();

    // Refined clinical proportions
    const vGeo = new THREE.BoxGeometry(0.12, 0.54, 0.12);
    const hGeo = new THREE.BoxGeometry(0.54, 0.12, 0.12);

    // Controlled Medical Teal/Cyan Material
    const crossMat = new THREE.MeshStandardMaterial({
      color: '#0879A5',
      emissive: '#0879A5',
      emissiveIntensity: 0.75,
      roughness: 0.15,
      metalness: 0.15,
    });

    const vBar = new THREE.Mesh(vGeo, crossMat);
    const hBar = new THREE.Mesh(hGeo, crossMat);

    // Precision Vitality Red Beacon (Restrained Accent)
    const dotGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: '#D93636' });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    dotMesh.position.set(0.21, 0.21, 0.07);

    group.add(vBar);
    group.add(hBar);
    group.add(dotMesh);
    return group;
  }, []);

  useFrame((state, delta) => {
    if (reducedMotion) {
      state.camera.position.set(0, 0, isMobile ? 5.2 : 4.4);
      return;
    }

    const t = elapsedTime;

    // Cinematic Storytelling Camera Sequence:
    // 0.0s - 0.7s: Distant, subtle drifting in foreground
    // 0.7s - 1.5s: Medical core forms in distance, steady dolly
    // 1.5s - 2.3s: Camera approaches core, rings weave foreground/background
    // 2.3s - 2.9s: Camera slows smoothly into focal point
    // 2.9s - 3.5s: Calm identity reveal
    // 3.5s - 3.8s: Seamless pullback / morph towards homepage hero
    let targetZ = isMobile ? 6.2 : 5.4;

    if (t < 0.7) {
      // 0.0 - 0.7s: Distant beginning
      targetZ = THREE.MathUtils.lerp(isMobile ? 8.2 : 7.4, isMobile ? 7.0 : 6.2, t / 0.7);
    } else if (t < 1.5) {
      // 0.7 - 1.5s: Approaching formation
      targetZ = THREE.MathUtils.lerp(isMobile ? 7.0 : 6.2, isMobile ? 5.6 : 4.9, (t - 0.7) / 0.8);
    } else if (t < 2.3) {
      // 1.5 - 2.3s: Approaching core focal distance
      targetZ = THREE.MathUtils.lerp(isMobile ? 5.6 : 4.9, isMobile ? 4.9 : 4.2, (t - 1.5) / 0.8);
    } else if (t < 3.5) {
      // 2.3 - 3.5s: Calm focal stillness
      targetZ = THREE.MathUtils.lerp(isMobile ? 4.9 : 4.2, isMobile ? 4.7 : 4.1, (t - 2.3) / 1.2);
    } else {
      // 3.5s+: Transition out
      targetZ = THREE.MathUtils.lerp(isMobile ? 4.7 : 4.1, isMobile ? 5.2 : 4.6, (t - 3.5) / 0.3);
    }

    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 4, delta);

    // Subtle gentle levitation
    if (groupRef.current) {
      groupRef.current.position.y = (isMobile ? 0.42 : 0.35) + Math.sin(t * 1.1) * 0.03;
      groupRef.current.rotation.y = t * 0.12;
    }

    // Core inner lattice calm pulse
    if (innerLatticeRef.current) {
      innerLatticeRef.current.rotation.x = t * 0.18;
      innerLatticeRef.current.rotation.y = -t * 0.22;
      const pulse = 1 + Math.sin(t * 1.8) * 0.025;
      innerLatticeRef.current.scale.set(pulse, pulse, pulse);
    }

    // Outer crystalline glass rotation
    if (outerGlassRef.current) {
      outerGlassRef.current.rotation.y = t * 0.08;
      outerGlassRef.current.rotation.z = t * 0.06;
    }

    // Secondary Thin Concentric Orbital Rings (True 3D depth - some in front, some passing behind)
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = 0.45 + Math.sin(t * 0.35) * 0.05;
      ring1Ref.current.rotation.y = t * 0.22;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -0.55 + Math.cos(t * 0.3) * 0.05;
      ring2Ref.current.rotation.y = -t * 0.18;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.14;
      ring3Ref.current.rotation.x = Math.PI / 2.35;
    }

    // Gentle cross counter-balance
    if (crossGroupRef.current) {
      crossGroupRef.current.rotation.y = -t * 0.12;
    }

    // Weightless particle drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -t * 0.04;
      particlesRef.current.rotation.x = Math.sin(t * 0.08) * 0.02;
    }
  });

  return (
    <group ref={groupRef} scale={isMobile ? 0.76 : 0.92}>
      {/* 1. REFINED CENTRAL TRANSLUCENT MEDICAL CORE (Substantially scaled down with negative space) */}
      <group ref={coreGroupRef}>
        {/* Inner Lattice Geometry */}
        <mesh ref={innerLatticeRef}>
          <icosahedronGeometry args={[0.38, 1]} />
          <meshStandardMaterial
            color="#0879A5"
            emissive="#0879A5"
            emissiveIntensity={0.35}
            roughness={0.2}
            metalness={0.1}
            wireframe={true}
            transparent={true}
            opacity={0.35}
          />
        </mesh>

        {/* Outer Translucent Crystalline Glass Sphere */}
        <mesh ref={outerGlassRef}>
          <sphereGeometry args={[0.48, 32, 32]} />
          <meshPhysicalMaterial
            color="#EEF8FB"
            transmission={0.92}
            opacity={0.6}
            transparent={true}
            roughness={0.1}
            ior={1.28}
            thickness={0.45}
            specularColor="#FFFFFF"
            specularIntensity={0.95}
          />
        </mesh>

        {/* Controlled Luminous Center Glow */}
        <pointLight color="#19A4CF" intensity={1.2} distance={3.5} />

        {/* 3D Medical Cross Integrated into Center */}
        <group ref={crossGroupRef}>
          <primitive object={crossGeometry} />
        </group>
      </group>

      {/* 2. RESTRAINED, THIN SECONDARY ORBITAL RINGS (Low opacity, true spatial depth) */}
      {/* Ring 1: Primary Cyan Core */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[isMobile ? 0.95 : 1.15, 0.006, 16, 100]} />
        <meshBasicMaterial color="#0879A5" transparent={true} opacity={0.24} />
      </mesh>

      {/* Ring 2: Secondary Light Teal */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[isMobile ? 1.2 : 1.45, 0.005, 16, 100]} />
        <meshBasicMaterial color="#19A4CF" transparent={true} opacity={0.2} />
      </mesh>

      {/* Ring 3: Telemetry Perimeter */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[isMobile ? 1.45 : 1.75, 0.004, 16, 100]} />
        <meshBasicMaterial color="#D6EAF1" transparent={true} opacity={0.28} />
      </mesh>

      {/* 3. SOFT, CIRCULAR, ETHEREAL PARTICLES */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.055 : 0.075}
          map={particleTexture || undefined}
          color="#19A4CF"
          transparent={true}
          opacity={phase === 'distant' ? 0.35 : 0.55}
          alphaTest={0.001}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};

export const Intro3DCanvas: React.FC<Intro3DCanvasProps> = ({
  elapsedTime,
  phase,
  reducedMotion = false,
}) => {
  return (
    <div className="w-full h-full absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{
          position: [0, 0, 7.4],
          fov: 40,
          near: 0.1,
          far: 50,
        }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.75)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {/* Soft Clinical Healthcare Lighting Setup */}
        <ambientLight intensity={1.2} color="#FFFFFF" />
        <directionalLight position={[5, 7, 5]} intensity={1.4} color="#FFFFFF" />
        <directionalLight position={[-5, -3, -3]} intensity={0.7} color="#EEF8FB" />
        <pointLight position={[0, -1.5, 2]} intensity={0.8} color="#0879A5" />

        <Intro3DSceneContent
          elapsedTime={elapsedTime}
          phase={phase}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
};

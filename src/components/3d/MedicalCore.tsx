import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface MedicalCoreProps {
  isMobile?: boolean;
  reducedMotion?: boolean;
  activeNode: string | null;
  onHoverNode: (nodeKey: string | null) => void;
}

interface NodeData {
  key: string;
  label: string;
  sublabel: string;
  radius: number;
  speed: number;
  offset: number;
  inclination: number;
  color: string;
  isRed?: boolean;
}

export const MedicalCore: React.FC<MedicalCoreProps> = ({
  isMobile = false,
  reducedMotion = false,
  activeNode,
  onHoverNode,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const outerCoreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Smooth mouse interpolation target
  const mouseTarget = useRef({ x: 0, y: 0 });

  // Healthcare Nodes Definition
  const nodes: NodeData[] = useMemo(
    () => [
      {
        key: 'care',
        label: 'CARE',
        sublabel: 'Patient-First Care',
        radius: isMobile ? 1.8 : 2.2,
        speed: 0.35,
        offset: 0,
        inclination: 0.2,
        color: '#0879A5',
      },
      {
        key: 'maternity',
        label: 'MATERNITY',
        sublabel: 'Dedicated Unit',
        radius: isMobile ? 2.1 : 2.6,
        speed: 0.25,
        offset: 1.25,
        inclination: -0.35,
        color: '#19A4CF',
      },
      {
        key: 'emergency',
        label: '24/7 SUPPORT',
        sublabel: 'Emergency & Triage',
        radius: isMobile ? 1.9 : 2.4,
        speed: 0.4,
        offset: 2.5,
        inclination: 0.45,
        color: '#D93636',
        isRed: true,
      },
      {
        key: 'specialists',
        label: 'SPECIALISTS',
        sublabel: 'Clinical Team',
        radius: isMobile ? 2.3 : 2.8,
        speed: 0.28,
        offset: 3.8,
        inclination: -0.15,
        color: '#0879A5',
      },
      {
        key: 'diagnostics',
        label: 'DIAGNOSTICS',
        sublabel: 'Clinical Support',
        radius: isMobile ? 2.0 : 2.5,
        speed: 0.32,
        offset: 5.0,
        inclination: 0.5,
        color: '#19A4CF',
      },
    ],
    [isMobile]
  );

  // Node position vectors ref to update lines
  const nodePositions = useRef<{ [key: string]: THREE.Vector3 }>({
    care: new THREE.Vector3(),
    maternity: new THREE.Vector3(),
    emergency: new THREE.Vector3(),
    specialists: new THREE.Vector3(),
    diagnostics: new THREE.Vector3(),
  });

  // Particle positions
  const particleCount = isMobile ? 40 : 80;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, [particleCount]);

  // Geometric Medical Cross inside core
  const crossGeometry = useMemo(() => {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({
      color: 0x0879a5,
      transparent: true,
      opacity: 0.75,
    });

    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.18), mat);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.18, 0.18), mat);
    group.add(vBar);
    group.add(hBar);
    return group;
  }, []);

  useFrame((state) => {
    if (reducedMotion) return;

    const time = state.clock.getElapsedTime();

    // Subtle pointer parallax response
    mouseTarget.current.x = THREE.MathUtils.lerp(mouseTarget.current.x, state.pointer.x * 0.25, 0.05);
    mouseTarget.current.y = THREE.MathUtils.lerp(mouseTarget.current.y, state.pointer.y * 0.25, 0.05);

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.08 + mouseTarget.current.x;
      groupRef.current.rotation.x = mouseTarget.current.y * 0.5;
    }

    // Core pulsing & gentle counter-rotation
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x = time * 0.15;
      innerCoreRef.current.rotation.y = -time * 0.2;
      const pulse = 1 + Math.sin(time * 1.5) * 0.03;
      innerCoreRef.current.scale.set(pulse, pulse, pulse);
    }

    if (outerCoreRef.current) {
      outerCoreRef.current.rotation.y = time * 0.1;
      outerCoreRef.current.rotation.z = time * 0.08;
    }

    // Concentric orbital rings rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = 0.35 + Math.sin(time * 0.3) * 0.05;
      ring1Ref.current.rotation.y = time * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -0.45 + Math.cos(time * 0.25) * 0.05;
      ring2Ref.current.rotation.y = -time * 0.18;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * 0.12;
      ring3Ref.current.rotation.x = Math.PI / 2.3;
    }

    // Particles gentle drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -time * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. CENTRAL TRANSLUCENT MEDICAL CORE */}
      <group ref={coreRef}>
        {/* Core Lattice Interior Mesh (Icosahedron) */}
        <mesh ref={innerCoreRef}>
          <icosahedronGeometry args={[0.7, 1]} />
          <meshStandardMaterial
            color="#0879A5"
            roughness={0.2}
            metalness={0.1}
            wireframe={true}
            transparent={true}
            opacity={0.35}
          />
        </mesh>

        {/* Outer Translucent Glass-like Shell */}
        <mesh ref={outerCoreRef}>
          <sphereGeometry args={[0.85, 24, 24]} />
          <meshPhysicalMaterial
            color="#E2F4F9"
            transmission={0.85}
            opacity={0.65}
            transparent={true}
            roughness={0.15}
            ior={1.35}
            thickness={0.6}
            specularColor="#FFFFFF"
            specularIntensity={0.9}
          />
        </mesh>

        {/* Central Core Glow Point Light */}
        <pointLight color="#19A4CF" intensity={1.8} distance={4} />

        {/* Embedded Precision Cross */}
        <primitive object={crossGeometry} />
      </group>

      {/* 2. THIN CONCENTRIC ORBITAL RINGS */}
      {/* Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[isMobile ? 1.7 : 2.1, 0.012, 16, 100]} />
        <meshBasicMaterial
          color="#0879A5"
          transparent={true}
          opacity={0.35}
        />
      </mesh>

      {/* Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[isMobile ? 2.0 : 2.5, 0.01, 16, 100]} />
        <meshBasicMaterial
          color="#19A4CF"
          transparent={true}
          opacity={0.3}
        />
      </mesh>

      {/* Ring 3 */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[isMobile ? 2.3 : 2.9, 0.008, 16, 100]} />
        <meshBasicMaterial
          color="#D6EAF1"
          transparent={true}
          opacity={0.45}
        />
      </mesh>

      {/* 3. HEALTHCARE ORBITAL NODES */}
      {nodes.map((node) => (
        <OrbitalNode
          key={node.key}
          node={node}
          reducedMotion={reducedMotion}
          isActive={activeNode === node.key}
          onHover={onHoverNode}
          onPositionUpdate={(pos) => {
            nodePositions.current[node.key] = pos;
          }}
        />
      ))}

      {/* 4. FINE FLOATING AMBIENT PARTICLES */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.03 : 0.045}
          color="#19A4CF"
          transparent={true}
          opacity={0.5}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};

interface OrbitalNodeProps {
  node: NodeData;
  reducedMotion: boolean;
  isActive: boolean;
  onHover: (key: string | null) => void;
  onPositionUpdate: (pos: THREE.Vector3) => void;
}

const OrbitalNode: React.FC<OrbitalNodeProps> = ({
  node,
  reducedMotion,
  isActive,
  onHover,
  onPositionUpdate,
}) => {
  const nodeRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const active = isActive || hovered;

  useFrame((state) => {
    if (reducedMotion) {
      // Static placement
      const angle = node.offset;
      const x = Math.cos(angle) * node.radius;
      const z = Math.sin(angle) * node.radius;
      const y = Math.sin(angle + node.inclination) * 0.4;
      if (nodeRef.current) {
        nodeRef.current.position.set(x, y, z);
        onPositionUpdate(nodeRef.current.position);
      }
      return;
    }

    const t = state.clock.getElapsedTime() * node.speed + node.offset;
    const x = Math.cos(t) * node.radius;
    const z = Math.sin(t) * node.radius;
    const y = Math.sin(t * 1.5) * (node.inclination * 0.8);

    if (nodeRef.current) {
      nodeRef.current.position.set(x, y, z);
      onPositionUpdate(nodeRef.current.position);
    }

    if (meshRef.current) {
      const targetScale = active ? 1.4 : 1.0;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <group
      ref={nodeRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(node.key);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
    >
      {/* Node Spherical Marker */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[node.isRed ? 0.09 : 0.08, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          roughness={0.2}
          metalness={0.2}
          emissive={node.color}
          emissiveIntensity={active ? 0.8 : 0.2}
        />
      </mesh>

      {/* Subtle Glowing Halo Ring around Node */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.11, 0.13, 16]} />
        <meshBasicMaterial
          color={node.color}
          transparent={true}
          opacity={active ? 0.7 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating 2.5D HTML Tag Marker on Hover */}
      {active && (
        <Html
          position={[0, 0.2, 0]}
          center
          distanceFactor={6}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D6EAF1] shadow-md text-center whitespace-nowrap">
            <div className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: node.color }}
              />
              <span className="font-mono text-[10px] font-bold text-[#103A50] tracking-wider">
                {node.label}
              </span>
            </div>
            <span className="text-[9px] font-sans text-[#617786] block">
              {node.sublabel}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};

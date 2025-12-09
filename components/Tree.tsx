import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Shape } from 'three';
import { OrnamentData, OrnamentType, TreeState } from '../types';
import Ornament from './Decorations';
import { Foliage } from './Foliage';
import { ChristmasLights } from './ChristmasLights';
import { Sparkles } from '@react-three/drei';

interface TreeProps {
  onOrnamentClick: (data: OrnamentData) => void;
  treeState: TreeState;
  activeOrnamentId: string | null;
}

// Helper: Random point in sphere
const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

export const Tree: React.FC<TreeProps> = ({ onOrnamentClick, treeState, activeOrnamentId }) => {
  const groupRef = useRef<Group>(null);

  // Procedural generation of ornaments
  const treeData = useMemo(() => {
    const layers = 6;
    const ornaments: OrnamentData[] = [];
    const height = 12;
    const baseRadius = 5;

    for (let i = 0; i < layers; i++) {
      const layerProgress = i / layers;
      const radius = baseRadius * (1 - layerProgress);
      const y = i * (height / layers) * 0.9; 
      
      // Density increases at bottom
      const ornamentCount = Math.floor(10 * (1 - layerProgress)) + 3;
      
      for (let j = 0; j < ornamentCount; j++) {
        const angle = (j / ornamentCount) * Math.PI * 2 + (i * 0.5);
        const x = Math.cos(angle) * (radius * 0.9);
        const z = Math.sin(angle) * (radius * 0.9);
        const ornamentY = y + 0.5 - 5; // -5 to center tree vertically

        let type = OrnamentType.GOLD;
        const rand = Math.random();
        
        // Distribution of Types
        // Higher probability of Hello Kitty in the upper part of the tree
        if (layerProgress > 0.45) {
             // Upper tree: High Kitty Density (50%)
             if (rand < 0.50) type = OrnamentType.KITTY;
             else if (rand < 0.65) type = OrnamentType.GIFT;
             else if (rand < 0.80) type = OrnamentType.LIGHT;
             else if (rand < 0.90) type = OrnamentType.RUBY;
             else type = OrnamentType.DIAMOND;
        } else {
             // Lower tree: Standard Distribution
             if (rand < 0.15) type = OrnamentType.KITTY;      // 15% Kitty
             else if (rand < 0.30) type = OrnamentType.GIFT;  // 15% Gifts
             else if (rand < 0.50) type = OrnamentType.LIGHT; // 20% Lights
             else if (rand < 0.65) type = OrnamentType.RUBY;
             else if (rand < 0.80) type = OrnamentType.DIAMOND;
             else type = OrnamentType.EMERALD;
        }

        const chaosPos = getRandomSpherePoint(20);

        ornaments.push({
          id: `ornament-${i}-${j}`,
          position: [x, ornamentY, z],
          chaosPosition: chaosPos,
          type,
          // Updated Scale Logic: significantly more variance (0.2 to 0.55)
          scale: type === OrnamentType.GIFT ? 0.3 : (0.2 + Math.random() * 0.35)
        });
      }
    }
    return { ornaments };
  }, []);

  const starShape = useMemo(() => {
    const shape = new Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.4;
    const angleOffset = Math.PI / 2;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - angleOffset;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  useFrame((state) => {
    if (groupRef.current && treeState === 'FORMED') {
      // Gentle tree rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      
      {/* 1. Shader-based Foliage System */}
      <Foliage treeState={treeState} />

      {/* 2. Delicate Fairy Lights */}
      <ChristmasLights treeState={treeState} />

      {/* 3. Ornaments (Dual Position System handled internally) */}
      {treeData.ornaments.map((ornament) => (
        <Ornament 
          key={ornament.id} 
          data={ornament} 
          onClick={onOrnamentClick} 
          treeState={treeState}
          isActive={activeOrnamentId === ornament.id}
        />
      ))}

      {/* 4. Tinsel / Sparkles (Pink) */}
      <Sparkles 
        count={150} 
        scale={treeState === 'CHAOS' ? [30, 30, 30] : [10, 14, 10]} 
        position={[0, 1, 0]} 
        size={6} 
        speed={0.2} 
        opacity={0.6} 
        color="#ffb7c5" // Pink glow color
      />

      {/* 5. Gold Luxury Glitter */}
      <Sparkles 
        count={500} 
        scale={treeState === 'CHAOS' ? [30, 30, 30] : [11, 13, 11]} 
        position={[0, 0, 0]} 
        size={2} 
        speed={0.4} 
        opacity={0.5} 
        noise={0.2}
        color="#FCD37B" 
      />

      {/* 6. Star Topper (Only visible in formed state) */}
      <group visible={treeState === 'FORMED'}>
        <mesh position={[0, 7.5, -0.25]}>
           <extrudeGeometry args={[starShape, { depth: 0.5, bevelEnabled: false }]} />
           <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={2} 
              toneMapped={false}
           />
        </mesh>
        <pointLight position={[0, 7.5, 0]} color="#FCD37B" intensity={10} distance={10} />
      </group>
    </group>
  );
};
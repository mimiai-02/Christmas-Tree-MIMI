import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface ChristmasLightsProps {
  treeState: TreeState;
}

export const ChristmasLights: React.FC<ChristmasLightsProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 500; // Increased count for fairy light density
  const tempObject = new THREE.Object3D();
  const progress = useRef(treeState === 'FORMED' ? 1 : 0);

  const { formedData, chaosData, colorData } = useMemo(() => {
    const formed = [];
    const chaos = [];
    const colors = new Float32Array(count * 3);
    
    // Helper: Random point in chaos sphere
    const getChaosPos = () => {
        const r = 15 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        return new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    };

    // Spiral Generation with organic offset
    for (let i = 0; i < count; i++) {
        const t = i / count;
        // Height from bottom (-5) to top (6.5)
        const h = -5 + t * 11.5;
        // Spiral angle - tighter spiral for density
        const angle = t * Math.PI * 40; 
        // Radius at height h (Conical taper)
        const r = 5.3 * (1 - (h + 5) / 12) + 0.2;

        // Small noise to make the string look draped/organic
        const noiseX = (Math.random() - 0.5) * 0.25;
        const noiseY = (Math.random() - 0.5) * 0.25;
        const noiseZ = (Math.random() - 0.5) * 0.25;

        const x = Math.cos(angle) * r + noiseX;
        const z = Math.sin(angle) * r + noiseZ;
        const y = h + noiseY;

        formed.push(new THREE.Vector3(x, y, z));
        chaos.push(getChaosPos());

        // Color Logic: Subtle White and Gold
        const color = new THREE.Color();
        const isGold = Math.random() > 0.7; // 30% Gold, 70% White
        
        if (isGold) {
            color.set('#FCD37B').multiplyScalar(1.5); // Soft Gold glow
        } else {
            color.set('#FFF8E7').multiplyScalar(1.2); // Warm White glow
        }
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    return { formedData: formed, chaosData: chaos, colorData: colors };
  }, []);

  useLayoutEffect(() => {
     if (meshRef.current) {
         for (let i = 0; i < count; i++) {
            const c = new THREE.Color(colorData[i*3], colorData[i*3+1], colorData[i*3+2]);
            meshRef.current.setColorAt(i, c);
         }
         if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
     }
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = treeState === 'FORMED' ? 1 : 0;
    const speed = 1.0 * delta;
    
    if (Math.abs(progress.current - target) > 0.0001) {
        if (progress.current < target) progress.current += speed;
        else progress.current -= speed;
        if (progress.current > 1) progress.current = 1;
        if (progress.current < 0) progress.current = 0;
    }

    const p = progress.current;
    const t = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

    for (let i = 0; i < count; i++) {
        const currentPos = new THREE.Vector3().lerpVectors(chaosData[i], formedData[i], t);
        
        if (p < 1 && p > 0) {
             const spin = (1 - t) * 5.0;
             const angle = Math.atan2(currentPos.z, currentPos.x) + spin * delta;
             const radius = Math.sqrt(currentPos.x * currentPos.x + currentPos.z * currentPos.z);
             currentPos.x = Math.cos(angle) * radius;
             currentPos.z = Math.sin(angle) * radius;
        }

        tempObject.position.copy(currentPos);
        
        // Very subtle, slow breathing twinkle
        const twinkleSpeed = 0.5 + Math.random() * 0.5; 
        const phase = i * 10;
        const pulse = Math.sin(state.clock.elapsedTime * twinkleSpeed + phase) * 0.15 + 0.85;
        const chaosDim = 0.4 + 0.6 * t;
        
        tempObject.scale.setScalar(pulse * chaosDim);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Significantly smaller size for "fairy light" effect */}
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};
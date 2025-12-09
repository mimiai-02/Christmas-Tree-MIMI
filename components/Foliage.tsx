import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface FoliageProps {
  treeState: TreeState;
}

// Shader Material Definition
const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 1 }, // 0 = Chaos, 1 = Formed
    uColorBase: { value: new THREE.Color('#023020') },
    uColorAccent: { value: new THREE.Color('#C5A059') }
  },
  vertexShader: `
    uniform float uProgress;
    uniform float uTime;
    attribute vec3 aChaosPos;
    attribute float aSize;
    attribute float aRandom;
    attribute float aType; // 0.0 = Foliage, 1.0 = Trunk
    varying vec3 vColor;
    varying float vAlpha;

    // Cubic Ease Out
    float easeOut(float t) {
      return 1.0 - pow(1.0 - t, 3.0);
    }

    void main() {
      float t = easeOut(uProgress);
      
      // Interpolate position
      vec3 pos = mix(aChaosPos, position, t);
      
      // Chaos drift
      if (uProgress < 0.95) {
         float noise = sin(uTime * 0.5 + aRandom * 10.0);
         pos += vec3(noise * 0.5, noise * 0.5, cos(noise)) * (1.0 - t);
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      // Trunk particles are slightly simpler, Foliage has standard size
      float sizeMultiplier = (aType > 0.5) ? 90.0 : 80.0;
      gl_PointSize = aSize * (sizeMultiplier / -mvPosition.z);
      
      gl_Position = projectionMatrix * mvPosition;
      
      // Color mixing based on type and randomness
      vec3 emerald = vec3(0.01, 0.19, 0.125);
      vec3 gold = vec3(0.77, 0.63, 0.35);
      vec3 trunkColor = vec3(0.24, 0.15, 0.10); // #3D2619 Dark Wood
      
      if (aType > 0.5) {
          // Trunk: Mix brown shades
          vColor = mix(trunkColor, vec3(0.15, 0.1, 0.05), aRandom * 0.4);
          vAlpha = 0.95;
      } else {
          // Foliage: Mostly green, some gold
          vColor = mix(emerald, gold, aRandom * 0.3);
          vAlpha = 0.8 + 0.2 * sin(uTime + aRandom * 10.0);
      }
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Soft particle
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float r = length(xy);
      if (r > 0.5) discard;

      // Glowy center
      float strength = 1.0 - (r * 2.0);
      strength = pow(strength, 1.5);

      gl_FragColor = vec4(vColor, vAlpha * strength);
    }
  `
};

export const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const chaosPositions = [];
    const sizes = [];
    const randoms = [];
    const types = []; // 0 for foliage, 1 for trunk

    const foliageCount = 12000;
    const trunkCount = 1200; // Reduced from 4000 for practical density
    
    // 1. Generate Foliage (The Cone)
    for (let i = 0; i < foliageCount; i++) {
       // --- FORMED SHAPE (Cone) ---
       const h = Math.random() * 12; // Height 0 to 12
       const y = h - 6; // Center vertically
       
       // Cone radius at this height (tapering to top)
       const progress = (y + 6) / 12; // 0 to 1
       const maxRadius = 5.5 * (1.0 - progress);
       
       // Volume distribution with bias towards surface for "fullness"
       // r = radius * sqrt(random) gives uniform disk.
       // r = radius * pow(random, 0.3) pushes points out.
       const r = maxRadius * Math.pow(Math.random(), 0.4);
       const theta = Math.random() * Math.PI * 2;
       
       const x = r * Math.cos(theta);
       const z = r * Math.sin(theta);
       
       positions.push(x, y, z);
       types.push(0.0); // Foliage
       
       sizes.push(Math.random() * 0.6 + 0.4); // Standard size
    }

    // 2. Generate Trunk (The Core)
    for (let i = 0; i < trunkCount; i++) {
        // Trunk extends from bottom to near top, but thickest at bottom
        const h = Math.random() * 11; // 0 to 11
        const y = h - 6.5; // Starts a bit lower
        
        // Slight taper for trunk too
        const trunkProgress = h / 11;
        const maxTrunkRadius = 0.6 * (1.0 - trunkProgress * 0.6); // Slightly thinner radius too (0.8 -> 0.6)
        
        const r = Math.sqrt(Math.random()) * maxTrunkRadius;
        const theta = Math.random() * Math.PI * 2;
        
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        
        positions.push(x, y, z);
        types.push(1.0); // Trunk
        
        sizes.push(Math.random() * 0.4 + 0.6); // Slightly chunkier
    }

    // Common attributes for all
    for (let i = 0; i < (foliageCount + trunkCount); i++) {
       // --- CHAOS SHAPE (Sphere shell) ---
       // Random point in large sphere
       const u = Math.random();
       const v = Math.random();
       const phi = Math.acos(2 * v - 1);
       const sphereTheta = 2 * Math.PI * u;
       const sphereR = 15 + Math.random() * 10;
       
       const cx = sphereR * Math.sin(phi) * Math.cos(sphereTheta);
       const cy = sphereR * Math.sin(phi) * Math.sin(sphereTheta);
       const cz = sphereR * Math.cos(phi);
       
       chaosPositions.push(cx, cy, cz);
       randoms.push(Math.random());
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aChaosPos', new THREE.Float32BufferAttribute(chaosPositions, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 1));
    geo.setAttribute('aType', new THREE.Float32BufferAttribute(types, 1));
    
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const target = treeState === 'FORMED' ? 1 : 0;
      // Smooth interpolation of the uniform
      const current = materialRef.current.uniforms.uProgress.value;
      const speed = 1.5 * delta;
      
      if (Math.abs(current - target) > 0.001) {
          materialRef.current.uniforms.uProgress.value += (target - current) * speed;
      }
    }
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial 
        ref={materialRef}
        attach="material"
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
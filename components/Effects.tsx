import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';

export const Effects: React.FC = () => {
  return (
    <EffectComposer>
      {/* 
         Bloom Settings for "Pink Halo":
         - luminanceThreshold: 1.1 (Allows softer colors to glow)
         - intensity: 1.8 (Distinctive halo)
      */}
      <Bloom 
        luminanceThreshold={1.1} 
        mipmapBlur 
        intensity={1.8} 
        radius={0.5}
        luminanceSmoothing={0.3}
      />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      <Noise opacity={0.02} />
    </EffectComposer>
  );
};
import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Loader } from '@react-three/drei';
import * as THREE from 'three';
import { Tree } from './components/Tree';
import { Lights } from './components/Lights';
import { Effects } from './components/Effects';
import { Overlay } from './components/Overlay';
import { GestureController } from './components/GestureController';
import { generateLuxuryFortune } from './services/geminiService';
import { OrnamentData, FortuneResponse, TreeState } from './types';

// Rig Component to move the Scene based on mouse position (Parallax)
const SceneRig: React.FC<{ offsetRef: React.MutableRefObject<{x: number, y: number}>, children: React.ReactNode }> = ({ offsetRef, children }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(() => {
        if (groupRef.current && offsetRef.current) {
            // Lerp rotation for smooth head-tracking feel
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, offsetRef.current.x * 0.05, 0.05);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -offsetRef.current.y * 0.05, 0.05);
        }
    });
    return <group ref={groupRef}>{children}</group>;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fortune, setFortune] = useState<FortuneResponse | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [treeState, setTreeState] = useState<TreeState>('FORMED');
  const [activeOrnamentId, setActiveOrnamentId] = useState<string | null>(null);
  
  // Gesture / Parallax Ref (Performance optimized: no re-renders)
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleOrnamentClick = async (data: OrnamentData) => {
    if (loading || fortune) return; // Prevent multiple clicks

    setActiveOrnamentId(data.id);
    setLoading(true);
    const result = await generateLuxuryFortune(data.type);
    setFortune(result);
    setLoading(false);
  };

  const closeFortune = () => {
    setFortune(null);
    setActiveOrnamentId(null);
  };

  const toggleTreeState = () => {
    setTreeState(prev => prev === 'FORMED' ? 'CHAOS' : 'FORMED');
  };

  return (
    <div className="w-full h-full relative bg-luxury-black">
      <Overlay 
        loading={loading} 
        fortune={fortune} 
        onClose={closeFortune}
        showIntro={showIntro}
        onStart={() => setShowIntro(false)}
        treeState={treeState}
        toggleTreeState={toggleTreeState}
      />

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2, 22], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.5 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 10, 50]} />

          {/* Gesture Controller (Visuals + Logic) */}
          <GestureController 
            offsetRef={offsetRef} 
            chaosLevel={treeState === 'CHAOS' ? 1 : 0} 
          />

          {/* Scene Rig handles the parallax movement of the tree group */}
          <SceneRig offsetRef={offsetRef}>
             <group position={[0, -2, 0]}>
                <Tree 
                  onOrnamentClick={handleOrnamentClick} 
                  treeState={treeState} 
                  activeOrnamentId={activeOrnamentId}
                />
                <ContactShadows opacity={0.4} scale={20} blur={2.5} far={4} color="#000000" />
             </group>
             <Lights />
          </SceneRig>
          
          {/* Environment map for gold reflections */}
          <Environment preset="city" />
          
          <Effects />
          
          <OrbitControls 
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.8}
            minDistance={8}
            maxDistance={35}
            // Auto rotate only when idle and mouse is near center
            autoRotate={!showIntro && !fortune && treeState === 'FORMED'}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
      <Loader 
        containerStyles={{ backgroundColor: '#000' }}
        innerStyles={{ width: '200px', height: '2px', backgroundColor: '#333' }}
        barStyles={{ height: '2px', backgroundColor: '#C5A059' }}
        dataStyles={{ color: '#C5A059', fontFamily: 'Cinzel', fontSize: '14px' }}
      />
    </div>
  );
};

export default App;
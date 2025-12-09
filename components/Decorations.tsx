import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { OrnamentData, OrnamentType, TreeState } from '../types';
import { Sparkles } from '@react-three/drei';

interface OrnamentProps {
  data: OrnamentData;
  onClick: (data: OrnamentData) => void;
  treeState: TreeState;
  isActive: boolean;
}

// String component for hanging ornaments
const OrnamentString: React.FC<{ height: number }> = ({ height }) => (
  <mesh position={[0, height / 2, 0]}>
    <cylinderGeometry args={[0.02, 0.02, height]} />
    <meshBasicMaterial color="#C5A059" />
  </mesh>
);

// Iconic Hello Kitty Head Shape - Adjusted to hang
const KittyShape: React.FC<{ emissive: string, hovered: boolean }> = ({ emissive, hovered }) => {
  const white = "#FFFFFF";
  const bowPink = "#FF69B4";
  const noseYellow = "#FFD700";
  const eyeBlack = "#111111";
  
  const baseMaterial = (
    <meshStandardMaterial 
      color={white} 
      roughness={0.25} 
      metalness={0.1}
      emissive={emissive}
      emissiveIntensity={hovered ? 0.4 : 0.0}
    />
  );

  // Shift content down so (0,0,0) is at the top of the head (pivot point)
  return (
    <group scale={[1.3, 1.3, 1.3]}>
       {/* String connecting to pivot */}
       <OrnamentString height={0.6} />
       
       <group position={[0, -0.6, 0]}>
          {/* Head */}
          <mesh position={[0, 0, 0]} scale={[1.25, 0.95, 0.85]}>
            <sphereGeometry args={[0.6, 32, 32]} />
            {baseMaterial}
          </mesh>
          {/* Ears */}
          <mesh position={[-0.55, 0.45, 0]} rotation={[0, 0, 0.5]} scale={[1, 1, 0.8]}>
            <coneGeometry args={[0.2, 0.35, 32]} />
             {baseMaterial}
          </mesh>
          <mesh position={[0.55, 0.45, 0]} rotation={[0, 0, -0.5]} scale={[1, 1, 0.8]}>
            <coneGeometry args={[0.2, 0.35, 32]} />
             {baseMaterial}
          </mesh>

          {/* Face Details */}
          <group position={[0, -0.05, 0.48]}> 
            <mesh position={[-0.28, 0, 0]} scale={[0.8, 1.1, 0.5]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={eyeBlack} roughness={0.1} metalness={0.2} />
            </mesh>
            <mesh position={[0.28, 0, 0]} scale={[0.8, 1.1, 0.5]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={eyeBlack} roughness={0.1} metalness={0.2} />
            </mesh>
            <mesh position={[0, -0.12, 0.05]} scale={[1.2, 0.8, 0.5]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color={noseYellow} roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Whiskers */}
            <group position={[0.42, -0.05, -0.06]} rotation={[0, 0.35, 0]}>
               {[0.12, 0, -0.12].map((y, i) => (
                   <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2 + (0.15 * (1-i))]}>
                      <capsuleGeometry args={[0.02, 0.22, 4, 8]} />
                      <meshStandardMaterial color={eyeBlack} roughness={0.8} />
                   </mesh>
               ))}
            </group>
             <group position={[-0.42, -0.05, -0.06]} rotation={[0, -0.35, 0]}>
               {[0.12, 0, -0.12].map((y, i) => (
                   <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2 - (0.15 * (1-i))]}>
                      <capsuleGeometry args={[0.02, 0.22, 4, 8]} />
                      <meshStandardMaterial color={eyeBlack} roughness={0.8} />
                   </mesh>
               ))}
            </group>
          </group>

          {/* Bow */}
          <group position={[0.45, 0.5, 0.2]} rotation={[0, 0, -0.4]} scale={0.9}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={bowPink} roughness={0.3} />
            </mesh>
            <mesh position={[0.18, 0.05, 0]} rotation={[0, 0, -0.3]} scale={[1, 0.8, 0.6]}>
               <sphereGeometry args={[0.15, 16, 16]} />
               <meshStandardMaterial color={bowPink} roughness={0.3} />
            </mesh>
            <mesh position={[-0.18, 0.05, 0]} rotation={[0, 0, 0.3]} scale={[1, 0.8, 0.6]}>
               <sphereGeometry args={[0.15, 16, 16]} />
               <meshStandardMaterial color={bowPink} roughness={0.3} />
            </mesh>
          </group>
      </group>
    </group>
  );
}

const PhotoOrnament: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    // Offset for hanging
    const hangOffset = -0.8;
    return (
        <group>
            <OrnamentString height={0.8} />
            <group position={[0, hangOffset, 0]}>
                {/* White Frame */}
                <mesh>
                    <boxGeometry args={[1.2, 1.4, 0.05]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.5} />
                </mesh>
                {/* Black Photo Backing */}
                <mesh position={[0, 0.1, 0.03]}>
                    <planeGeometry args={[1.0, 1.0]} />
                    <meshStandardMaterial color="#111" roughness={0.1} metalness={0.2} />
                </mesh>
                {/* Glossy Photo Surface */}
                 <mesh position={[0, 0.1, 0.031]}>
                    <planeGeometry args={[1.0, 1.0]} />
                    <meshStandardMaterial 
                        color={isActive ? "#fff" : "#ddd"} 
                        roughness={0.0} 
                        metalness={0.1}
                        emissive={isActive ? "#fff" : "#000"}
                        emissiveIntensity={isActive ? 0.5 : 0}
                    />
                </mesh>
            </group>
        </group>
    )
}


const Ornament: React.FC<OrnamentProps> = ({ data, onClick, treeState, isActive }) => {
  const meshRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const targetPos = useMemo(() => new Vector3(), []);
  const currentPos = useMemo(() => new Vector3(...data.chaosPosition), [data.chaosPosition]); 
  
  const weight = data.type === OrnamentType.LIGHT ? 5.0 : 2.5;

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (treeState === 'FORMED') {
        targetPos.set(...data.position);
      } else {
        targetPos.set(...data.chaosPosition);
      }

      currentPos.lerp(targetPos, delta * weight);
      meshRef.current.position.copy(currentPos);

      if (treeState === 'FORMED') {
         // SWAY ANIMATION (Pendulum physics simulation)
         // Instead of spinning, we sway based on time and position seed
         const time = state.clock.elapsedTime;
         const seed = data.position[0] * 10 + data.position[2] * 5;
         
         // Slower, heavy sway
         const swayAmount = 0.15;
         const swaySpeed = 1.5;
         
         // Pendulum motion on Z (Left/Right) and X (Forward/Back)
         const rotZ = Math.sin(time * swaySpeed + seed) * swayAmount;
         const rotX = Math.cos(time * (swaySpeed * 0.8) + seed) * (swayAmount * 0.5);
         
         // Apply rotation
         // We keep a slow Y rotation for "twisting" on the string
         meshRef.current.rotation.x = rotX;
         meshRef.current.rotation.z = rotZ;
         meshRef.current.rotation.y += 0.005; 

      } else {
         meshRef.current.rotation.x += delta * 0.5;
         meshRef.current.rotation.z += delta * 0.2;
      }
      
      const baseScale = data.type === OrnamentType.KITTY ? data.scale * 1.5 : data.scale;
      
      let targetScale = baseScale;
      
      if (isActive) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.15;
        targetScale = baseScale * 1.4 * pulse;
      } else if (hovered) {
        targetScale = baseScale * 1.3;
      }

      meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);
    }
  });

  const getColor = (type: OrnamentType) => {
    switch (type) {
      case OrnamentType.GOLD: return '#FCD37B';
      case OrnamentType.RUBY: return '#8B0000';
      case OrnamentType.EMERALD: return '#004d25';
      case OrnamentType.DIAMOND: return '#E0FFFF'; 
      case OrnamentType.KITTY: return '#FFFFFF'; 
      case OrnamentType.GIFT: return '#C5A059'; 
      case OrnamentType.LIGHT: return '#FFFDD0'; 
      case OrnamentType.PHOTO: return '#FFFFFF';
      default: return '#FCD37B';
    }
  };

  const getEmissive = (type: OrnamentType) => {
     switch (type) {
      case OrnamentType.GOLD: return '#C5A059';
      case OrnamentType.RUBY: return '#440000';
      case OrnamentType.EMERALD: return '#002200';
      case OrnamentType.DIAMOND: return '#222222';
      case OrnamentType.KITTY: return '#FFB7C5';
      case OrnamentType.LIGHT: return '#FFFDD0';
      case OrnamentType.GIFT: return '#664400';
      default: return '#000000';
    }
  }

  const isKitty = data.type === OrnamentType.KITTY;
  const isLight = data.type === OrnamentType.LIGHT;
  const isPhoto = data.type === OrnamentType.PHOTO;

  return (
    <group
      ref={meshRef}
      position={data.chaosPosition} 
      onClick={(e) => {
        e.stopPropagation();
        if (treeState === 'FORMED') onClick(data);
      }}
      onPointerOver={() => {
        if (treeState === 'FORMED') {
            document.body.style.cursor = 'pointer';
            setHovered(true);
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
        setHovered(false);
      }}
    >
      {isKitty ? (
        <KittyShape emissive={getEmissive(data.type)} hovered={hovered || isActive} />
      ) : isLight ? (
         <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
                color="#ffffff" 
                emissive="#FFFDD0" 
                emissiveIntensity={4} 
                toneMapped={false} 
            />
            <pointLight distance={3} intensity={5} color="#FFFDD0" decay={2} />
         </mesh>
      ) : isPhoto ? (
         <PhotoOrnament isActive={isActive || hovered} />
      ) : (
        <group>
            {/* Standard Ornament Pivot Offset */}
            <OrnamentString height={0.7} />
            <group position={[0, -0.7, 0]}>
                <mesh>
                  {data.type === OrnamentType.RUBY && <octahedronGeometry args={[1, 0]} />}
                  {data.type === OrnamentType.EMERALD && <cylinderGeometry args={[0.6, 0.6, 1, 6]} />}
                  {data.type === OrnamentType.DIAMOND && <icosahedronGeometry args={[1, 0]} />}
                  {(data.type === OrnamentType.GIFT || data.type === OrnamentType.GOLD) && <dodecahedronGeometry args={[1, 0]} />}
                  
                  <meshStandardMaterial 
                    color={getColor(data.type)} 
                    metalness={0.9} 
                    roughness={0.1}
                    emissive={getEmissive(data.type)}
                    emissiveIntensity={hovered || isActive ? 0.6 : 0.15}
                    envMapIntensity={3}
                    flatShading={true} 
                  />
                </mesh>
            </group>
        </group>
      )}
      
      {(hovered || isActive) && treeState === 'FORMED' && !isLight && (
        <group position={[0, -1, 0]}> {/* Shift sparkles down to match new geometry center */}
            {!isActive && (
                <Sparkles 
                count={8} 
                scale={2} 
                size={3} 
                speed={0.4} 
                opacity={1} 
                color={isKitty ? '#ff69b4' : getColor(data.type)} 
                />
            )}

            {isActive && (
                <group>
                    <Sparkles count={20} scale={2.5} size={6} speed={2} opacity={1} color="#FFFFFF" />
                    <Sparkles count={20} scale={2.0} size={4} speed={1.5} opacity={0.8} color="#FCD37B" />
                </group>
            )}
        </group>
      )}
    </group>
  );
};

export default Ornament;
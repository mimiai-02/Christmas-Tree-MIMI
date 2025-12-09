import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface GestureControllerProps {
  offsetRef: React.MutableRefObject<{ x: number, y: number }>;
  chaosLevel: number;
}

export const GestureController: React.FC<GestureControllerProps> = ({ offsetRef, chaosLevel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }
      } catch (e) {
        console.warn("Camera access denied or unavailable", e);
      }
    };
    setupCamera();
  }, []);

  useFrame((state) => {
    // Map mouse position to camera offset for parallax effect
    // x: -1 to 1, y: -1 to 1
    if (offsetRef.current) {
        offsetRef.current.x = state.mouse.x * 5; 
        offsetRef.current.y = state.mouse.y * 2;
    }
  });

  return (
    <Html position={[0, 0, 0]} style={{ pointerEvents: 'none', width: '100%', height: '100%' }} zIndexRange={[100, 0]} calculatePosition={() => [0, 0, 0]}>
      <div className="fixed top-20 right-4 w-32 h-24 border-2 border-luxury-gold rounded overflow-hidden shadow-[0_0_20px_#C5A059] z-50 bg-luxury-black/80">
        <video 
            ref={videoRef} 
            className="w-full h-full object-cover opacity-60 mix-blend-screen grayscale contrast-125" 
            muted 
            playsInline 
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <div className="w-full h-[1px] bg-green-500/50 absolute top-1/2"></div>
             <div className="h-full w-[1px] bg-green-500/50 absolute left-1/2"></div>
             <span className={`text-[8px] font-mono mt-16 ${chaosLevel > 0.5 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                {chaosLevel > 0.5 ? 'SIGNAL: UNLEASHED' : 'SIGNAL: SECURE'}
             </span>
        </div>
        {/* Corner markers */}
        <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-luxury-gold"></div>
        <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-luxury-gold"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-luxury-gold"></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-luxury-gold"></div>
      </div>
    </Html>
  );
};
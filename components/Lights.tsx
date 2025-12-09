import React from 'react';

export const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.2} color="#023020" />
      <spotLight
        position={[10, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={200}
        color="#FCD37B"
        castShadow
        shadow-bias={-0.0001}
      />
      <pointLight position={[-10, 5, -10]} intensity={50} color="#ff0000" />
      <pointLight position={[0, -5, 5]} intensity={20} color="#C5A059" />
    </>
  );
};

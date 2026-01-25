import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface StorageCellMeshProps {
  position: [number, number, number];
  size: [number, number, number];
  number: number;
  isAvailable: boolean;
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: (hover: boolean) => void;
}

const StorageCellMesh = ({ 
  position, 
  size, 
  number, 
  isAvailable, 
  isHovered,
  isSelected,
  onClick,
  onHover 
}: StorageCellMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Purple color for doors (like in the photos)
  const doorColor = isAvailable 
    ? (isHovered ? '#9b87f5' : '#8B5CF6') 
    : '#6b7280';
  
  // Yellow accent for numbers
  const accentColor = '#FBBF24';
  
  // Animate on hover
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isHovered ? 1.02 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      {/* Main cell body (silver/white frame) */}
      <mesh position={[0, size[1] / 2, 0]}>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Door (purple) */}
      <mesh 
        ref={meshRef}
        position={[0, size[1] / 2, size[2] / 2 + 0.02]}
        onClick={onClick}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
      >
        <boxGeometry args={[size[0] - 0.1, size[1] - 0.1, 0.05]} />
        <meshStandardMaterial 
          color={doorColor} 
          metalness={0.2} 
          roughness={0.5}
          emissive={isSelected ? accentColor : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {/* Number on door */}
      <Text
        position={[0, size[1] / 2 + 0.1, size[2] / 2 + 0.08]}
        fontSize={Math.min(size[0], size[1]) * 0.4}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Montserrat-Bold.ttf"
      >
        {number}
      </Text>
      
      {/* Horizontal lines on door (like in photos) */}
      {[0.3, 0.5, 0.7].map((ratio, i) => (
        <mesh 
          key={i}
          position={[0, size[1] * ratio, size[2] / 2 + 0.03]}
        >
          <boxGeometry args={[size[0] - 0.15, 0.02, 0.01]} />
          <meshStandardMaterial color="#7c3aed" metalness={0.1} roughness={0.8} />
        </mesh>
      ))}
      
      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, size[1] / 2, size[2] / 2 + 0.05]}>
          <ringGeometry args={[Math.max(size[0], size[1]) * 0.45, Math.max(size[0], size[1]) * 0.5, 32]} />
          <meshBasicMaterial color={accentColor} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

interface WarehouseSceneProps {
  selectedCell: string | null;
  onSelectCell: (id: string | null) => void;
}

const WarehouseScene = ({ selectedCell, onSelectCell }: WarehouseSceneProps) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  
  // Sample cells layout based on the warehouse plan
  const cells = [
    // Row 1 - Large cells
    { id: '1', pos: [-4, 0, -2] as [number, number, number], size: [1.4, 2.4, 1.8] as [number, number, number], available: true },
    { id: '2', pos: [-2.4, 0, -2] as [number, number, number], size: [1.4, 2.4, 1.8] as [number, number, number], available: false },
    { id: '3', pos: [-0.8, 0, -2] as [number, number, number], size: [1.4, 2.4, 1.8] as [number, number, number], available: true },
    { id: '4', pos: [0.8, 0, -2] as [number, number, number], size: [1.4, 2.4, 1.8] as [number, number, number], available: true },
    { id: '5', pos: [2.4, 0, -2] as [number, number, number], size: [1.4, 2.4, 1.8] as [number, number, number], available: false },
    
    // Row 2 - Medium cells bottom
    { id: '6', pos: [-4, 0, 1] as [number, number, number], size: [1.1, 1.4, 1.4] as [number, number, number], available: true },
    { id: '7', pos: [-2.8, 0, 1] as [number, number, number], size: [1.1, 1.4, 1.4] as [number, number, number], available: true },
    { id: '8', pos: [-1.6, 0, 1] as [number, number, number], size: [1.1, 1.4, 1.4] as [number, number, number], available: false },
    { id: '9', pos: [-0.4, 0, 1] as [number, number, number], size: [1.1, 1.4, 1.4] as [number, number, number], available: true },
    
    // Row 2 - Medium cells top tier
    { id: '22', pos: [-4, 1.5, 1] as [number, number, number], size: [0.9, 1.0, 1.2] as [number, number, number], available: true },
    { id: '23', pos: [-3, 1.5, 1] as [number, number, number], size: [0.9, 1.0, 1.2] as [number, number, number], available: false },
    
    // Large cell
    { id: '10', pos: [2, 0, 1] as [number, number, number], size: [1.8, 2.4, 2.5] as [number, number, number], available: true },
  ];
  
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.9} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 2, -5]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.95} />
      </mesh>
      <mesh position={[-6, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[15, 5, 0.2]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.95} />
      </mesh>
      
      {/* Ceiling pipes */}
      {[-3, 0, 3].map((x, i) => (
        <mesh key={i} position={[x, 4.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 15, 16]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      
      {/* Storage cells */}
      {cells.map((cell) => (
        <StorageCellMesh
          key={cell.id}
          position={cell.pos}
          size={cell.size}
          number={parseInt(cell.id)}
          isAvailable={cell.available}
          isHovered={hoveredCell === cell.id}
          isSelected={selectedCell === cell.id}
          onClick={() => onSelectCell(selectedCell === cell.id ? null : cell.id)}
          onHover={(hover) => setHoveredCell(hover ? cell.id : null)}
        />
      ))}
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 4, 0]} intensity={0.5} color="#ffffff" />
      <pointLight position={[5, 4, 0]} intensity={0.5} color="#ffffff" />
    </>
  );
};

interface StorageUnit3DProps {
  selectedCell: string | null;
  onSelectCell: (id: string | null) => void;
}

const StorageUnit3D = ({ selectedCell, onSelectCell }: StorageUnit3DProps) => {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-b from-secondary to-muted">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 6, 10]} fov={50} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2 - 0.1}
          target={[0, 1, 0]}
        />
        <WarehouseScene selectedCell={selectedCell} onSelectCell={onSelectCell} />
        <Environment preset="warehouse" />
      </Canvas>
    </div>
  );
};

export default StorageUnit3D;

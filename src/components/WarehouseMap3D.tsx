import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { warehouseCells } from '@/data/warehouseLayout';

interface CellMeshProps {
  position: [number, number, number];
  size: [number, number, number];
  number: number;
  cellId: string;
  isAvailable: boolean;
  isHovered: boolean;
  isSelected: boolean;
  tier: number;
  onClick: () => void;
  onHover: (hover: boolean) => void;
}

const CellMesh = ({ 
  position, 
  size, 
  number, 
  cellId,
  isAvailable, 
  isHovered,
  isSelected,
  tier,
  onClick,
  onHover 
}: CellMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Цвета согласно бренду
  const availableColor = '#8B5CF6'; // primary purple
  const occupiedColor = '#6b7280'; // gray
  const selectedColor = '#FBBF24'; // accent yellow
  const hoverColor = '#a78bfa'; // lighter purple
  
  const doorColor = useMemo(() => {
    if (isSelected) return selectedColor;
    if (isHovered && isAvailable) return hoverColor;
    return isAvailable ? availableColor : occupiedColor;
  }, [isSelected, isHovered, isAvailable]);
  
  // Анимация при hover
  useFrame(() => {
    if (meshRef.current) {
      const targetZ = isHovered ? 0.1 : 0;
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        targetZ,
        0.1
      );
    }
  });

  return (
    <group position={position}>
      {/* Корпус ячейки (белый/серебристый) */}
      <mesh position={[0, size[1] / 2, 0]}>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial 
          color="#e5e7eb" 
          metalness={0.2} 
          roughness={0.8} 
        />
      </mesh>
      
      {/* Дверь (фиолетовая) */}
      <mesh 
        ref={meshRef}
        position={[0, size[1] / 2, size[2] / 2 + 0.02]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[size[0] - 0.08, size[1] - 0.08, 0.06]} />
        <meshStandardMaterial 
          color={doorColor} 
          metalness={0.3} 
          roughness={0.4}
          emissive={isSelected ? selectedColor : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : 0}
        />
      </mesh>
      
      {/* Номер на двери */}
      <Text
        position={[0, size[1] / 2, size[2] / 2 + 0.1]}
        fontSize={Math.min(size[0], size[1]) * 0.35}
        color="#FBBF24"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {number}
      </Text>
      
      {/* Горизонтальные линии на двери */}
      {[0.25, 0.5, 0.75].map((ratio, i) => (
        <mesh 
          key={i}
          position={[0, size[1] * ratio, size[2] / 2 + 0.04]}
        >
          <boxGeometry args={[size[0] - 0.12, 0.015, 0.01]} />
          <meshStandardMaterial color="#7c3aed" metalness={0.1} roughness={0.8} />
        </mesh>
      ))}
      
      {/* Индикатор статуса */}
      <mesh position={[size[0] / 2 - 0.15, size[1] - 0.15, size[2] / 2 + 0.08]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color={isAvailable ? '#22c55e' : '#ef4444'} />
      </mesh>
    </group>
  );
};

// Стены и структура склада
const WarehouseStructure = () => {
  return (
    <>
      {/* Пол */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 30]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.95} />
      </mesh>
      
      {/* Сетка на полу */}
      <gridHelper args={[50, 50, '#9ca3af', '#e5e7eb']} position={[0, 0.01, 0]} />
      
      {/* Задняя стена */}
      <mesh position={[0, 4, -12]} receiveShadow>
        <boxGeometry args={[50, 8, 0.3]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.95} />
      </mesh>
      
      {/* Левая стена */}
      <mesh position={[-22, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 8, 0.3]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.95} />
      </mesh>
      
      {/* Правая стена */}
      <mesh position={[22, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 8, 0.3]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.95} />
      </mesh>
      
      {/* Потолочные балки */}
      {[-15, -5, 5, 15].map((x, i) => (
        <mesh key={i} position={[x, 7.5, 0]}>
          <boxGeometry args={[0.3, 0.3, 30]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
      
      {/* Освещение (лампы) */}
      {[-12, 0, 12].map((x, i) => (
        <group key={i} position={[x, 7, 0]}>
          <mesh>
            <boxGeometry args={[3, 0.1, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
      
      {/* Зоны с номерами */}
      {[
        { pos: [-17, 0.02, -7], label: 'Зона 1' },
        { pos: [-17, 0.02, 3], label: 'Зона 3' },
        { pos: [-17, 0.02, 6], label: 'Зона 4' },
        { pos: [-10, 0.02, 3], label: 'Зона 5' },
        { pos: [8, 0.02, 3], label: 'Зона 6' },
        { pos: [19, 0.02, -5], label: 'Зона 7' },
        { pos: [19, 0.02, -9], label: 'Зона 8' },
        { pos: [11, 0.02, -5], label: 'Зона 9' },
        { pos: [5, 0.02, -7], label: 'Зона 10' },
      ].map((zone, i) => (
        <Text
          key={i}
          position={[zone.pos[0], 0.1, zone.pos[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.8}
          color="#8B5CF6"
          anchorX="center"
          anchorY="middle"
        >
          {zone.label}
        </Text>
      ))}
    </>
  );
};

interface WarehouseSceneProps {
  selectedCellId: string | null;
  onSelectCell: (id: string | null) => void;
}

const WarehouseScene = ({ selectedCellId, onSelectCell }: WarehouseSceneProps) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  
  return (
    <>
      <WarehouseStructure />
      
      {/* Ячейки */}
      {warehouseCells.map((cell) => (
        <CellMesh
          key={cell.id}
          cellId={cell.id}
          position={[cell.position.x, cell.position.y, cell.position.z]}
          size={[cell.width, cell.height, cell.depth]}
          number={cell.number}
          isAvailable={cell.isAvailable}
          isHovered={hoveredCell === cell.id}
          isSelected={selectedCellId === cell.id}
          tier={cell.tier}
          onClick={() => onSelectCell(selectedCellId === cell.id ? null : cell.id)}
          onHover={(hover) => setHoveredCell(hover ? cell.id : null)}
        />
      ))}
      
      {/* Освещение */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-15, 6, 0]} intensity={0.4} color="#ffffff" />
      <pointLight position={[15, 6, 0]} intensity={0.4} color="#ffffff" />
      <pointLight position={[0, 6, -8]} intensity={0.3} color="#ffffff" />
    </>
  );
};

interface WarehouseMap3DProps {
  selectedCellId: string | null;
  onSelectCell: (id: string | null) => void;
}

const WarehouseMap3D = ({ selectedCellId, onSelectCell }: WarehouseMap3DProps) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-secondary to-muted">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 25, 30]} fov={50} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={60}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.05}
          target={[0, 0, 0]}
        />
        <WarehouseScene 
          selectedCellId={selectedCellId} 
          onSelectCell={onSelectCell} 
        />
        <fog attach="fog" args={['#f5f5f4', 40, 80]} />
      </Canvas>
    </div>
  );
};

export default WarehouseMap3D;

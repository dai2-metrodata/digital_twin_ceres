import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import * as THREE from 'three'


function Rail({ position, length, color = '#4a90d9' }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[length, 0.15, 0.3]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  )
}

function Gantry({ xPos, spindleSpeed }) {
  const spindleRef = useRef()
  useFrame((_, delta) => {
    if (spindleRef.current) {
      spindleRef.current.rotation.y += delta * (spindleSpeed / 500)
    }
  })
  return (
    <group position={[xPos, 0, 0]}>
      {/* Vertical columns */}
      <mesh position={[-0.1, 1.5, -0.8]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.1, 1.5, 0.8]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Crossbeam */}
      <mesh position={[-0.1, 2.8, 0]}>
        <boxGeometry args={[0.4, 0.4, 2]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Spindle head */}
      <group position={[0, 2.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Rotating tool */}
        <mesh ref={spindleRef} position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#bdc3c7" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

function Indexer({ rotation }) {
  return (
    <group position={[3.5, 0.5, 0]}>
      <mesh rotation={[0, 0, (rotation * Math.PI) / 180]}>
        <cylinderGeometry args={[0.6, 0.6, 0.4, 32]} />
        <meshStandardMaterial color="#f39c12" metalness={0.6} roughness={0.3} />
      </mesh>
      <Text position={[0, 0.4, 0]} fontSize={0.15} color="white" anchorX="center">
        {rotation}°
      </Text>
    </group>
  )
}

function Workpiece({ railLength, feedProgress }) {
  const length = railLength * 0.3
  return (
    <group position={[0, 0.5, 0]}>
      {/* Raw material */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[length, 0.3, 0.4]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Machined portion indicator */}
      <mesh position={[-length / 2 + (length * feedProgress) / 2, 0, 0]}>
        <boxGeometry args={[length * feedProgress, 0.32, 0.42]} />
        <meshStandardMaterial color="#27ae60" metalness={0.5} roughness={0.4} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function SensorPoint({ sensor, onClick }) {
  const colors = {
    Temperature: '#e74c3c', Vibration: '#f39c12', Position: '#3498db',
    'Load Cell': '#9b59b6', 'Coolant Flow': '#1abc9c', Acoustic: '#e67e22', Power: '#2ecc71'
  }
  return (
    <mesh position={sensor.position} onClick={() => onClick(sensor)}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color={colors[sensor.type] || '#fff'} emissive={colors[sensor.type] || '#fff'} emissiveIntensity={0.5} />
    </mesh>
  )
}

function MachineBase() {
  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[8, 0.4, 3]} />
        <meshStandardMaterial color="#1a252f" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Chip conveyor */}
      <mesh position={[0, -0.6, 1.2]}>
        <boxGeometry args={[6, 0.2, 0.5]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  )
}

function ToolChanger({ position }) {
  const tools = [0, 1, 2, 3, 4, 5]
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 6]} />
        <meshStandardMaterial color="#34495e" metalness={0.7} roughness={0.3} />
      </mesh>
      {tools.map((i) => {
        const angle = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.35, 0.1, Math.sin(angle) * 0.35]}>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
            <meshStandardMaterial color="#bdc3c7" metalness={0.8} roughness={0.2} />
          </mesh>
        )
      })}
    </group>
  )
}

function Scene({ params, kpis, onSensorClick, sensors }) {
  const feedProgress = useMemo(() => Math.min(1, (kpis?.performance || 85) / 100), [kpis])
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
      <pointLight position={[-3, 4, 2]} intensity={0.3} color="#4a90d9" />

      <MachineBase />
      {/* Dual rails - top and bottom machining zones */}
      <Rail position={[0, 1.8, -0.6]} length={7} color="#4a90d9" />
      <Rail position={[0, 1.8, 0.6]} length={7} color="#4a90d9" />
      <Rail position={[0, 0.2, -0.6]} length={7} color="#3a7bc8" />
      <Rail position={[0, 0.2, 0.6]} length={7} color="#3a7bc8" />

      <Gantry xPos={params.feedProgress || 0} spindleSpeed={params.spindleSpeed} />
      <Indexer rotation={params.indexerRotation || 0} />
      <Workpiece railLength={params.railLength} feedProgress={feedProgress} />
      <ToolChanger position={[-3, 2.5, -1]} />

      {sensors.map(s => (
        <SensorPoint key={s.id} sensor={s} onClick={onSensorClick} />
      ))}

      <OrbitControls enablePan enableZoom enableRotate maxDistance={12} minDistance={3} />
      <gridHelper args={[10, 20, '#333', '#222']} position={[0, -0.5, 0]} />
    </>
  )
}

export default function MachineModel({ params, kpis, onSensorClick, sensors }) {
  return (
    <div className="rounded-lg overflow-hidden border border-machine-light/20" style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
      <Canvas
        camera={{ position: [5, 4, 6], fov: 50 }}
        shadows
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 }, offsetSize: true }}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl, size }) => {
          gl.setClearColor('#1a1a2e')
          if (size.width === 0 || size.height === 0) {
            gl.setSize(window.innerWidth * 0.5, window.innerHeight * 0.8)
          }
        }}
        fallback={<div style={{ color: 'white', padding: '2rem' }}>WebGL not supported</div>}
      >
        <Suspense fallback={null}>
          <Scene params={params} kpis={kpis} onSensorClick={onSensorClick} sensors={sensors} />
        </Suspense>
      </Canvas>
    </div>
  )
}

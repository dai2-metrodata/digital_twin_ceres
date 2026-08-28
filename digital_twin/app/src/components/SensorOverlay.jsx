import React from 'react'

export default function SensorOverlay({ sensor, onClose }) {
  if (!sensor) return null
  const readings = {
    Temperature: { value: (55 + Math.random() * 20).toFixed(1), unit: '°C', status: 'normal' },
    Vibration: { value: (1.5 + Math.random() * 3).toFixed(2), unit: 'mm/s', status: 'normal' },
    Position: { value: (Math.random() * 0.01).toFixed(4), unit: 'mm', status: 'normal' },
    'Load Cell': { value: (200 + Math.random() * 150).toFixed(0), unit: 'N', status: 'normal' },
    'Coolant Flow': { value: (8 + Math.random() * 4).toFixed(1), unit: 'L/min', status: 'normal' },
    Acoustic: { value: (65 + Math.random() * 20).toFixed(0), unit: 'dB', status: 'normal' },
    Power: { value: (12 + Math.random() * 8).toFixed(1), unit: 'kW', status: 'normal' }
  }
  const reading = readings[sensor.type] || { value: '--', unit: '', status: 'unknown' }

  return (
    <div className="absolute top-4 right-4 bg-machine-mid/95 border border-machine-light/50 rounded-lg p-4 w-64 backdrop-blur-sm z-10">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-machine-accent">{sensor.type}</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">&times;</button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-400">Location:</span><span>{sensor.location}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Reading:</span><span className="text-green-400 font-mono">{reading.value} {reading.unit}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Status:</span><span className="text-green-400">● Normal</span></div>
        <div className="flex justify-between"><span className="text-gray-400">ID:</span><span className="font-mono text-xs">{sensor.id}</span></div>
      </div>
    </div>
  )
}

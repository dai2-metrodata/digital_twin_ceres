import React, { useState, useEffect, useCallback } from 'react'
import MachineModel from './components/MachineModel'
import SensorOverlay from './components/SensorOverlay'
import KPIDashboard from './components/KPIDashboard'
import ProcessControls from './components/ProcessControls'
import SupplyChainView from './components/SupplyChainView'
import { PROCESS_PARAMS } from './data/defaults'
import { computeKPIs, simulateStep } from './simulation/machineSimulator'

const initialParams = Object.fromEntries(Object.entries(PROCESS_PARAMS).map(([k, v]) => [k, v.default]))

export default function App() {
  const [view, setView] = useState('operator')
  const [params, setParams] = useState(initialParams)
  const [kpis, setKpis] = useState(() => computeKPIs(initialParams))
  const [machineState, setMachineState] = useState({ feedProgress: 0, indexerRotation: 0, spindleSpeed: 1592, railLength: 12 })
  const [selectedSensor, setSelectedSensor] = useState(null)

  useEffect(() => {
    setKpis(computeKPIs(params))
  }, [params])

  useEffect(() => {
    const interval = setInterval(() => {
      setMachineState(prev => simulateStep(prev, params))
    }, 100)
    return () => clearInterval(interval)
  }, [params])

  const handleParamChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col bg-machine-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-machine-mid border-b border-machine-light/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-machine-accent rounded-lg flex items-center justify-center text-white text-xs font-bold">U</div>
          <div>
            <h1 className="text-sm font-bold text-white">UNISIGN Dual Rail Machine</h1>
            <p className="text-xs text-gray-400">Digital Twin — Industrial Rail Manufacturing</p>
          </div>
        </div>
        <nav className="flex gap-1">
          <button className={`nav-tab ${view === 'operator' ? 'active' : ''}`} onClick={() => setView('operator')}>
            Machine Operator
          </button>
          <button className={`nav-tab ${view === 'supply' ? 'active' : ''}`} onClick={() => setView('supply')}>
            Supply Chain Engineer
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-xs text-green-400">Live</span>
        </div>
      </header>

      {/* Main Content */}
      {view === 'operator' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: KPIs */}
          <aside className="w-72 p-3 border-r border-machine-light/20 overflow-hidden">
            <KPIDashboard kpis={kpis} />
          </aside>

          {/* Center: 3D Model */}
          <main className="flex-1 relative p-3">
            <MachineModel params={machineState} kpis={kpis} onSensorClick={setSelectedSensor} />
            {selectedSensor && <SensorOverlay sensor={selectedSensor} onClose={() => setSelectedSensor(null)} />}
            {/* Status bar */}
            <div className="absolute bottom-4 left-4 right-4 bg-machine-mid/90 backdrop-blur rounded-lg px-4 py-2 flex justify-between text-xs border border-machine-light/20">
              <span>Rail: <strong>{params.railLength} ft</strong></span>
              <span>Speed: <strong>{params.cuttingSpeed} m/min</strong></span>
              <span>Feed: <strong>{params.feedRate} mm/min</strong></span>
              <span>Spindle: <strong>{params.spindleSpeed} RPM</strong></span>
              <span>OEE: <strong className={kpis.oee > 80 ? 'text-green-400' : 'text-yellow-400'}>{kpis.oee.toFixed(1)}%</strong></span>
            </div>
          </main>

          {/* Right Panel: Controls */}
          <aside className="w-80 p-3 border-l border-machine-light/20 overflow-hidden">
            <ProcessControls params={params} onParamChange={handleParamChange} />
          </aside>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <SupplyChainView />
        </div>
      )}
    </div>
  )
}

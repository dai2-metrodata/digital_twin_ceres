import React, { useState } from 'react'

function Slider({ param, value, onChange, config }) {
  const isLog = config.max / config.min > 100
  const displayValue = typeof value === 'number' ? (value >= 100 ? value.toFixed(0) : value.toFixed(2)) : value

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300">{config.label}</span>
        <span className="font-mono text-machine-accent">{displayValue} {config.unit}</span>
      </div>
      <input type="range" className="w-full h-1.5 bg-machine-dark rounded-full appearance-none cursor-pointer param-slider"
        min={config.min} max={config.max} step={(config.max - config.min) / 200}
        value={value} onChange={(e) => onChange(param, parseFloat(e.target.value))} />
    </div>
  )
}

export default function ProcessControls({ params, onParamChange, onSimulate, processParams, materials }) {
  const [material, setMaterial] = useState('mild_steel')
  const [targetQuality, setTargetQuality] = useState(99)
  const [scenario, setScenario] = useState(null)

  const runWhatIf = () => {
    const mat = materials.find(m => m.id === material)
    const adjustedSpeed = params.cuttingSpeed * mat.cuttingSpeedFactor
    const adjustedFeed = params.feedRate * mat.feedFactor
    const cycleTime = (params.railLength * 304.8) / adjustedFeed
    const partsPerHour = 60 / cycleTime
    const expectedQuality = Math.min(99.9, 100 - (params.spindleSpeed / 4000) * 2 - Math.abs(params.zeroPointCorrection) * 5)
    const meetsTarget = expectedQuality >= targetQuality

    setScenario({
      adjustedSpeed: adjustedSpeed.toFixed(1),
      adjustedFeed: adjustedFeed.toFixed(1),
      cycleTime: cycleTime.toFixed(2),
      partsPerHour: partsPerHour.toFixed(1),
      expectedQuality: expectedQuality.toFixed(2),
      meetsTarget,
      material: mat.name
    })
    onSimulate && onSimulate({ material: mat, targetQuality, scenario })
  }

  return (
    <div className="h-full overflow-y-auto space-y-3 pr-1">
      <div className="kpi-card">
        <h3 className="text-xs font-bold text-machine-accent mb-3 uppercase tracking-wider">Process Parameters</h3>
        {Object.keys(processParams).map(key => (
          <Slider key={key} param={key} value={params[key]} onChange={onParamChange} config={processParams[key]} />
        ))}
      </div>

      <div className="kpi-card">
        <h3 className="text-xs font-bold text-machine-accent mb-2 uppercase tracking-wider">Material & Quality Target</h3>
        <div className="mb-3">
          <label className="text-xs text-gray-400 block mb-1">Material</label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)}
            className="w-full bg-machine-dark border border-machine-light/30 rounded px-2 py-1.5 text-sm text-white">
            {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Target Quality</span>
            <span className="font-mono text-machine-accent">{targetQuality}%</span>
          </div>
          <input type="range" className="w-full h-1.5 bg-machine-dark rounded-full appearance-none cursor-pointer param-slider"
            min={90} max={99.9} step={0.1} value={targetQuality} onChange={(e) => setTargetQuality(parseFloat(e.target.value))} />
        </div>
        <button onClick={runWhatIf}
          className="w-full bg-machine-accent hover:bg-red-600 text-white text-sm font-medium py-2 rounded transition-colors">
          Run What-If Simulation
        </button>
      </div>

      {scenario && (
        <div className={`kpi-card border ${scenario.meetsTarget ? 'border-green-500/50' : 'border-red-500/50'}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: scenario.meetsTarget ? '#27ae60' : '#e74c3c' }}>
            Simulation Result {scenario.meetsTarget ? '✓ Target Met' : '✗ Below Target'}
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Material:</span><span>{scenario.material}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Adj. Cutting Speed:</span><span className="font-mono">{scenario.adjustedSpeed} m/min</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Adj. Feed Rate:</span><span className="font-mono">{scenario.adjustedFeed} mm/min</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Cycle Time:</span><span className="font-mono">{scenario.cycleTime} min</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Parts/Hour:</span><span className="font-mono">{scenario.partsPerHour}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Expected Quality:</span>
              <span className="font-mono" style={{ color: scenario.meetsTarget ? '#27ae60' : '#e74c3c' }}>{scenario.expectedQuality}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

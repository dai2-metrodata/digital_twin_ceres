import React from 'react'

function GaugeCircle({ value, max = 100, label, unit = '%', size = 80 }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = pct >= 85 ? '#27ae60' : pct >= 65 ? '#f39c12' : '#e74c3c'
  const circumference = 2 * Math.PI * 35
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="35" fill="none" stroke="#1a252f" strokeWidth="6" />
        <circle cx="40" cy="40" r="35" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 40 40)" className="transition-all duration-700" />
        <text x="40" y="38" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </text>
        <text x="40" y="52" textAnchor="middle" fill="#888" fontSize="9">{unit}</text>
      </svg>
      <span className="text-xs text-gray-400 mt-1 text-center">{label}</span>
    </div>
  )
}

function MetricBar({ label, value, max, unit, thresholds }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = value <= (thresholds?.good || max * 0.3) ? '#27ae60' :
    value <= (thresholds?.warning || max * 0.7) ? '#f39c12' : '#e74c3c'

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="font-mono" style={{ color }}>{value.toFixed(3)} {unit}</span>
      </div>
      <div className="h-1.5 bg-machine-dark rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function KPIDashboard({ kpis, kpiThresholds }) {
  return (
    <div className="h-full overflow-y-auto space-y-3 pr-1">
      {/* OEE Section */}
      <div className="kpi-card">
        <h3 className="text-xs font-bold text-machine-accent mb-2 uppercase tracking-wider">Overall Equipment Effectiveness</h3>
        <div className="flex justify-around">
          <GaugeCircle value={kpis.oee} label="OEE" />
          <GaugeCircle value={kpis.availability} label="Availability" />
          <GaugeCircle value={kpis.performance} label="Performance" />
          <GaugeCircle value={kpis.quality} label="Quality" />
        </div>
      </div>

      {/* Mechanical KPIs */}
      <div className="kpi-card">
        <h3 className="text-xs font-bold text-machine-accent mb-2 uppercase tracking-wider">Dual-Rail Mechanical</h3>
        <MetricBar label="Rail Accuracy" value={kpis.railAccuracy} max={0.1} unit="mm" thresholds={kpiThresholds.railAccuracy} />
        <MetricBar label="Vibration (RMS)" value={kpis.vibration} max={10} unit="mm/s" thresholds={kpiThresholds.vibration} />
        <MetricBar label="Axis Position Error" value={kpis.axisError} max={0.05} unit="mm" thresholds={kpiThresholds.axisError} />
      </div>

      {/* Tooling & Maintenance */}
      <div className="kpi-card">
        <h3 className="text-xs font-bold text-machine-accent mb-2 uppercase tracking-wider">Tooling & Maintenance</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">{kpis.mtbf.toFixed(0)}</div>
            <div className="text-xs text-gray-500">MTBF (hrs)</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">{kpis.mttr.toFixed(1)}</div>
            <div className="text-xs text-gray-500">MTTR (hrs)</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">{kpis.toolLife.toFixed(0)}%</div>
            <div className="text-xs text-gray-500">Tool Life</div>
          </div>
        </div>
      </div>
    </div>
  )
}

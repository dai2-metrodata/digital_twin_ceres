import React, { useState, useMemo } from 'react'
import { SUPPLY_CHAIN_DEFAULTS } from '../data/defaults'

function InventoryBar({ item, onAdjust }) {
  const pct = (item.stock / (item.reorderPoint * 4)) * 100
  const color = item.stock <= item.reorderPoint ? '#e74c3c' : item.stock <= item.reorderPoint * 1.5 ? '#f39c12' : '#27ae60'
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300">{item.name}</span>
        <span className="font-mono" style={{ color }}>{item.stock} {item.unit}</span>
      </div>
      <div className="h-2 bg-machine-dark rounded-full overflow-hidden relative">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
        <div className="absolute top-0 h-full w-0.5 bg-yellow-400" style={{ left: `${(item.reorderPoint / (item.reorderPoint * 4)) * 100}%` }} />
      </div>
      <div className="text-xs text-gray-500 mt-0.5">Reorder at: {item.reorderPoint} {item.unit} | Lead: {item.leadTimeDays}d</div>
    </div>
  )
}

function TransportSimulator({ type, delays, onDelayChange }) {
  const modes = SUPPLY_CHAIN_DEFAULTS.transportModes
  return (
    <div className="space-y-2">
      {modes.map(mode => (
        <div key={mode.id} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-14">{mode.name}</span>
          <input type="range" className="flex-1 h-1 bg-machine-dark rounded-full appearance-none cursor-pointer param-slider"
            min={0} max={10} step={1} value={delays[mode.id] || 0}
            onChange={(e) => onDelayChange(mode.id, parseInt(e.target.value))} />
          <span className="text-xs font-mono text-yellow-400 w-16">+{delays[mode.id] || 0}d delay</span>
        </div>
      ))}
    </div>
  )
}

function WorkOrderTimeline({ orders, dayOffset }) {
  return (
    <div className="space-y-1 max-h-40 overflow-y-auto">
      {orders.map((order, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 w-12">Day {order.day}</span>
          <div className="flex-1 h-4 bg-machine-dark rounded overflow-hidden relative">
            <div className="h-full rounded" style={{
              width: `${(order.qty / 25) * 100}%`,
              backgroundColor: order.fulfilled ? '#27ae60' : order.partial ? '#f39c12' : '#e74c3c'
            }} />
          </div>
          <span className="font-mono w-10 text-right" style={{ color: order.fulfilled ? '#27ae60' : '#f39c12' }}>
            {order.qty}
          </span>
          <span className={`text-xs w-16 ${order.fulfilled ? 'text-green-400' : 'text-red-400'}`}>
            {order.fulfilled ? 'Fulfilled' : order.partial ? 'Partial' : 'Stockout'}
          </span>
        </div>
      ))}
    </div>
  )
}

function RiskPanel({ risks }) {
  return (
    <div className="space-y-2">
      {risks.map((risk, i) => (
        <div key={i} className={`flex items-start gap-2 p-2 rounded text-xs ${
          risk.severity === 'high' ? 'bg-red-900/30 border border-red-500/30' :
          risk.severity === 'medium' ? 'bg-yellow-900/30 border border-yellow-500/30' :
          'bg-blue-900/30 border border-blue-500/30'}`}>
          <span className="text-lg">{risk.severity === 'high' ? '⚠' : risk.severity === 'medium' ? '⚡' : 'ℹ'}</span>
          <div>
            <div className="font-medium text-gray-200">{risk.title}</div>
            <div className="text-gray-400">{risk.description}</div>
            {risk.action && <div className="text-machine-accent mt-1">→ {risk.action}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SupplyChainView() {
  const [dailyDemand, setDailyDemand] = useState(12)
  const [simulationDays, setSimulationDays] = useState(14)
  const [inboundDelays, setInboundDelays] = useState({ truck: 0, train: 0 })
  const [outboundDelays, setOutboundDelays] = useState({ truck: 0, train: 0 })
  const [geoRisk, setGeoRisk] = useState(0)
  const [inventory, setInventory] = useState(SUPPLY_CHAIN_DEFAULTS.rawMaterials)
  const [simResults, setSimResults] = useState(null)

  const runSimulation = () => {
    let stock = SUPPLY_CHAIN_DEFAULTS.rawMaterials[0].stock
    const warehouseCapacity = SUPPLY_CHAIN_DEFAULTS.warehouse.capacity
    let warehouseStock = SUPPLY_CHAIN_DEFAULTS.warehouse.currentStock
    const orders = []
    const risks = []
    let stockouts = 0
    let warehouseOverflows = 0

    for (let day = 1; day <= simulationDays; day++) {
      const demand = dailyDemand + Math.floor(Math.random() * 5) - 2
      const scarcityFactor = 1 - (geoRisk / 100) * 0.5
      const effectiveSupply = stock * scarcityFactor

      const inboundDelay = Math.max(inboundDelays.truck, inboundDelays.train)
      const resupply = day % (7 + inboundDelay) === 0 ? 30 * scarcityFactor : 0
      stock = Math.max(0, stock - demand * 1.2 + resupply)

      const produced = Math.min(demand, effectiveSupply > demand * 1.2 ? demand : Math.floor(demand * 0.6))
      const outboundDelay = Math.max(outboundDelays.truck, outboundDelays.train)
      const shipped = outboundDelay > 3 ? Math.floor(produced * 0.4) : produced
      warehouseStock = Math.min(warehouseCapacity, warehouseStock + produced - shipped)

      const fulfilled = produced >= demand
      const partial = produced > 0 && produced < demand
      if (!fulfilled) stockouts++
      if (warehouseStock >= warehouseCapacity * 0.9) warehouseOverflows++

      orders.push({ day, qty: demand, produced, fulfilled, partial })
    }

    if (stockouts > 2) risks.push({ severity: 'high', title: 'Raw Material Stockout Risk', description: `${stockouts} days of potential stockout in ${simulationDays}-day window.`, action: 'Increase safety stock or expedite inbound shipments' })
    if (inboundDelays.truck > 3 || inboundDelays.train > 3) risks.push({ severity: 'high', title: 'Inbound Transport Delay', description: 'Delays exceeding lead time buffer. Plant production at risk.', action: 'Switch to alternative carrier or air freight for critical materials' })
    if (warehouseOverflows > 3) risks.push({ severity: 'medium', title: 'Warehouse Capacity Warning', description: `${warehouseOverflows} days at >90% capacity. Finished goods may not ship.`, action: 'Arrange overflow storage or expedite outbound transport' })
    if (geoRisk > 50) risks.push({ severity: 'high', title: 'Geopolitical Supply Risk', description: `${geoRisk}% risk factor affecting material availability.`, action: 'Diversify suppliers across regions. Consider strategic stockpiling.' })
    if (outboundDelays.truck > 2) risks.push({ severity: 'medium', title: 'Outbound Logistics Bottleneck', description: 'Truck delays causing warehouse buildup.', action: 'Route via train or activate overflow warehouse agreement' })
    if (risks.length === 0) risks.push({ severity: 'low', title: 'Supply Chain Stable', description: 'No significant risks detected in simulation window.', action: null })

    setSimResults({ orders, risks, stockouts, warehouseOverflows, avgFulfillment: ((simulationDays - stockouts) / simulationDays * 100).toFixed(1) })
  }

  return (
    <div className="h-full overflow-y-auto space-y-3 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Simulation Controls */}
        <div className="kpi-card">
          <h3 className="text-xs font-bold text-machine-accent mb-3 uppercase tracking-wider">Simulation Parameters</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Daily Order Volume</span>
                <span className="font-mono text-white">{dailyDemand} rails/day</span>
              </div>
              <input type="range" className="w-full h-1.5 bg-machine-dark rounded-full appearance-none cursor-pointer param-slider"
                min={5} max={25} value={dailyDemand} onChange={(e) => setDailyDemand(parseInt(e.target.value))} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Simulation Window</span>
                <span className="font-mono text-white">{simulationDays} days</span>
              </div>
              <input type="range" className="w-full h-1.5 bg-machine-dark rounded-full appearance-none cursor-pointer param-slider"
                min={7} max={30} value={simulationDays} onChange={(e) => setSimulationDays(parseInt(e.target.value))} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Geopolitical Risk Factor</span>
                <span className="font-mono text-yellow-400">{geoRisk}%</span>
              </div>
              <input type="range" className="w-full h-1.5 bg-machine-dark rounded-full appearance-none cursor-pointer param-slider"
                min={0} max={100} value={geoRisk} onChange={(e) => setGeoRisk(parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="kpi-card">
          <h3 className="text-xs font-bold text-machine-accent mb-3 uppercase tracking-wider">Raw Material Inventory</h3>
          {SUPPLY_CHAIN_DEFAULTS.rawMaterials.map(item => <InventoryBar key={item.id} item={item} />)}
          <div className="mt-2 pt-2 border-t border-machine-light/20">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Warehouse Utilization</span>
              <span className="font-mono text-blue-400">{SUPPLY_CHAIN_DEFAULTS.warehouse.currentStock}/{SUPPLY_CHAIN_DEFAULTS.warehouse.capacity} rails</span>
            </div>
          </div>
        </div>

        {/* Inbound Transport */}
        <div className="kpi-card">
          <h3 className="text-xs font-bold text-machine-accent mb-3 uppercase tracking-wider">Inbound Transport (Raw Materials)</h3>
          <TransportSimulator type="inbound" delays={inboundDelays}
            onDelayChange={(mode, val) => setInboundDelays(prev => ({ ...prev, [mode]: val }))} />
        </div>

        {/* Outbound Transport */}
        <div className="kpi-card">
          <h3 className="text-xs font-bold text-machine-accent mb-3 uppercase tracking-wider">Outbound Transport (Finished Goods)</h3>
          <TransportSimulator type="outbound" delays={outboundDelays}
            onDelayChange={(mode, val) => setOutboundDelays(prev => ({ ...prev, [mode]: val }))} />
        </div>
      </div>

      {/* Run Simulation Button */}
      <button onClick={runSimulation}
        className="w-full bg-machine-accent hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors text-sm">
        Run Supply Chain Simulation ({simulationDays} Days)
      </button>

      {/* Results */}
      {simResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="kpi-card">
            <h3 className="text-xs font-bold text-machine-accent mb-3 uppercase tracking-wider">Work Order Fulfillment</h3>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div>
                <div className="text-lg font-bold text-green-400">{simResults.avgFulfillment}%</div>
                <div className="text-xs text-gray-500">Fill Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">{simResults.stockouts}</div>
                <div className="text-xs text-gray-500">Stockout Days</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-400">{simResults.warehouseOverflows}</div>
                <div className="text-xs text-gray-500">Overflow Days</div>
              </div>
            </div>
            <WorkOrderTimeline orders={simResults.orders} />
          </div>

          <div className="kpi-card">
            <h3 className="text-xs font-bold text-machine-accent mb-3 uppercase tracking-wider">Risk Assessment & Recommendations</h3>
            <RiskPanel risks={simResults.risks} />
          </div>
        </div>
      )}
    </div>
  )
}

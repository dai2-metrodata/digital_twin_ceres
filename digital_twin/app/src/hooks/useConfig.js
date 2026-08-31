import { useState, useEffect } from 'react'
import * as defaults from '../data/defaults'

const FALLBACK_CONFIG = {
  processParams: defaults.PROCESS_PARAMS,
  kpiThresholds: defaults.KPI_THRESHOLDS,
  materials: defaults.MATERIALS,
  sensors: defaults.SENSORS,
  supplyChainDefaults: defaults.SUPPLY_CHAIN_DEFAULTS,
}

export default function useConfig() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setConfig(data)
        setLoading(false)
      })
      .catch(err => {
        console.warn('Failed to fetch config from API, using fallback:', err.message)
        setConfig(FALLBACK_CONFIG)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { config, loading, error }
}

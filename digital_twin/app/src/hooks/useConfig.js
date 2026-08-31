import { useState, useEffect } from 'react'

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
        console.error('Failed to fetch config from API:', err.message)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { config, loading, error }
}

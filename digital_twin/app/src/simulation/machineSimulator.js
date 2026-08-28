import { PROCESS_PARAMS, MATERIALS } from '../data/defaults'

export function computeKPIs(params) {
  const { cuttingSpeed, feedRate, spindleSpeed, zeroPointCorrection, railLength } = params

  const speedRatio = cuttingSpeed / PROCESS_PARAMS.cuttingSpeed.max
  const feedRatio = feedRate / PROCESS_PARAMS.feedRate.max
  const spindleRatio = spindleSpeed / PROCESS_PARAMS.spindleSpeed.max

  // Availability: decreases with extreme parameters
  const availability = Math.max(60, 95 - Math.abs(spindleRatio - 0.5) * 15 - Math.random() * 3)

  // Performance: based on feed and speed optimization
  const performance = Math.max(55, 90 + (feedRatio * 10) - (speedRatio > 0.8 ? (speedRatio - 0.8) * 40 : 0) - Math.random() * 5)

  // Quality: affected by zero-point correction, vibration from high speeds
  const quality = Math.max(85, 99.5 - Math.abs(zeroPointCorrection) * 8 - (spindleRatio > 0.7 ? (spindleRatio - 0.7) * 10 : 0) - Math.random() * 2)

  const oee = (availability * performance * quality) / 10000

  // Mechanical KPIs
  const railAccuracy = 0.003 + Math.abs(zeroPointCorrection) * 0.02 + spindleRatio * 0.01 + Math.random() * 0.005
  const vibration = 1.0 + spindleRatio * 4 + feedRatio * 2 + Math.random() * 0.5
  const axisError = 0.002 + Math.abs(zeroPointCorrection) * 0.01 + Math.random() * 0.003

  // Tooling KPIs
  const mtbf = Math.max(100, 600 - spindleRatio * 200 - feedRatio * 150 + Math.random() * 50)
  const mttr = Math.max(0.5, 2 + (spindleRatio > 0.8 ? 3 : 0) + Math.random() * 1.5)
  const toolLife = Math.max(10, 95 - speedRatio * 30 - feedRatio * 20 - railLength * 0.5)

  return {
    oee, availability, performance, quality,
    railAccuracy, vibration, axisError,
    mtbf, mttr, toolLife
  }
}

export function simulateStep(prevState, params, dt = 1) {
  const feedProgress = Math.min(1, (prevState.feedProgress || 0) + (params.feedRate / 32000) * dt * 0.1)
  const indexerRotation = feedProgress >= 1 ? 0 : (prevState.indexerRotation || 0)

  return {
    ...prevState,
    feedProgress: feedProgress >= 1 ? 0 : feedProgress,
    indexerRotation,
    spindleSpeed: params.spindleSpeed,
    railLength: params.railLength
  }
}

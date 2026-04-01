import { useState, useEffect, useRef } from 'react'
import { getAnalysisStatus } from '../api/analysis'

export function useAnalysisPolling(analysisId, initialStatus = 'pending') {
  const [status, setStatus] = useState(initialStatus)
  const [score, setScore] = useState(null)
  const [verdict, setVerdict] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!analysisId) return
    if (status === 'complete' || status === 'failed') return

    intervalRef.current = setInterval(async () => {
      try {
        const res = await getAnalysisStatus(analysisId)
        setStatus(res.data.status)
        if (res.data.overall_score) setScore(res.data.overall_score)
        if (res.data.verdict) setVerdict(res.data.verdict)
        if (res.data.status === 'complete' || res.data.status === 'failed') {
          clearInterval(intervalRef.current)
        }
      } catch {
        clearInterval(intervalRef.current)
      }
    }, 2000)

    return () => clearInterval(intervalRef.current)
  }, [analysisId, status])

  return { status, score, verdict }
}

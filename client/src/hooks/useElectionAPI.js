import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function useElectionAPI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTimeline = useCallback(async (zip) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/election/timeline/${zip}`)
      if (!res.ok) throw new Error('Failed to fetch timeline')
      return await res.json()
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBallot = useCallback(async (address) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/civic/ballot?address=${encodeURIComponent(address)}`)
      if (!res.ok) throw new Error('Failed to fetch ballot')
      return await res.json()
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const askAI = useCallback(async (message, zip, stateAbbr) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, zip, stateAbbr })
      })
      if (!res.ok) throw new Error('Failed to get answer')
      return await res.json()
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const registerReminder = useCallback(async (data) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to register reminder')
      return await res.json()
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, fetchTimeline, fetchBallot, askAI, registerReminder }
}

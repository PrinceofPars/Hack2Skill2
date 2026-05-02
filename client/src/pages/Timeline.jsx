import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapPin, Calendar, UserCheck, Mail, Clock, ExternalLink, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useElectionAPI } from '../hooks/useElectionAPI'

const ICON_MAP = { UserCheck, Mail, Calendar, Vote: Calendar }

export default function Timeline() {
  const [searchParams] = useSearchParams()
  const [zip, setZip] = useState(searchParams.get('zip') || '')
  const [inputZip, setInputZip] = useState(searchParams.get('zip') || '')
  const [data, setData] = useState(null)
  const { loading, error, fetchTimeline } = useElectionAPI()

  useEffect(() => {
    if (zip.length === 5) load(zip)
  }, [zip])

  async function load(z) {
    const result = await fetchTimeline(z)
    if (result) setData(result)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (inputZip.length === 5) setZip(inputZip)
  }

  const readiness = data?.readinessScore ?? 0

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h1 style={{ marginBottom:8 }}>My Voting <span className="text-gradient">Timeline</span></h1>
        <p className="text-secondary">Enter your ZIP code for a personalized countdown to Election Day.</p>
      </div>

      {/* ZIP input */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6" style={{ flexWrap:'wrap' }} aria-label="ZIP code lookup">
        <div className="input-group" style={{ flex:'1', minWidth:180 }}>
          <MapPin size={18} className="input-icon" aria-hidden="true" />
          <input
            id="timeline-zip"
            type="text" inputMode="numeric" pattern="[0-9]{5}" maxLength={5}
            className="input" placeholder="5-digit ZIP code"
            value={inputZip}
            onChange={e => setInputZip(e.target.value.replace(/\D/,'').slice(0,5))}
            aria-label="ZIP code for timeline lookup"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={inputZip.length !== 5 || loading}>
          {loading ? <><span className="animate-spin" style={{ display:'inline-block', width:16, height:16, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%' }} /></> : <><RefreshCw size={16} /> Lookup</>}
        </button>
      </form>

      {error && (
        <div className="card" style={{ borderColor:'rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.05)', marginBottom:24 }} role="alert">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} style={{ color:'#f87171', flexShrink:0 }} />
            <div>
              <strong>Could not load data</strong>
              <p className="text-sm text-secondary mt-2">{error}. The server may not be running — start it with <code>npm run dev</code> in the server folder.</p>
            </div>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* State header */}
          <div className="card mb-6" style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(6,182,212,0.1))', borderColor:'rgba(99,102,241,0.3)' }}>
            <div className="flex items-center justify-between" style={{ flexWrap:'wrap', gap:16 }}>
              <div>
                <div className="badge badge-accent" style={{ marginBottom:8 }}>{data.stateAbbr} · ZIP {data.zip}</div>
                <h2>{data.state}</h2>
                <p className="text-secondary mt-2">Election Day: <strong style={{ color:'var(--text-primary)' }}>{data.electionDate}</strong> · <strong style={{ color:'var(--accent-light)' }}>{data.daysToElection} days away</strong></p>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'2.5rem', fontWeight:800, fontFamily:'var(--font-display)', background:'linear-gradient(135deg,#818cf8,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  {readiness}%
                </div>
                <div className="text-sm text-secondary">Readiness</div>
              </div>
            </div>
            <div className="progress-wrap mt-4" role="progressbar" aria-valuenow={readiness} aria-valuemin={0} aria-valuemax={100} aria-label={`Voting readiness ${readiness}%`}>
              <div className="progress-fill" style={{ width:`${readiness}%` }} />
            </div>
          </div>

          {/* Key flags */}
          <div className="grid-3 mb-6">
            <div className="card-flat flex items-center gap-3">
              {data.onlineRegistration
                ? <CheckCircle2 size={20} style={{ color:'#4ade80', flexShrink:0 }} />
                : <AlertCircle size={20} style={{ color:'#f87171', flexShrink:0 }} />}
              <div>
                <div className="text-sm" style={{ fontWeight:600 }}>Online Registration</div>
                <div className="text-xs text-secondary">{data.onlineRegistration ? 'Available' : 'Not available'}</div>
              </div>
            </div>
            <div className="card-flat flex items-center gap-3">
              {data.sameDay
                ? <CheckCircle2 size={20} style={{ color:'#4ade80', flexShrink:0 }} />
                : <AlertCircle size={20} style={{ color:'#fbbf24', flexShrink:0 }} />}
              <div>
                <div className="text-sm" style={{ fontWeight:600 }}>Same-Day Registration</div>
                <div className="text-xs text-secondary">{data.sameDay ? 'Available' : 'Must register before deadline'}</div>
              </div>
            </div>
            <div className="card-flat flex items-center gap-3">
              <ShieldCheck size={20} style={{ color: data.idRequired ? '#fbbf24' : '#4ade80', flexShrink:0 }} />
              <div>
                <div className="text-sm" style={{ fontWeight:600 }}>Photo ID Required</div>
                <div className="text-xs text-secondary">{data.idRequired ? 'Yes — see ID notes below' : 'Not required'}</div>
              </div>
            </div>
          </div>

          {/* Milestones timeline */}
          <h2 style={{ marginBottom:20 }}>Key Deadlines</h2>
          <div className="timeline" aria-label="Voting deadlines timeline">
            {data.milestones.map((m, i) => {
              const Icon = ICON_MAP[m.icon] || Calendar
              return (
                <div key={m.id} className={`timeline-item${m.urgent ? ' urgent' : ''}`} aria-label={m.label}>
                  <div className="timeline-dot" aria-hidden="true"><Icon size={18} /></div>
                  <div style={{ flex:1 }}>
                    <div className="flex items-center gap-3" style={{ flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontWeight:700, fontSize:'0.95rem' }}>{m.label}</span>
                      {m.urgent && <span className="badge badge-warning">⚡ Coming Soon</span>}
                    </div>
                    <p className="text-sm text-secondary">{m.description}</p>
                    {m.link && (
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs mt-3" style={{ color:'var(--accent-light)' }}>
                        Official source <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', flexShrink:0 }}>
                    {i + 1}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ID Notes */}
          {data.idNotes && (
            <div className="card mt-6" style={{ borderColor:'rgba(129,140,248,0.3)', background:'rgba(99,102,241,0.05)' }}>
              <div className="flex gap-3">
                <ShieldCheck size={20} style={{ color:'var(--accent-light)', flexShrink:0, marginTop:2 }} />
                <div>
                  <h4 style={{ marginBottom:8 }}>ID Requirements for {data.state}</h4>
                  <p className="text-sm text-secondary">{data.idNotes}</p>
                  <a href={data.officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs mt-3" style={{ color:'var(--accent-light)' }}>
                    {data.officialUrl} <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="card mt-4" style={{ background:'rgba(34,197,94,0.05)', borderColor:'rgba(34,197,94,0.2)' }}>
            <p className="text-xs text-secondary" style={{ textAlign:'center' }}>
              ✅ All dates sourced from <a href={data.officialUrl} target="_blank" rel="noopener noreferrer">{data.officialUrl}</a>. Always verify with your local elections office.
            </p>
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="card" style={{ textAlign:'center', padding:48, borderStyle:'dashed' }}>
          <MapPin size={40} style={{ color:'var(--text-muted)', margin:'0 auto 16px' }} />
          <h3 style={{ marginBottom:8, color:'var(--text-muted)' }}>Enter Your ZIP Code</h3>
          <p className="text-sm text-secondary">Get your personalized election timeline above.</p>
        </div>
      )}
    </div>
  )
}

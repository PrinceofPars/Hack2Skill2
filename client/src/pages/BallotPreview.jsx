import { useState } from 'react'
import { MapPin, FileText, Users, ExternalLink, AlertCircle, Loader2, Building2 } from 'lucide-react'
import { useElectionAPI } from '../hooks/useElectionAPI'

const PARTY_COLORS = {
  'Democratic': '#3b82f6',
  'Republican':  '#ef4444',
  'Independent': '#8b5cf6',
  'Green':       '#22c55e',
  'Libertarian': '#f59e0b',
  '':            '#6366f1'
}

function CandidateCard({ candidate }) {
  const initial = candidate.name.split(' ').map(n => n[0]).slice(0,2).join('')
  const color = PARTY_COLORS[candidate.party] || PARTY_COLORS['']
  return (
    <div className="candidate-card flex items-center gap-3">
      <div className="candidate-avatar" style={{ background:`linear-gradient(135deg,${color}cc,${color}77)` }}>
        {candidate.photoUrl
          ? <img src={candidate.photoUrl} alt={candidate.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
          : initial}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:2 }}>{candidate.name}</div>
        {candidate.party && <div className="badge" style={{ background:`${color}22`, color, border:`1px solid ${color}44` }}>{candidate.party}</div>}
      </div>
      {candidate.candidateUrl && (
        <a href={candidate.candidateUrl} target="_blank" rel="noopener noreferrer"
           className="btn btn-ghost btn-sm" aria-label={`Learn about ${candidate.name}`}>
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  )
}

function ContestCard({ contest }) {
  const isReferendum = contest.roles?.includes('referendumMeasure')
  return (
    <div className="card mb-4">
      <div className="flex items-start gap-3 mb-4">
        <div style={{ width:40, height:40, borderRadius:10, background:'var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {isReferendum ? <FileText size={18} style={{ color:'var(--accent-light)' }} /> : <Users size={18} style={{ color:'var(--accent-light)' }} />}
        </div>
        <div>
          <h3 style={{ marginBottom:4 }}>{contest.office}</h3>
          <div className="flex gap-2" style={{ flexWrap:'wrap' }}>
            {contest.district && <span className="badge badge-accent">{contest.district}</span>}
            {(contest.level || []).map(l => <span key={l} className="badge" style={{ background:'rgba(6,182,212,0.1)', color:'#22d3ee', border:'1px solid rgba(6,182,212,0.2)' }}>{l}</span>)}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {contest.candidates?.map((c, i) => <CandidateCard key={i} candidate={c} />)}
      </div>
      <div style={{ marginTop:16, padding:12, background:'rgba(34,197,94,0.05)', borderRadius:'var(--radius-sm)', border:'1px solid rgba(34,197,94,0.15)' }}>
        <p className="text-xs text-secondary">🛡️ Candidate info is shown without ranking or recommendation. Visit <a href="https://ballotpedia.org" target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent-light)' }}>Ballotpedia</a> for neutral policy comparisons.</p>
      </div>
    </div>
  )
}

function PollingCard({ location }) {
  const addr = location.address || {}
  return (
    <div className="card-flat flex gap-3 mb-3">
      <Building2 size={18} style={{ color:'var(--accent-light)', flexShrink:0, marginTop:2 }} />
      <div>
        <div style={{ fontWeight:600, marginBottom:4 }}>{addr.locationName || 'Polling Location'}</div>
        <div className="text-sm text-secondary">{addr.line1}, {addr.city}, {addr.state} {addr.zip}</div>
        {location.hours && <div className="text-xs text-muted mt-1">🕐 {location.hours}</div>}
        {location.notes && <div className="text-xs text-muted">{location.notes}</div>}
      </div>
    </div>
  )
}

export default function BallotPreview() {
  const [address, setAddress] = useState('')
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('contests')
  const { loading, error, fetchBallot } = useElectionAPI()

  async function handleLookup(e) {
    e.preventDefault()
    if (!address.trim()) return
    const result = await fetchBallot(address)
    if (result) { setData(result); setActiveTab('contests') }
  }

  const tabs = [
    { id:'contests', label:'Ballot Contests', count: data?.contests?.length },
    { id:'polling',  label:'Polling Locations', count: data?.pollingLocations?.length },
  ]

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h1 style={{ marginBottom:8 }}>Ballot <span className="text-gradient">Previewer</span></h1>
        <p className="text-secondary">See who and what is on your ballot. All candidate info is shown without ranking or endorsement.</p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3 mb-6" style={{ flexWrap:'wrap' }} aria-label="Address ballot lookup">
        <div className="input-group" style={{ flex:1, minWidth:260 }}>
          <MapPin size={18} className="input-icon" aria-hidden="true" />
          <input
            id="ballot-address"
            type="text" className="input"
            placeholder="123 Main St, Austin TX 78701"
            value={address}
            onChange={e => setAddress(e.target.value)}
            aria-label="Your full address for ballot lookup"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={!address.trim() || loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><FileText size={16} /> Preview Ballot</>}
        </button>
      </form>

      {error && (
        <div className="card mb-4" style={{ borderColor:'rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.05)' }} role="alert">
          <div className="flex gap-3">
            <AlertCircle size={20} style={{ color:'#f87171', flexShrink:0 }} />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {data._demo && (
            <div className="card mb-4" style={{ borderColor:'rgba(245,158,11,0.3)', background:'rgba(245,158,11,0.05)' }}>
              <p className="text-sm" style={{ color:'#fbbf24' }}>⚠️ <strong>Demo Mode:</strong> Add a Google Civic API key to see real ballot data for your address. This shows sample data for illustration.</p>
            </div>
          )}

          <div className="card mb-6" style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(6,182,212,0.05))', borderColor:'rgba(99,102,241,0.3)' }}>
            <h3 style={{ marginBottom:4 }}>{data.election?.name}</h3>
            <p className="text-secondary text-sm">Election Day: <strong style={{ color:'var(--text-primary)' }}>{data.election?.electionDay}</strong></p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6" role="tablist" aria-label="Ballot information tabs">
            {tabs.map(t => (
              <button key={t.id} role="tab" aria-selected={activeTab === t.id}
                className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setActiveTab(t.id)}>
                {t.label} {t.count != null && <span className="badge badge-accent" style={{ marginLeft:4 }}>{t.count}</span>}
              </button>
            ))}
          </div>

          <div role="tabpanel" aria-label={activeTab === 'contests' ? 'Ballot contests' : 'Polling locations'}>
            {activeTab === 'contests' && (
              data.contests?.length
                ? data.contests.map((c, i) => <ContestCard key={i} contest={c} />)
                : <div className="card" style={{ textAlign:'center', padding:36 }}><p className="text-muted">No contests found for this address.</p></div>
            )}
            {activeTab === 'polling' && (
              data.pollingLocations?.length
                ? data.pollingLocations.map((p, i) => <PollingCard key={i} location={p} />)
                : <div className="card" style={{ textAlign:'center', padding:36 }}><p className="text-muted">No polling locations found.</p></div>
            )}
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="card" style={{ textAlign:'center', padding:64, borderStyle:'dashed' }}>
          <FileText size={48} style={{ color:'var(--text-muted)', margin:'0 auto 16px' }} />
          <h3 style={{ color:'var(--text-muted)', marginBottom:8 }}>Enter Your Address</h3>
          <p className="text-sm text-secondary">We'll show you exactly who and what is on your ballot.</p>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight, ShieldCheck, Clock, FileText, MessageSquare, Bell, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react'

const QUICK_STATS = [
  { label: 'Days to Election', value: '185', icon: Clock, color: '#818cf8' },
  { label: 'Steps Completed', value: '0/4', icon: CheckCircle2, color: '#22c55e' },
  { label: 'Readiness Score', value: '12%', icon: TrendingUp, color: '#f59e0b' },
]

const FEATURES = [
  { icon: Clock,        title: 'My Timeline',     desc: 'Personalized deadline countdown for your ZIP code.', path: '/timeline', color: '#818cf8' },
  { icon: BookOpen,     title: 'How-To Guides',   desc: 'Step-by-step walkthroughs for registration & absentee voting.', path: '/how-to', color: '#06b6d4' },
  { icon: FileText,     title: 'Ballot Preview',  desc: 'See exactly who and what is on your local ballot.', path: '/ballot', color: '#a78bfa' },
  { icon: MessageSquare,title: 'AI Assistant',    desc: 'Ask any voting question — neutral, verified answers only.', path: '/faq', color: '#34d399' },
  { icon: Bell,         title: 'Set Reminders',   desc: 'Get email/SMS alerts before key deadlines pass.', path: '/remind', color: '#fb923c' },
  { icon: ShieldCheck,  title: 'ID Checker',      desc: 'Find out exactly what ID your state requires.', path: '/how-to?tab=id', color: '#f472b6' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [zip, setZip] = useState('')
  const [zipSubmitted, setZipSubmitted] = useState(false)

  const handleZip = (e) => {
    e.preventDefault()
    if (zip.length === 5) {
      setZipSubmitted(true)
      navigate(`/timeline?zip=${zip}`)
    }
  }

  return (
    <div className="animate-fadeUp">
      {/* Hero */}
      <section style={{ textAlign:'center', padding:'48px 0 40px', maxWidth:680, margin:'0 auto' }}>
        <div className="badge badge-accent" style={{ marginBottom:16 }}>
          🗳️ 2026 General Election · Nonpartisan Guide
        </div>
        <h1 style={{ marginBottom:16 }}>
          Your Smart{' '}
          <span className="text-gradient">Election Navigator</span>
        </h1>
        <p className="text-secondary" style={{ fontSize:'1.1rem', lineHeight:1.8, marginBottom:36 }}>
          Localized step-by-step guidance on voter registration, deadlines, and ballot information — powered by verified official sources, never partisan opinion.
        </p>

        {/* ZIP form */}
        <form onSubmit={handleZip} style={{ display:'flex', gap:12, maxWidth:420, margin:'0 auto', justifyContent:'center', flexWrap:'wrap' }} role="search" aria-label="Find your voting information">
          <div className="input-group" style={{ flex:1, minWidth:200 }}>
            <MapPin size={18} className="input-icon" aria-hidden="true" />
            <input
              id="zip-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              className="input"
              placeholder="Enter your ZIP code"
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/,'').slice(0,5))}
              aria-label="ZIP code"
              aria-describedby="zip-hint"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={zip.length !== 5} aria-label="Find my voting information">
            Get Started <ChevronRight size={16} />
          </button>
        </form>
        <p id="zip-hint" className="text-xs text-muted" style={{ marginTop:10 }}>Enter your 5-digit ZIP to get localized deadlines & ballot info</p>
      </section>

      {/* Stats row */}
      <div className="grid-3 mb-6">
        {QUICK_STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card card-sm flex items-center gap-4">
            <div style={{ width:48, height:48, borderRadius:12, background:`${color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:'var(--font-display)', color }}>{value}</div>
              <div className="text-sm text-secondary">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall readiness bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3>Voting Readiness</h3>
            <p className="text-sm text-secondary mt-2">Complete the steps below to reach 100% Ready to Vote</p>
          </div>
          <div className="badge badge-warning">12% Ready</div>
        </div>
        <div className="progress-wrap" role="progressbar" aria-valuenow={12} aria-valuemin={0} aria-valuemax={100} aria-label="Voting readiness: 12%">
          <div className="progress-fill" style={{ width:'12%' }} />
        </div>
        <div className="flex gap-4 mt-4" style={{ flexWrap:'wrap' }}>
          {['Enter ZIP','Register','Check ID','Plan Your Vote'].map((step, i) => (
            <div key={step} className="flex items-center gap-2 text-xs text-muted">
              <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:700 }}>
                {i + 1}
              </div>
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <h2 style={{ marginBottom:20 }}>Everything You Need to Vote</h2>
      <div className="grid-2">
        {FEATURES.map(({ icon: Icon, title, desc, path, color }) => (
          <button
            key={title}
            className="card"
            onClick={() => navigate(path)}
            style={{ textAlign:'left', cursor:'pointer', background:'var(--bg-glass)' }}
            aria-label={`Go to ${title}`}
          >
            <div style={{ width:48, height:48, borderRadius:12, background:`${color}22`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
              <Icon size={22} style={{ color }} />
            </div>
            <h3 style={{ marginBottom:8 }}>{title}</h3>
            <p className="text-sm text-secondary">{desc}</p>
            <div className="flex items-center gap-2 mt-4" style={{ color, fontSize:'0.85rem', fontWeight:600 }}>
              Explore <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>

      {/* Non-partisan note */}
      <div className="card mt-6" style={{ background:'rgba(34,197,94,0.05)', borderColor:'rgba(34,197,94,0.2)', textAlign:'center', padding:24 }}>
        <ShieldCheck size={28} style={{ color:'#4ade80', margin:'0 auto 12px' }} />
        <h4 style={{ color:'#4ade80', marginBottom:8 }}>100% Nonpartisan Commitment</h4>
        <p className="text-sm text-secondary" style={{ maxWidth:500, margin:'0 auto' }}>
          This guide never recommends candidates or parties. All election dates are sourced from verified state .gov websites. Our AI is configured to redirect any political opinion questions.
        </p>
      </div>
    </div>
  )
}

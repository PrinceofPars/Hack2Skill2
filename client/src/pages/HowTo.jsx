import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserCheck, Mail, ShieldCheck, ChevronRight, ChevronLeft, CheckCircle2, Circle, ExternalLink } from 'lucide-react'

const MODULES = {
  register: {
    id: 'register',
    icon: UserCheck,
    color: '#818cf8',
    title: 'First-Time Voter Registration',
    intro: 'Registering to vote is your first step. The process takes about 5 minutes.',
    steps: [
      {
        title: 'Confirm You Are Eligible',
        body: 'You must be a U.S. citizen, at least 18 by Election Day, and a resident of your state. Most states also require you not to be serving a felony sentence.',
        tip: '✅ You can check your eligibility at vote.gov instantly.',
        link: 'https://vote.gov/register',
        linkLabel: 'Check eligibility at vote.gov'
      },
      {
        title: 'Gather Your Information',
        body: "You'll need your state ID or driver's license number (or last 4 digits of SSN), current home address, and date of birth. Have these ready before you start.",
        tip: '💡 Use your legal name exactly as it appears on your government ID.',
        link: null
      },
      {
        title: 'Submit Your Registration',
        body: 'Visit your state\'s official election website or vote.gov to register online (if available), by mail, or in person at your local election office.',
        tip: '⏰ Submit well before the deadline — usually 15–30 days before Election Day.',
        link: 'https://vote.gov/register',
        linkLabel: 'Register at vote.gov'
      },
      {
        title: 'Confirm Your Registration',
        body: 'After registering, check your status online. You should receive a confirmation card by mail within a few weeks.',
        tip: '🔍 Search "[Your State] check voter registration status" to verify.',
        link: 'https://www.nass.org/can-I-vote',
        linkLabel: 'Check status (NASS)'
      }
    ]
  },
  absentee: {
    id: 'absentee',
    icon: Mail,
    color: '#06b6d4',
    title: 'Applying for an Absentee / Mail-In Ballot',
    intro: 'You can often vote from home. Here\'s the exact process to request and return your ballot safely.',
    steps: [
      {
        title: 'Check Your State\'s Rules',
        body: 'Most states allow any registered voter to request a mail-in ballot. Some require a reason (illness, travel, disability). A few states mail ballots to all registered voters automatically.',
        tip: '📋 Find your state\'s rules at vote.gov/absentee-voting',
        link: 'https://www.usa.gov/absentee-voting',
        linkLabel: 'Absentee rules by state'
      },
      {
        title: 'Request Your Ballot',
        body: 'Submit a request to your county clerk — online, by mail, or in person — before the deadline. The deadline is typically 7–15 days before Election Day.',
        tip: '📅 Request early! Processing takes time and postal delays happen.',
        link: 'https://vote.gov/register',
        linkLabel: 'Request through vote.gov'
      },
      {
        title: 'Complete & Sign Your Ballot',
        body: 'When your ballot arrives, follow all instructions precisely. Use blue or black ink. Sign the envelope exactly as you registered — your vote can be rejected for a signature mismatch.',
        tip: '✍️ Sign the outer envelope, not the ballot itself.',
        link: null
      },
      {
        title: 'Return Your Ballot',
        body: 'Return by mail (allow 1 week), official drop box, or in-person at your election office or polling place — whichever your state allows. Keep the tracking number.',
        tip: '📬 Track your ballot online through your county\'s election website.',
        link: null
      }
    ]
  },
  id: {
    id: 'id',
    icon: ShieldCheck,
    color: '#a78bfa',
    title: 'Verifying Your Required ID',
    intro: 'ID requirements vary by state. Use this guide to make sure you\'re prepared before you arrive at the polls.',
    steps: [
      {
        title: 'Find Your State\'s Requirements',
        body: 'About 35 states require some form of ID to vote. Some require strict photo ID; others accept a wider variety of documents. Check NCSL\'s voter ID laws map for your state.',
        tip: '🗺️ NCSL maintains a verified, up-to-date ID requirements database.',
        link: 'https://www.ncsl.org/elections-and-campaigns/voter-id',
        linkLabel: 'NCSL Voter ID Map'
      },
      {
        title: 'Common Accepted IDs',
        body: 'Driver\'s license, state-issued ID card, U.S. passport, U.S. military ID, tribal ID. Some states also accept student IDs from public institutions.',
        tip: '📸 Ensure your ID is not expired. Many states accept expired IDs within 4 years.',
        link: null
      },
      {
        title: 'If You Don\'t Have ID',
        body: 'If your state requires ID and you don\'t have one, you may be able to cast a provisional ballot, obtain a free Election ID Certificate, or vote with a non-photo ID like a utility bill.',
        tip: '🆓 Free voter ID is available in all strict-ID states by law.',
        link: 'https://www.aclu.org/voter-id-laws',
        linkLabel: 'ACLU Voter ID resources'
      },
      {
        title: 'Verify Before Election Day',
        body: 'Contact your county elections office to confirm exactly what is required at your specific polling location. Don\'t wait until Election Day to discover a problem.',
        tip: '📞 Your county clerk\'s number is on your voter registration card.',
        link: null
      }
    ]
  }
}

function StepperModule({ module, onBack }) {
  const [current, setCurrent] = useState(0)
  const [completed, setCompleted] = useState(new Set())
  const Icon = module.icon
  const steps = module.steps
  const step = steps[current]

  const markComplete = () => {
    setCompleted(prev => new Set([...prev, current]))
    if (current < steps.length - 1) setCurrent(c => c + 1)
  }

  const pct = Math.round((completed.size / steps.length) * 100)

  return (
    <div className="animate-fadeUp">
      <button onClick={onBack} className="btn btn-ghost btn-sm mb-6">
        <ChevronLeft size={16} /> Back to Guides
      </button>

      <div className="card mb-6" style={{ background:`linear-gradient(135deg,${module.color}22,${module.color}11)`, borderColor:`${module.color}44` }}>
        <div className="flex items-center gap-4 mb-4" style={{ flexWrap:'wrap' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:`${module.color}33`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon size={26} style={{ color:module.color }} />
          </div>
          <div>
            <h2 style={{ marginBottom:4 }}>{module.title}</h2>
            <p className="text-secondary text-sm">{module.intro}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-secondary">Progress</span>
          <span style={{ fontWeight:700, color:module.color }}>{pct}% Complete</span>
        </div>
        <div className="progress-wrap" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${module.color},${module.color}99)` }} />
        </div>
      </div>

      <div className="grid-2" style={{ gap:24 }}>
        {/* Stepper nav */}
        <div className="card">
          <h4 style={{ marginBottom:20, color:'var(--text-secondary)' }}>Steps Overview</h4>
          <div className="stepper" role="list">
            {steps.map((s, i) => {
              const done = completed.has(i)
              const active = i === current
              return (
                <div key={i}
                  className={`step-item${active ? ' active' : ''}${done ? ' completed' : ''}`}
                  role="listitem"
                  aria-current={active ? 'step' : undefined}
                >
                  <div className="step-icon" aria-hidden="true">
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <div className="step-content">
                    <div className="step-label">{done ? 'Completed' : active ? 'Current' : 'Upcoming'}</div>
                    <button
                      className="step-title"
                      style={{ background:'none', border:'none', color:'inherit', textAlign:'left', cursor:'pointer', padding:0, fontFamily:'inherit', fontWeight:600, fontSize:'1.05rem' }}
                      onClick={() => setCurrent(i)}
                    >
                      {s.title}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step detail */}
        <div className="card">
          <div className="badge badge-accent mb-4">Step {current + 1} of {steps.length}</div>
          <h3 style={{ marginBottom:16 }}>{step.title}</h3>
          <p className="text-secondary" style={{ lineHeight:1.8, marginBottom:16 }}>{step.body}</p>

          <div style={{ background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', padding:14, borderLeft:`3px solid ${module.color}`, marginBottom:20 }}>
            <p className="text-sm" style={{ color:'var(--text-secondary)' }}>{step.tip}</p>
          </div>

          {step.link && (
            <a href={step.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm mb-4" style={{ textDecoration:'none' }}>
              <ExternalLink size={14} /> {step.linkLabel}
            </a>
          )}

          <div className="flex gap-3" style={{ marginTop:'auto', flexWrap:'wrap' }}>
            {current > 0 && (
              <button className="btn btn-secondary" onClick={() => setCurrent(c => c - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={markComplete}
              style={{ flex:1, background:`linear-gradient(135deg,${module.color},${module.color}bb)` }}
              disabled={completed.has(current) && current === steps.length - 1}
            >
              {completed.has(current) ? (current < steps.length - 1 ? 'Next Step' : '✅ All Done!') : 'Mark Complete'} 
              {current < steps.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HowTo() {
  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab')
  const [selected, setSelected] = useState(defaultTab && MODULES[defaultTab] ? defaultTab : null)

  if (selected) return <StepperModule module={MODULES[selected]} onBack={() => setSelected(null)} />

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h1 style={{ marginBottom:8 }}>Interactive <span className="text-gradient">How-To Guides</span></h1>
        <p className="text-secondary">Step-by-step modules to walk you through every part of the voting process.</p>
      </div>

      <div className="grid-3">
        {Object.values(MODULES).map(m => {
          const Icon = m.icon
          return (
            <button
              key={m.id}
              className="card"
              style={{ textAlign:'left', cursor:'pointer' }}
              onClick={() => setSelected(m.id)}
              aria-label={`Open guide: ${m.title}`}
            >
              <div style={{ width:52, height:52, borderRadius:14, background:`${m.color}22`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Icon size={26} style={{ color:m.color }} />
              </div>
              <h3 style={{ marginBottom:10 }}>{m.title}</h3>
              <p className="text-sm text-secondary" style={{ marginBottom:20 }}>{m.intro}</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                {m.steps.map((_, i) => (
                  <div key={i} style={{ width:24, height:6, borderRadius:3, background:`${m.color}44` }} />
                ))}
              </div>
              <div className="flex items-center gap-2" style={{ color:m.color, fontSize:'0.85rem', fontWeight:600 }}>
                Start Guide ({m.steps.length} steps) <ChevronRight size={14} />
              </div>
            </button>
          )
        })}
      </div>

      <div className="card mt-6" style={{ borderStyle:'dashed', textAlign:'center', padding:36 }}>
        <p className="text-secondary text-sm" style={{ maxWidth:480, margin:'0 auto' }}>
          Each guide follows the <strong>"Simplicity Rule"</strong>: no more than 3 sentences per step, with direct links to official .gov sources and a clear progress tracker.
        </p>
      </div>
    </div>
  )
}

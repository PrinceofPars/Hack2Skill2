import { useState } from 'react'
import { Bell, Mail, Phone, User, CheckCircle2, Loader2, Download } from 'lucide-react'
import { useElectionAPI } from '../hooks/useElectionAPI'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

const DEADLINES = [
  { id: 'reg',       label: 'Voter Registration Deadline', date: '~30 days before Election Day' },
  { id: 'absentee',  label: 'Absentee Ballot Request',     date: '~7–15 days before Election Day' },
  { id: 'early',     label: 'Early Voting Begins',         date: '~10–40 days before Election Day' },
  { id: 'election',  label: 'Election Day',                date: 'November 3, 2026' },
]

function drawAccentBar(doc, x, y, w = 4, h = 18, r = 6, g = 102, b = 241) {
  doc.setFillColor(r, g, b)
  doc.roundedRect(x, y - 13, w, h, 2, 2, 'F')
}

function sectionHeader(doc, label, y, W) {
  // colored accent bar on left
  doc.setFillColor(99, 102, 241)
  doc.roundedRect(40, y - 13, 4, 18, 2, 2, 'F')
  // light separator line
  doc.setDrawColor(40, 55, 90)
  doc.setLineWidth(0.5)
  doc.line(54, y - 4, W - 40, y - 4)
  // label
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(129, 140, 248)
  doc.text(label, 52, y)
}

function exportVotingPlan({ name, state, pollingPlace, hours, idRequired, zip }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()   // 612 pt
  const H = doc.internal.pageSize.getHeight()  // 792 pt

  // ── Background ──────────────────────────────────────────────────────
  doc.setFillColor(8, 14, 30)
  doc.rect(0, 0, W, H, 'F')

  // ── Header band ─────────────────────────────────────────────────────
  doc.setFillColor(55, 58, 163)   // deep indigo
  doc.rect(0, 0, W, 78, 'F')
  // accent stripe at very top
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, W, 4, 'F')

  // Ballot-check icon (drawn primitives)
  const ix = 42, iy = 24
  doc.setFillColor(255, 255, 255, 0.9)
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(1.5)
  doc.roundedRect(ix, iy, 26, 30, 3, 3, 'S')
  // checkmark lines
  doc.setLineWidth(2)
  doc.line(ix + 6, iy + 17, ix + 11, iy + 23)
  doc.line(ix + 11, iy + 23, ix + 21, iy + 11)

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('My Voting Plan', ix + 34, iy + 20)

  // Sub-line
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 185, 240)
  doc.text('Smart Election Navigator  |  vote.gov', ix + 34, iy + 35)

  // Generated date (right side)
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  doc.setFontSize(8)
  doc.setTextColor(160, 165, 210)
  doc.text(`Generated: ${dateStr}`, W - 40, iy + 28, { align: 'right' })

  // ── Voter identity block ─────────────────────────────────────────────
  doc.setFillColor(15, 22, 48)
  doc.roundedRect(40, 96, W - 80, 52, 6, 6, 'F')
  doc.setDrawColor(50, 60, 120)
  doc.setLineWidth(0.5)
  doc.roundedRect(40, 96, W - 80, 52, 6, 6, 'S')

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(230, 235, 255)
  doc.text(name || 'Anonymous Voter', 58, 118)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 135, 180)
  const stateLine = [
    state ? `State: ${state}` : null,
    zip   ? `ZIP: ${zip}`   : null,
  ].filter(Boolean).join('   |   ') || 'Visit the Timeline page and enter your ZIP for localized info'
  doc.text(stateLine, 58, 136)

  // ── Section 1: Polling Location ──────────────────────────────────────
  sectionHeader(doc, 'POLLING LOCATION', 178, W)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(220, 225, 255)
  const place = pollingPlace || 'Visit your county election website to find your assigned polling place'
  const placeLines = doc.splitTextToSize(place, W - 100)
  doc.text(placeLines, 52, 200)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 120, 180)
  const hoursY = 200 + placeLines.length * 14 + 6
  doc.text(`Poll Hours:  ${hours || '7:00 AM - 7:00 PM  (confirm with your county)'}`, 52, hoursY)

  // ── Section 2: Required ID ───────────────────────────────────────────
  const idTopY = hoursY + 46
  sectionHeader(doc, 'REQUIRED IDENTIFICATION', idTopY, W)

  doc.setFillColor(14, 20, 44)
  doc.roundedRect(40, idTopY + 10, W - 80, 46, 5, 5, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(210, 215, 255)
  const idText = idRequired || 'Check your state requirements at vote.gov'
  const idLines = doc.splitTextToSize(idText, W - 110)
  doc.text(idLines, 56, idTopY + 30)

  // ── Section 3: Key Deadlines ─────────────────────────────────────────
  const dlTopY = idTopY + 76
  sectionHeader(doc, 'KEY DEADLINES', dlTopY, W)

  const dlStartY = dlTopY + 18
  DEADLINES.forEach((d, i) => {
    const rowY = dlStartY + i * 36
    // alternating row bg
    if (i % 2 === 0) {
      doc.setFillColor(14, 20, 44)
      doc.rect(40, rowY - 2, W - 80, 32, 'F')
    }
    // dot
    doc.setFillColor(99, 102, 241)
    doc.circle(52, rowY + 11, 3, 'F')
    // label
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(210, 215, 255)
    doc.text(d.label, 62, rowY + 14)
    // date (right-aligned)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(129, 140, 248)
    doc.text(d.date, W - 44, rowY + 14, { align: 'right' })
  })

  // ── Divider before footer ────────────────────────────────────────────
  doc.setDrawColor(30, 40, 80)
  doc.setLineWidth(0.5)
  doc.line(40, H - 60, W - 40, H - 60)

  // ── Footer ───────────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(70, 85, 120)
  doc.text(
    'This plan is for reference only. Always verify all deadlines with your official state election website.',
    40, H - 44, { maxWidth: W - 80 }
  )
  doc.text(
    'Resources:  vote.gov   |   ncsl.org/elections   |   usa.gov/absentee-voting   |   ballotpedia.org',
    40, H - 28
  )

  // accent line at very bottom
  doc.setFillColor(99, 102, 241)
  doc.rect(0, H - 4, W, 4, 'F')

  doc.save('My_Voting_Plan.pdf')
}


export default function Reminders() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', state:'' })
  const [selected, setSelected] = useState(new Set(['reg', 'election']))
  const [submitted, setSubmitted] = useState(false)

  // PDF plan fields
  const [pdfName, setPdfName] = useState('')
  const [pdfPolling, setPdfPolling] = useState('')
  const [pdfHours, setPdfHours] = useState('7:00 AM – 7:00 PM')
  const [pdfId, setPdfId] = useState('')
  const [pdfZip, setPdfZip] = useState('')

  const { loading, registerReminder } = useElectionAPI()

  function toggle(id) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const deadlines = DEADLINES.filter(d => selected.has(d.id))
    const result = await registerReminder({ ...form, deadlines })
    if (result?.success) {
      setSubmitted(true)
      toast.success('Reminder registered successfully!')
    } else {
      toast.error('Could not register reminder. Check server connection.')
    }
  }

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h1 style={{ marginBottom:8 }}>Deadline <span className="text-gradient">Reminders</span></h1>
        <p className="text-secondary">Get notified before key election deadlines — and export your personalized Voting Plan PDF.</p>
      </div>

      <div className="grid-2" style={{ gap:24, alignItems:'start' }}>
        {/* Reminder form */}
        <div className="card">
          <h3 style={{ marginBottom:20 }}>📬 Set Deadline Reminders</h3>

          {submitted ? (
            <div style={{ textAlign:'center', padding:32 }}>
              <CheckCircle2 size={48} style={{ color:'#4ade80', margin:'0 auto 16px' }} />
              <h3 style={{ color:'#4ade80', marginBottom:8 }}>You're Set!</h3>
              <p className="text-secondary text-sm">We'll send reminders before your selected deadlines. Stay civic!</p>
              <button className="btn btn-secondary btn-sm mt-4" onClick={() => setSubmitted(false)}>Set Another Reminder</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} aria-label="Set election reminders">
              <div style={{ marginBottom:16 }}>
                <label htmlFor="rem-name"><User size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Full Name</label>
                <input id="rem-name" type="text" className="input" placeholder="Jane Smith" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label htmlFor="rem-email"><Mail size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Email Address</label>
                <input id="rem-email" type="email" className="input" placeholder="jane@example.com" value={form.email} onChange={e => setForm(f => ({...f, email:e.target.value}))} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label htmlFor="rem-phone"><Phone size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:6 }} />Phone (SMS)</label>
                <input id="rem-phone" type="tel" className="input" placeholder="+1 555 000 0000 (optional)" value={form.phone} onChange={e => setForm(f => ({...f, phone:e.target.value}))} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label htmlFor="rem-state">State</label>
                <input id="rem-state" type="text" className="input" placeholder="e.g. California" value={form.state} onChange={e => setForm(f => ({...f, state:e.target.value}))} />
              </div>

              <label style={{ marginBottom:12, display:'block' }}>Which deadlines to remind me about?</label>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                {DEADLINES.map(d => (
                  <label key={d.id} className="flex items-center gap-3" style={{ cursor:'pointer', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background: selected.has(d.id) ? 'var(--accent-glow)' : 'var(--bg-elevated)', borderColor: selected.has(d.id) ? 'rgba(99,102,241,0.4)' : 'var(--border)', transition:'all 0.2s' }}>
                    <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggle(d.id)} style={{ accentColor:'var(--accent)' }} aria-label={`Remind me about ${d.label}`} />
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{d.label}</div>
                      <div className="text-xs text-secondary">{d.date}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading || (!form.email && !form.phone)}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Bell size={16} /> Register Reminders</>}
              </button>
              {!form.email && !form.phone && <p className="text-xs text-muted" style={{ textAlign:'center', marginTop:8 }}>Enter email or phone to register</p>}
            </form>
          )}
        </div>

        {/* PDF Export panel */}
        <div className="card">
          <h3 style={{ marginBottom:8 }}>📄 Export Voting Plan PDF</h3>
          <p className="text-sm text-secondary" style={{ marginBottom:20 }}>Generate a personalized one-page summary of your polling place, hours, required ID, and deadlines.</p>

          <div style={{ marginBottom:14 }}>
            <label htmlFor="pdf-name">Your Name</label>
            <input id="pdf-name" type="text" className="input" placeholder="Jane Smith" value={pdfName} onChange={e => setPdfName(e.target.value)} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label htmlFor="pdf-zip">ZIP Code</label>
            <input id="pdf-zip" type="text" className="input" maxLength={5} placeholder="90210" value={pdfZip} onChange={e => setPdfZip(e.target.value.replace(/\D/,'').slice(0,5))} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label htmlFor="pdf-polling">Polling Place Name / Address</label>
            <input id="pdf-polling" type="text" className="input" placeholder="City Hall, 100 Main St" value={pdfPolling} onChange={e => setPdfPolling(e.target.value)} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label htmlFor="pdf-hours">Poll Hours</label>
            <input id="pdf-hours" type="text" className="input" placeholder="7:00 AM – 7:00 PM" value={pdfHours} onChange={e => setPdfHours(e.target.value)} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label htmlFor="pdf-id">ID You'll Bring</label>
            <input id="pdf-id" type="text" className="input" placeholder="Driver's License / Passport" value={pdfId} onChange={e => setPdfId(e.target.value)} />
          </div>

          <button
            className="btn btn-success w-full"
            onClick={() => exportVotingPlan({ name:pdfName, state:'', pollingPlace:pdfPolling, hours:pdfHours, idRequired:pdfId, zip:pdfZip })}
          >
            <Download size={16} /> Download Voting Plan PDF
          </button>

          <div className="card mt-4" style={{ background:'rgba(99,102,241,0.05)', borderColor:'rgba(99,102,241,0.2)', padding:14 }}>
            <p className="text-xs text-secondary">🔒 No personal data is stored or transmitted. The PDF is generated entirely in your browser. We take your privacy seriously.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

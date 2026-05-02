import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, MapPin, Loader2, ShieldCheck } from 'lucide-react'
import { useElectionAPI } from '../hooks/useElectionAPI'

const SUGGESTED = [
  'What ID do I need to vote?',
  'How do I apply for an absentee ballot?',
  'When does early voting start?',
  'What if my signature has changed?',
  'Can I register on Election Day?',
  'What time do polls close?',
]

const WELCOME = {
  role: 'ai',
  content: `Hello! I'm your neutral Election Guide 🗳️<br/><br/>I can help you with:<br/>• Voter registration requirements<br/>• Absentee & mail-in ballot procedures<br/>• ID requirements by state<br/>• Early voting information<br/>• Polling hours & locations<br/>• Edge-case questions like signature changes<br/><br/>Enter your ZIP code below for localized answers, or just ask your question!`,
  source: null
}

export default function FAQChat() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [zip, setZip] = useState('')
  const bottomRef = useRef(null)
  const { loading, askAI } = useElectionAPI()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: msg }])

    const result = await askAI(msg, zip || undefined)

    setMessages(prev => [...prev, {
      role: 'ai',
      content: result?.answer || 'I had trouble finding an answer. Please visit <a href="https://vote.gov" target="_blank">vote.gov</a> for official information.',
      source: result?.source,
      context: result?.stateContext,
      confidence: result?.confidence
    }])
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h1 style={{ marginBottom:8 }}>AI <span className="text-gradient">FAQ Assistant</span></h1>
        <p className="text-secondary">Ask anything about voting. Answers are grounded in verified state election law — never partisan opinion.</p>
      </div>

      <div className="grid-2" style={{ gap:24, alignItems:'start' }}>
        {/* Chat panel */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-elevated)' }}>
            <div className="flex items-center gap-3">
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Bot size={18} style={{ color:'var(--accent-light)' }} />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.95rem' }}>Election Guide AI</div>
                <div className="text-xs text-muted">Neutral · Verified · Non-partisan</div>
              </div>
              <div className="badge badge-success" style={{ marginLeft:'auto' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} /> Live
              </div>
            </div>
          </div>

          {/* ZIP context */}
          <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', background:'rgba(99,102,241,0.05)' }}>
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color:'var(--text-muted)' }} aria-hidden="true" />
              <input
                type="text" inputMode="numeric" maxLength={5}
                placeholder="ZIP code (optional — for localized answers)"
                value={zip}
                onChange={e => setZip(e.target.value.replace(/\D/,'').slice(0,5))}
                style={{ background:'transparent', border:'none', color:'var(--text-secondary)', fontSize:'0.8rem', flex:1, outline:'none', fontFamily:'inherit' }}
                aria-label="ZIP code for localized answers"
              />
              {zip.length === 5 && <span className="badge badge-accent">{zip}</span>}
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages" aria-live="polite" aria-label="Chat messages">
            {messages.map((m, i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width:30, height:30, borderRadius:'50%', flexShrink:0,
                  background: m.role === 'user' ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'var(--bg-elevated)',
                  border:'1px solid var(--border)',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }} aria-hidden="true">
                  {m.role === 'user' ? <User size={14} color="#fff" /> : <Bot size={14} style={{ color:'var(--accent-light)' }} />}
                </div>
                <div style={{ maxWidth:'80%', display:'flex', flexDirection:'column', gap:4, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div
                    className={`chat-bubble ${m.role}`}
                    dangerouslySetInnerHTML={{ __html: m.content }}
                  />
                  {m.source && (
                    <div className="text-xs text-muted flex items-center gap-1">
                      <ShieldCheck size={10} /> Source: {m.source}
                      {m.context && ` · ${m.context}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-center">
                <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Bot size={14} style={{ color:'var(--accent-light)' }} />
                </div>
                <div className="chat-bubble ai" style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <Loader2 size={14} className="animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              id="chat-input"
              type="text" className="input"
              placeholder="Ask about registration, ID, absentee voting…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              aria-label="Type your voting question"
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Suggestions sidebar */}
        <div>
          <div className="card mb-4">
            <h4 style={{ marginBottom:16 }}>💡 Try asking...</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  className="btn btn-ghost btn-sm"
                  style={{ textAlign:'left', justifyContent:'flex-start' }}
                  onClick={() => send(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ background:'rgba(34,197,94,0.05)', borderColor:'rgba(34,197,94,0.2)' }}>
            <ShieldCheck size={20} style={{ color:'#4ade80', marginBottom:10 }} />
            <h4 style={{ color:'#4ade80', marginBottom:8 }}>AI Guardrails</h4>
            <ul className="text-sm text-secondary" style={{ lineHeight:2, paddingLeft:16 }}>
              <li>Answers grounded in verified state JSON</li>
              <li>Political questions are redirected neutrally</li>
              <li>All answers cite official .gov sources</li>
              <li>No candidate ranking or recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import {
  LayoutDashboard, Calendar, ClipboardList, FileText,
  MessageSquare, Bell, ChevronRight, Vote, Menu, X
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Timeline from './pages/Timeline'
import HowTo from './pages/HowTo'
import BallotPreview from './pages/BallotPreview'
import FAQChat from './pages/FAQChat'
import Reminders from './pages/Reminders'
import './index.css'

const NAV_ITEMS = [
  { path: '/',         icon: LayoutDashboard, label: 'Dashboard',        end: true },
  { path: '/timeline', icon: Calendar,         label: 'My Timeline'              },
  { path: '/how-to',   icon: ClipboardList,    label: 'How-To Guides'           },
  { path: '/ballot',   icon: FileText,         label: 'Ballot Preview'          },
  { path: '/faq',      icon: MessageSquare,    label: 'AI Assistant'            },
  { path: '/remind',   icon: Bell,             label: 'Reminders'               },
]

function Sidebar({ mobile, onClose }) {
  return (
    <nav className="sidebar" role="navigation" aria-label="Main navigation"
      style={mobile ? { display:'flex', position:'fixed', zIndex:200, left:0, top:0, width:260, height:'100vh', boxShadow:'4px 0 32px rgba(0,0,0,0.5)' } : {}}>
      <div className="sidebar-logo">
        <div className="flex items-center gap-2">
          <div style={{ width:36, height:36, background:'linear-gradient(135deg,#6366f1,#06b6d4)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Vote size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.95rem', color:'var(--text-primary)' }}>ElectNav</div>
            <div className="text-xs text-muted">Smart Election Guide</div>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ position:'absolute', top:16, right:16 }} aria-label="Close menu">
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 14px' }}>Navigate</div>

      {NAV_ITEMS.map(({ path, icon: Icon, label, end }) => (
        <NavLink
          key={path} to={path} end={end}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          onClick={mobile ? onClose : undefined}
          aria-current={undefined}
        >
          <Icon size={18} />
          <span>{label}</span>
          <ChevronRight size={14} style={{ marginLeft:'auto', opacity:0.4 }} />
        </NavLink>
      ))}

      <div style={{ marginTop:'auto', padding:'16px 14px 0', borderTop:'1px solid var(--border)' }}>
        <div className="text-xs text-muted" style={{ lineHeight:1.6 }}>
          🗳️ Non-partisan & neutral. All data sourced from official .gov sources.
        </div>
      </div>
    </nav>
  )
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="bg-mesh" aria-hidden="true" />

      <div className="app-layout">
        {/* Desktop Sidebar */}
        <div style={{ display:'none' }} className="desktop-sidebar">
          <Sidebar />
        </div>
        <style>{`@media(min-width:769px){.desktop-sidebar{display:block!important}}`}</style>
        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <>
            <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:199 }} />
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </>
        )}

        <div className="main-content">
          <header className="header" role="banner">
            <button
              className="btn btn-ghost btn-sm"
              style={{ display:'none' }}
              id="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <style>{`@media(max-width:768px){#mobile-menu-btn{display:flex!important}}`}</style>

            <div className="flex items-center gap-2">
              <Vote size={20} style={{ color:'var(--accent-light)' }} />
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem' }}>
                Smart <span className="text-gradient">Election Navigator</span>
              </span>
            </div>
            <div className="badge badge-success flex items-center gap-2">
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
              Nonpartisan & Verified
            </div>
          </header>

          <main id="main-content" tabIndex={-1}>
            <div className="page-container">
              <Routes>
                <Route path="/"         element={<Dashboard />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/how-to"   element={<HowTo />} />
                <Route path="/ballot"   element={<BallotPreview />} />
                <Route path="/faq"      element={<FAQChat />} />
                <Route path="/remind"   element={<Reminders />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" toastOptions={{ style: { background:'var(--bg-elevated)', color:'var(--text-primary)', border:'1px solid var(--border)' } }} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

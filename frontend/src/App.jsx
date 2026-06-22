import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Students from './pages/Students'
import Enroll from './pages/Enroll'
import ApiExplorer from './pages/ApiExplorer'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/courses', label: 'Courses', icon: '📚' },
  { to: '/students', label: 'Students', icon: '🎓' },
  { to: '/enroll', label: 'Enrollment', icon: '✅' },
  { to: '/explorer', label: 'API Explorer', icon: '🔍' },
]

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>CourseHub</h2>
          <span>FastAPI Demo</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Navigation</div>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}

          <div className="sidebar-section" style={{ marginTop: 24 }}>Backend</div>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
            <span>📄</span> Swagger UI
          </a>
          <a href="http://localhost:8000/redoc" target="_blank" rel="noopener noreferrer">
            <span>📘</span> ReDoc
          </a>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div className="text-muted" style={{ fontSize: '11px', fontFamily: 'var(--mono)' }}>
            🔑 Admin token:<br />
            <span style={{ color: 'var(--accent)', wordBreak: 'break-all' }}>admin-secret-123</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/students" element={<Students />} />
          <Route path="/enroll" element={<Enroll />} />
          <Route path="/explorer" element={<ApiExplorer />} />
        </Routes>
      </main>
    </div>
  )
}

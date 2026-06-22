import { useEffect, useState } from 'react'
import { analyticsAPI } from '../api'

const CATEGORY_COLORS = {
  'Computer Science': '#6c63ff',
  'Data Science': '#10b981',
  'Artificial Intelligence': '#f59e0b',
  'Web Development': '#3b82f6',
  'Cloud Computing': '#8b5cf6',
  'DevOps': '#ef4444',
  'Mathematics': '#06b6d4',
  'Physics': '#ec4899',
}

const FASTAPI_CONCEPTS = [
  { emoji: '🛣️', label: 'Path & Query Params', file: 'main.py / courses_router' },
  { emoji: '📦', label: 'Pydantic v2 Models', file: 'models.py' },
  { emoji: '💉', label: 'Dependency Injection', file: 'dependencies.py' },
  { emoji: '⚙️', label: 'Background Tasks', file: 'enrollments_router' },
  { emoji: '🔀', label: 'Custom Middleware', file: 'main.py' },
  { emoji: '🚨', label: 'Exception Handlers', file: 'exceptions.py' },
  { emoji: '🗂️', label: 'APIRouter', file: 'main.py' },
  { emoji: '🔄', label: 'Lifespan Events', file: 'main.py' },
  { emoji: '⚡', label: 'Async / Await', file: 'analytics_router' },
  { emoji: '📎', label: 'File Uploads', file: 'students_router' },
  { emoji: '🍪', label: 'Headers & Cookies', file: 'students_router' },
  { emoji: '📄', label: 'OpenAPI Docs', file: '/docs' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    analyticsAPI.summary()
      .then(r => setStats(r.data))
      .catch(() => setError('Could not connect to backend. Make sure FastAPI is running on port 8000.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard 📊</h1>
        <p>Platform overview — powered by <code style={{ fontFamily: 'var(--mono)', background: 'var(--accent-soft)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent)', fontSize: '12px' }}>GET /analytics/summary</code></p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-screen"><div className="spinner" /><span>Fetching analytics...</span></div>
      ) : stats ? (
        <>
          {/* Stat Cards */}
          <div className="grid-3 mb-4">
            {[
              { label: 'Total Courses', value: stats.total_courses, icon: '📚' },
              { label: 'Students Registered', value: stats.total_students, icon: '🎓' },
              { label: 'Active Enrollments', value: stats.total_enrollments, icon: '✅' },
            ].map(({ label, value, icon }) => (
              <div className="card stat-card" key={label}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div className="stat-num">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Category Breakdown */}
            <div className="card">
              <div className="flex-between mb-4">
                <strong>Courses by Category</strong>
                <span className="badge badge-gray">{Object.keys(stats.courses_by_category).length} categories</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(stats.courses_by_category).map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex-between" style={{ marginBottom: 4 }}>
                      <span className="text-sm">{cat}</span>
                      <span className="mono">{count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${(count / stats.total_courses) * 100}%`,
                        background: CATEGORY_COLORS[cat] || 'var(--accent)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrollment Rate */}
            <div className="card">
              <div className="flex-between mb-4">
                <strong>Platform Health</strong>
                <span className="badge badge-green">Live</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div className="text-muted text-sm" style={{ marginBottom: 8 }}>Avg. Enrollment Rate</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--green)' }}>{stats.avg_enrollment_rate}%</div>
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="flex-between text-sm">
                    <span className="text-muted">Backend</span>
                    <span style={{ color: 'var(--green)' }}>● FastAPI + Uvicorn</span>
                  </div>
                  <div className="flex-between text-sm">
                    <span className="text-muted">Validation</span>
                    <span style={{ color: 'var(--accent)' }}>● Pydantic v2</span>
                  </div>
                  <div className="flex-between text-sm">
                    <span className="text-muted">Docs</span>
                    <span><a href="http://localhost:8000/docs" target="_blank" rel="noopener" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Swagger /docs ↗</a></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* FastAPI Concepts Grid */}
      <div className="card">
        <div className="flex-between mb-4">
          <strong>FastAPI Concepts in this Project</strong>
          <span className="badge badge-purple">{FASTAPI_CONCEPTS.length} concepts</span>
        </div>
        <div className="grid-3" style={{ gap: 10 }}>
          {FASTAPI_CONCEPTS.map(({ emoji, label, file }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: 'var(--bg)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div className="mono" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{file}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

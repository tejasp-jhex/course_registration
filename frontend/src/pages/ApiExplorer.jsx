import { useState } from 'react'

const BASE_URL = 'http://localhost:8000'
const ADMIN_TOKEN = 'admin-secret-123'

const ENDPOINTS = [
  {
    group: 'Root & Health',
    items: [
      { method: 'GET', path: '/', label: 'Welcome & API Info', concept: 'Root endpoint', body: null },
      { method: 'GET', path: '/health', label: 'Health Check', concept: 'Health check', body: null },
    ]
  },
  {
    group: 'Courses (GET)',
    items: [
      { method: 'GET', path: '/courses', label: 'List All Courses', concept: 'Query params + Pagination', params: '?page=1&page_size=5', body: null },
      { method: 'GET', path: '/courses?category=Data Science', label: 'Filter by Category', concept: 'Enum query param', body: null },
      { method: 'GET', path: '/courses?search=python', label: 'Search Courses', concept: 'Search query param', body: null },
      { method: 'GET', path: '/courses/CS101', label: 'Get Course by ID', concept: 'Path parameter', body: null },
      { method: 'GET', path: '/courses/INVALID', label: 'Get Missing Course → 404', concept: 'Custom exception', body: null },
    ]
  },
  {
    group: 'Courses (Admin)',
    items: [
      {
        method: 'POST', path: '/courses', label: 'Create Course', concept: 'Request body + admin auth',
        adminOnly: true,
        body: {
          title: "FastAPI Mastery",
          description: "A comprehensive guide to building production APIs with FastAPI, Pydantic, and SQLAlchemy.",
          category: "Web Development",
          credits: 4,
          max_students: 50,
          instructor: { name: "Dr. API Expert", email: "api@univ.edu", department: "Backend" },
          is_active: true
        }
      },
      {
        method: 'PATCH', path: '/courses/CS101', label: 'Partial Update CS101', concept: 'PATCH + exclude_unset',
        adminOnly: true,
        body: { credits: 4, is_active: true }
      },
    ]
  },
  {
    group: 'Students',
    items: [
      {
        method: 'POST', path: '/students/register', label: 'Register Student', concept: 'Pydantic email validation',
        body: { name: "Demo User", email: `demo${Date.now()}@test.com`, phone: "+917890000000", bio: "Testing from API Explorer" }
      },
      { method: 'GET', path: '/students/STU0001', label: 'Get Student STU0001', concept: 'Header + Cookie params', body: null },
      { method: 'GET', path: '/students/STU0001/enrollments', label: 'Student Enrollments', concept: 'Nested resource', body: null },
    ]
  },
  {
    group: 'Enrollments',
    items: [
      {
        method: 'POST', path: '/enrollments', label: 'Enroll Student', concept: 'BackgroundTasks + custom errors',
        body: { student_id: 'STU0002', course_id: 'CLOUD201' }
      },
      {
        method: 'POST', path: '/enrollments', label: 'Enroll (COURSE FULL → 409)', concept: 'CourseFullException',
        body: { student_id: 'STU0001', course_id: 'AI301' }
      },
    ]
  },
  {
    group: 'Analytics (Async)',
    items: [
      { method: 'GET', path: '/analytics/summary', label: 'Platform Summary', concept: 'async + asyncio.gather', body: null },
    ]
  },
]

const METHOD_COLORS = {
  GET: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  POST: { bg: 'rgba(108,99,255,0.1)', color: '#6c63ff' },
  PUT: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  PATCH: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  DELETE: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
}

export default function ApiExplorer() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})

  const call = async (ep) => {
    const key = `${ep.method}:${ep.path}:${ep.label}`
    setLoading(l => ({ ...l, [key]: true }))
    setResults(r => ({ ...r, [key]: null }))

    const start = Date.now()
    try {
      const opts = {
        method: ep.method,
        headers: {
          'Content-Type': 'application/json',
          ...(ep.adminOnly ? { 'x-admin-token': ADMIN_TOKEN } : {})
        },
      }
      if (ep.body) opts.body = JSON.stringify(ep.body)
      const res = await fetch(`${BASE_URL}${ep.path}`, opts)
      const data = await res.json()
      const ms = Date.now() - start
      setResults(r => ({ ...r, [key]: { status: res.status, data, ms, ok: res.ok } }))
    } catch (e) {
      setResults(r => ({ ...r, [key]: { status: 0, data: { error: e.message }, ms: Date.now() - start, ok: false } }))
    } finally {
      setLoading(l => ({ ...l, [key]: false }))
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>API Explorer 🔍</h1>
        <p>Try every FastAPI endpoint directly — inspect requests, responses, and concepts</p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        💡 Swagger UI also available at <a href="http://localhost:8000/docs" target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>localhost:8000/docs</a>
      </div>

      {ENDPOINTS.map(group => (
        <div key={group.group} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            {group.group}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {group.items.map(ep => {
              const key = `${ep.method}:${ep.path}:${ep.label}`
              const result = results[key]
              const isLoading = loading[key]
              const mc = METHOD_COLORS[ep.method] || {}

              return (
                <div key={key} className="card card-sm" style={{ border: result ? `1px solid ${result.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` : undefined }}>
                  <div className="flex-between" style={{ flexWrap: 'wrap', gap: 10 }}>
                    <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 4,
                        background: mc.bg, color: mc.color, fontFamily: 'var(--mono)'
                      }}>{ep.method}</span>
                      <code style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' }}>{ep.path}</code>
                      <span className="text-muted text-sm">{ep.label}</span>
                    </div>
                    <div className="flex-center gap-2">
                      <span className="concept-chip">{ep.concept}</span>
                      {ep.adminOnly && <span className="badge badge-yellow">🔑 Admin</span>}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => call(ep)}
                        disabled={isLoading}
                      >
                        {isLoading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '▶'} Run
                      </button>
                    </div>
                  </div>

                  {ep.body && (
                    <div style={{ marginTop: 10, padding: '10px', background: 'rgba(108,99,255,0.05)', borderRadius: 6, border: '1px solid rgba(108,99,255,0.1)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Request Body</div>
                      <pre style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#a78bfa', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {JSON.stringify(ep.body, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result && (
                    <div style={{ marginTop: 10 }}>
                      <div className="flex-center gap-2" style={{ marginBottom: 8 }}>
                        <span className={`badge ${result.ok ? 'badge-green' : 'badge-red'}`}>{result.status}</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{result.ms}ms</span>
                        {result.ok ? <span style={{ color: 'var(--green)', fontSize: 13 }}>✓</span> : <span style={{ color: 'var(--red)', fontSize: 13 }}>✗</span>}
                      </div>
                      <pre style={{
                        fontFamily: 'var(--mono)', fontSize: 11,
                        background: 'var(--bg)', padding: '12px', borderRadius: 6,
                        border: '1px solid var(--border)', color: result.ok ? '#a3e6cb' : '#fca5a5',
                        maxHeight: 260, overflow: 'auto', whiteSpace: 'pre-wrap', margin: 0
                      }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

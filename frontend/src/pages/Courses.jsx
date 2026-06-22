import { useEffect, useState, useCallback } from 'react'
import { coursesAPI } from '../api'

const CATEGORIES = [
  '', 'Computer Science', 'Data Science', 'Artificial Intelligence',
  'Web Development', 'Cloud Computing', 'DevOps', 'Mathematics', 'Physics'
]

const CATEGORY_ENUM = {
  'Computer Science': 'Computer Science',
  'Data Science': 'Data Science',
  'Artificial Intelligence': 'Artificial Intelligence',
  'Web Development': 'Web Development',
  'Cloud Computing': 'Cloud Computing',
  'DevOps': 'DevOps',
  'Mathematics': 'Mathematics',
  'Physics': 'Physics',
}

function getCapacityBadge(enrolled, max) {
  const pct = (enrolled / max) * 100
  if (pct >= 100) return { cls: 'badge-red', label: 'Full' }
  if (pct >= 80) return { cls: 'badge-yellow', label: 'Almost Full' }
  return { cls: 'badge-green', label: 'Open' }
}

function CourseModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Computer Science',
    credits: 3, max_students: 30, is_active: true,
    instructor: { name: '', email: '', department: '' }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setInstructor = (k, v) => setForm(f => ({ ...f, instructor: { ...f.instructor, [k]: v } }))

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      await coursesAPI.create(form)
      onSuccess()
      onClose()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Course</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="concepts-row">
          <span className="concept-chip">POST /courses</span>
          <span className="concept-chip">request body</span>
          <span className="concept-chip">pydantic validation</span>
          <span className="concept-chip">admin auth</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Advanced SQL" />
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Course description..." />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Credits (1–10)</label>
            <input className="form-input" type="number" min={1} max={10} value={form.credits} onChange={e => set('credits', +e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Max Students</label>
          <input className="form-input" type="number" min={1} max={500} value={form.max_students} onChange={e => set('max_students', +e.target.value)} />
        </div>
        <div className="divider" />
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Instructor</div>
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="form-input" value={form.instructor.name} onChange={e => setInstructor('name', e.target.value)} placeholder="Dr. Jane Smith" />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" value={form.instructor.email} onChange={e => setInstructor('email', e.target.value)} placeholder="jane@univ.edu" />
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <input className="form-input" value={form.instructor.department} onChange={e => setInstructor('department', e.target.value)} placeholder="Computer Science" />
          </div>
        </div>

        <div className="flex-between mt-4">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            Create Course
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [msg, setMsg] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 6 }
      if (search) params.search = search
      if (category) params.category = category
      const r = await coursesAPI.list(params)
      setCourses(r.data.data)
      setMeta(r.data)
    } catch {
      setMsg({ type: 'error', text: 'Failed to load courses. Is the backend running?' })
    } finally { setLoading(false) }
  }, [search, category, page])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await coursesAPI.delete(id)
      setMsg({ type: 'success', text: `Course ${id} deleted!` })
      load()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Delete failed' })
    } finally { setDeleting(null) }
  }

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1>Courses 📚</h1>
          <p>Browse, search, filter, and manage courses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Course</button>
      </div>

      <div className="concepts-row">
        <span className="concept-chip">GET /courses</span>
        <span className="concept-chip">query params</span>
        <span className="concept-chip">pagination</span>
        <span className="concept-chip">enum filter</span>
        <span className="concept-chip">DELETE /courses/{'{id}'}</span>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} onClick={() => setMsg(null)} style={{ cursor: 'pointer' }}>
          {msg.text} <span style={{ float: 'right' }}>✕</span>
        </div>
      )}

      {/* Filters */}
      <div className="card card-sm mb-4 flex-center gap-3" style={{ flexWrap: 'wrap', marginBottom: 20 }}>
        <div className="search-bar-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="icon">🔍</span>
          <input
            className="form-input search-bar"
            placeholder="Search courses..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className="form-select" style={{ width: 200 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory(''); setPage(1) }}>Clear</button>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /><span>Loading courses...</span></div>
      ) : (
        <>
          <div className="grid-auto" style={{ marginBottom: 20 }}>
            {courses.length === 0 && <div className="text-muted">No courses found.</div>}
            {courses.map(course => {
              const pct = Math.round((course.enrolled_count / course.max_students) * 100)
              const badge = getCapacityBadge(course.enrolled_count, course.max_students)
              return (
                <div className="course-card" key={course.id}>
                  <div className="flex-between">
                    <span className="tag">{course.id}</span>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <div className="course-card-title">{course.title}</div>
                  <div className="course-card-desc">{course.description}</div>
                  <div className="course-card-meta">
                    <span className="badge badge-purple">{course.category}</span>
                    <span className="text-muted text-sm">{course.credits} cr</span>
                  </div>
                  <div>
                    <div className="flex-between text-sm text-muted" style={{ marginBottom: 4 }}>
                      <span>{course.instructor.name}</span>
                      <span>{course.enrolled_count}/{course.max_students}</span>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress-fill ${pct >= 100 ? 'full' : pct >= 80 ? 'almost' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex-center gap-2">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(course.id)}
                      disabled={deleting === course.id}
                    >
                      {deleting === course.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '🗑️'}
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {meta.total_pages > 1 && (
            <div className="flex-center" style={{ justifyContent: 'center', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="text-muted text-sm">Page {meta.page} of {meta.total_pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {showModal && <CourseModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </div>
  )
}

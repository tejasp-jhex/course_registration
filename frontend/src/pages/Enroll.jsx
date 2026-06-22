import { useState, useEffect } from 'react'
import { enrollmentsAPI, coursesAPI, studentsAPI } from '../api'

export default function Enroll() {
  const [studentId, setStudentId] = useState('STU0001')
  const [courseId, setCourseId] = useState('')
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(false)
  const [dropping, setDropping] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    coursesAPI.list({ page_size: 100 }).then(r => setCourses(r.data.data)).catch(() => {})
  }, [])

  const loadEnrollments = async (id) => {
    try {
      const r = await studentsAPI.getEnrollments(id)
      setEnrollments(r.data)
    } catch { setEnrollments([]) }
  }

  const handleEnroll = async () => {
    if (!studentId || !courseId) return
    setLoading(true); setMsg(null)
    try {
      await enrollmentsAPI.enroll({ student_id: studentId, course_id: courseId })
      setMsg({ type: 'success', text: `✅ Enrolled in ${courseId}! (Background task: email sent in server logs)` })
      setCourseId('')
      await loadEnrollments(studentId)
    } catch (e) {
      const err = e.response?.data
      setMsg({ type: 'error', text: err?.detail || 'Enrollment failed', code: err?.error_code })
    } finally { setLoading(false) }
  }

  const handleDrop = async (enrollmentId, courseIdLabel) => {
    setDropping(enrollmentId); setMsg(null)
    try {
      await enrollmentsAPI.drop(enrollmentId)
      setMsg({ type: 'success', text: `Dropped ${courseIdLabel} successfully` })
      await loadEnrollments(studentId)
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Drop failed' })
    } finally { setDropping(null) }
  }

  const selectedCourse = courses.find(c => c.id === courseId)
  const isFull = selectedCourse && selectedCourse.enrolled_count >= selectedCourse.max_students

  return (
    <div>
      <div className="page-header">
        <h1>Enrollment ✅</h1>
        <p>Enroll in courses and manage your schedule</p>
      </div>

      <div className="concepts-row">
        <span className="concept-chip">POST /enrollments</span>
        <span className="concept-chip">BackgroundTasks</span>
        <span className="concept-chip">custom exceptions</span>
        <span className="concept-chip">DELETE /enrollments/{'{id}'}</span>
        <span className="concept-chip">409 Conflict</span>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} style={{ cursor: 'pointer' }} onClick={() => setMsg(null)}>
          {msg.text}
          {msg.code && <span className="mono" style={{ marginLeft: 8, fontSize: 11 }}>({msg.code})</span>}
          <span style={{ float: 'right' }}>✕</span>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Enroll Form */}
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Enroll in a Course</h3>
          <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
            On success, a background task fires to simulate sending an enrollment email — visible in the backend server logs.
          </p>

          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input
              className="form-input"
              value={studentId}
              onChange={e => { setStudentId(e.target.value); setEnrollments([]) }}
              placeholder="e.g. STU0001"
              onBlur={() => studentId && loadEnrollments(studentId)}
            />
            <span className="text-muted" style={{ fontSize: 11 }}>Try: STU0001, STU0002, STU0003</span>
          </div>

          <div className="form-group">
            <label className="form-label">Select Course</label>
            <select
              className="form-select"
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
            >
              <option value="">Choose a course...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title} ({c.enrolled_count}/{c.max_students})
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <div style={{
              padding: '12px', background: 'var(--bg)', borderRadius: 8,
              border: '1px solid var(--border)', marginBottom: 16
            }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{selectedCourse.title}</div>
              <div className="flex-center gap-2" style={{ flexWrap: 'wrap' }}>
                <span className="badge badge-purple">{selectedCourse.category}</span>
                <span className="badge badge-gray">{selectedCourse.credits} credits</span>
                {isFull
                  ? <span className="badge badge-red">🚫 Full — Course capacity reached</span>
                  : <span className="badge badge-green">✅ Spots available</span>
                }
              </div>
              <div style={{ marginTop: 10 }}>
                <div className="flex-between text-sm text-muted" style={{ marginBottom: 4 }}>
                  <span>{selectedCourse.enrolled_count} enrolled</span>
                  <span>Max: {selectedCourse.max_students}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${isFull ? 'full' : selectedCourse.enrolled_count / selectedCourse.max_students > 0.8 ? 'almost' : ''}`}
                    style={{ width: `${Math.min((selectedCourse.enrolled_count / selectedCourse.max_students) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleEnroll}
            disabled={!studentId || !courseId || loading || isFull}
            style={{ width: '100%' }}
          >
            {loading ? <span className="spinner" /> : '✅'} Enroll Now
          </button>

          <div className="alert alert-info" style={{ marginTop: 12, fontSize: 12 }}>
            💡 <strong>Background Task Demo:</strong> After enrolling, check your FastAPI terminal — you'll see an email notification logged asynchronously without blocking the response.
          </div>
        </div>

        {/* Current Enrollments */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3>Your Enrollments</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => studentId && loadEnrollments(studentId)}
            >
              🔄 Refresh
            </button>
          </div>

          {enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
              <div>No enrollments found.</div>
              <div className="text-sm" style={{ marginTop: 4 }}>Enter a Student ID and click Search, or enroll first.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {enrollments.map(e => (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="tag">{e.course_id}</span>
                      <span className={`badge ${e.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{e.status}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {e.id} · {new Date(e.enrolled_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDrop(e.id, e.course_id)}
                    disabled={dropping === e.id}
                  >
                    {dropping === e.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '🗑️'} Drop
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exception demo panel */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Custom Exception Handling</h3>
        <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
          This project shows 3 custom exceptions registered via <code className="mono">@app.exception_handler</code>:
        </p>
        <div className="grid-3" style={{ gap: 10 }}>
          {[
            { name: 'CourseFullException', code: '409 COURSE_FULL', trigger: 'Enroll in AI301 (it\'s already full)' },
            { name: 'AlreadyEnrolledException', code: '409 ALREADY_ENROLLED', trigger: 'Enroll in same course twice' },
            { name: 'CourseNotFoundException', code: '404 COURSE_NOT_FOUND', trigger: 'Type a non-existent course ID' },
          ].map(({ name, code, trigger }) => (
            <div key={name} style={{ padding: '14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div className="mono" style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 4 }}>{name}</div>
              <div className="badge badge-red" style={{ marginBottom: 8 }}>{code}</div>
              <div className="text-muted text-sm">{trigger}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

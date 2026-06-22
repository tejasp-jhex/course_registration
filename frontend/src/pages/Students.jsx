import { useState } from 'react'
import { studentsAPI } from '../api'

export default function Students() {
  const [activeTab, setActiveTab] = useState('register')

  // Register State
  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '' })
  const [regResult, setRegResult] = useState(null)
  const [regError, setRegError] = useState(null)
  const [regLoading, setRegLoading] = useState(false)

  // Lookup State
  const [lookupId, setLookupId] = useState('')
  const [student, setStudent] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [lookupError, setLookupError] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  // Avatar State
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarResult, setAvatarResult] = useState(null)
  const [avatarError, setAvatarError] = useState(null)
  const [avatarLoading, setAvatarLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleRegister = async () => {
    setRegLoading(true); setRegError(null); setRegResult(null)
    try {
      const r = await studentsAPI.register(form)
      setRegResult(r.data)
      setForm({ name: '', email: '', phone: '', bio: '' })
    } catch (e) {
      setRegError(e.response?.data?.detail || 'Registration failed')
    } finally { setRegLoading(false) }
  }

  const handleLookup = async () => {
    if (!lookupId.trim()) return
    setLookupLoading(true); setLookupError(null); setStudent(null); setEnrollments([])
    try {
      const [sRes, eRes] = await Promise.all([
        studentsAPI.get(lookupId.trim()),
        studentsAPI.getEnrollments(lookupId.trim())
      ])
      setStudent(sRes.data)
      setEnrollments(eRes.data)
    } catch (e) {
      setLookupError(e.response?.data?.detail || 'Student not found')
    } finally { setLookupLoading(false) }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile || !lookupId) return
    setAvatarLoading(true); setAvatarError(null); setAvatarResult(null)
    try {
      const r = await studentsAPI.uploadAvatar(lookupId, avatarFile)
      setAvatarResult(r.data)
    } catch (e) {
      setAvatarError(e.response?.data?.detail || 'Upload failed')
    } finally { setAvatarLoading(false) }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Students 🎓</h1>
        <p>Register new students and look up profiles</p>
      </div>

      {/* Tabs */}
      <div className="flex-center gap-2" style={{ marginBottom: 24 }}>
        {[
          { key: 'register', label: '📝 Register', concept: 'POST /students/register' },
          { key: 'lookup', label: '🔍 Lookup', concept: 'GET /students/{id}' },
          { key: 'upload', label: '📎 Avatar Upload', concept: 'File Upload' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Register Tab */}
      {activeTab === 'register' && (
        <div className="card" style={{ maxWidth: 540 }}>
          <h3 style={{ marginBottom: 4 }}>Register New Student</h3>
          <div className="concepts-row mt-2" style={{ marginBottom: 16 }}>
            <span className="concept-chip">POST /students/register</span>
            <span className="concept-chip">EmailStr validation</span>
            <span className="concept-chip">model_validator</span>
          </div>

          {regError && <div className="alert alert-error">{regError}</div>}
          {regResult && (
            <div className="alert alert-success">
              ✅ Registered! Student ID: <strong style={{ fontFamily: 'var(--mono)' }}>{regResult.id}</strong>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="Tejas Pokale" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email * <span className="text-muted">(validated by EmailStr)</span></label>
            <input className="form-input" type="email" placeholder="student@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone <span className="text-muted">(optional, regex validated)</span></label>
            <input className="form-input" placeholder="+917890123456" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Bio <span className="text-muted">(max 500 chars)</span></label>
            <textarea className="form-textarea" placeholder="Tell us about yourself..." value={form.bio} onChange={e => set('bio', e.target.value)} maxLength={500} />
          </div>

          <button className="btn btn-primary" onClick={handleRegister} disabled={regLoading} style={{ width: '100%' }}>
            {regLoading ? <span className="spinner" /> : '📝'}
            Register Student
          </button>

          <div className="alert alert-info" style={{ marginTop: 12, fontSize: 12 }}>
            💡 Try seed students: <code style={{ fontFamily: 'var(--mono)' }}>STU0001</code>, <code style={{ fontFamily: 'var(--mono)' }}>STU0002</code>, <code style={{ fontFamily: 'var(--mono)' }}>STU0003</code>
          </div>
        </div>
      )}

      {/* Lookup Tab */}
      {activeTab === 'lookup' && (
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 4 }}>Look Up Student</h3>
            <div className="concepts-row mt-2" style={{ marginBottom: 16 }}>
              <span className="concept-chip">GET /students/{'{id}'}</span>
              <span className="concept-chip">Header params</span>
              <span className="concept-chip">Cookie params</span>
              <span className="concept-chip">GET /students/{'{id}'}/enrollments</span>
            </div>

            {lookupError && <div className="alert alert-error">{lookupError}</div>}

            <div className="flex-center gap-2">
              <input
                className="form-input"
                placeholder="e.g. STU0001"
                value={lookupId}
                onChange={e => setLookupId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleLookup} disabled={lookupLoading}>
                {lookupLoading ? <span className="spinner" /> : '🔍'} Search
              </button>
            </div>
          </div>

          {student && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="flex-center gap-3" style={{ marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, background: 'var(--accent-soft)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22
                }}>🎓</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{student.name}</div>
                  <div className="mono" style={{ color: 'var(--accent)', fontSize: 12 }}>{student.id}</div>
                </div>
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Active</span>
              </div>

              <table className="table">
                <tbody>
                  <tr><td className="text-muted">Email</td><td>{student.email}</td></tr>
                  <tr><td className="text-muted">Phone</td><td>{student.phone || '—'}</td></tr>
                  <tr><td className="text-muted">Registered</td><td>{new Date(student.created_at).toLocaleDateString()}</td></tr>
                  {student.bio && <tr><td className="text-muted">Bio</td><td>{student.bio}</td></tr>}
                </tbody>
              </table>

              {enrollments.length > 0 && (
                <>
                  <div className="divider" />
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>Enrolled Courses ({enrollments.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {enrollments.map(e => (
                      <div key={e.id} className="flex-between" style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 6 }}>
                        <div>
                          <span className="tag">{e.course_id}</span>
                          <span className="mono" style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>{e.id}</span>
                        </div>
                        <span className={`badge ${e.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{e.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {enrollments.length === 0 && (
                <div className="text-muted text-sm mt-2" style={{ marginTop: 12 }}>No enrollments yet.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ marginBottom: 4 }}>Upload Student Avatar</h3>
          <div className="concepts-row mt-2" style={{ marginBottom: 16 }}>
            <span className="concept-chip">POST /students/{'{id}'}/avatar</span>
            <span className="concept-chip">UploadFile</span>
            <span className="concept-chip">multipart/form-data</span>
            <span className="concept-chip">file size validation</span>
          </div>

          {avatarError && <div className="alert alert-error">{avatarError}</div>}
          {avatarResult && (
            <div className="alert alert-success">
              ✅ {avatarResult.message}
              <div className="mono" style={{ marginTop: 6, fontSize: 11 }}>
                {JSON.stringify(avatarResult.data, null, 2)}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input className="form-input" placeholder="e.g. STU0001" value={lookupId} onChange={e => setLookupId(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Profile Picture <span className="text-muted">(max 500KB)</span></label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              style={{ padding: '8px' }}
              onChange={e => setAvatarFile(e.target.files[0])}
            />
            {avatarFile && (
              <div className="text-muted text-sm mt-2">
                Selected: <span className="mono">{avatarFile.name}</span> ({(avatarFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <button
            className="btn btn-green"
            onClick={handleAvatarUpload}
            disabled={!avatarFile || !lookupId || avatarLoading}
            style={{ width: '100%' }}
          >
            {avatarLoading ? <span className="spinner" /> : '📎'} Upload Avatar
          </button>
        </div>
      )}
    </div>
  )
}

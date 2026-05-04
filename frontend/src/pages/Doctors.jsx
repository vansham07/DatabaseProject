import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Field } from '../components/Field.jsx'
import { Toast, useToast } from '../components/Toast.jsx'
import { ErrorBanner } from '../components/ErrorBanner.jsx'
import { validateDoctor, hasErrors } from '../validators.js'

const empty = { doctorid: '', fname: '', lname: '', email: '', pnumber: '', dept: '', spec: '' }

export default function Doctors() {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const load = () => api.doctors().then(setList).catch(e => toast.error(e.message))
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value }
    setForm(next)
    if (touched[e.target.name] || errors[e.target.name]) {
      setErrors(validateDoctor(next, { existing: list }))
    }
  }
  const onBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true })
    setErrors(validateDoctor(form, { existing: list }))
  }
  const reset = () => { setForm(empty); setErrors({}); setTouched({}); setServerError(''); setShowForm(false) }

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const v = validateDoctor(form, { existing: list })
    setErrors(v)
    setTouched(Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {}))
    if (hasErrors(v)) return

    setSubmitting(true)
    try {
      await api.addDoctor({ ...form, doctorid: Number(form.doctorid) })
      toast.success(`Dr. ${form.fname} ${form.lname} added`)
      reset(); load()
    } catch (err) {
      setServerError(err.message)
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <header>
        <div>
          <h2>Doctors</h2>
          <p>{list.length} doctor{list.length === 1 ? '' : 's'} on staff</p>
        </div>
        <button onClick={() => showForm ? reset() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ New Doctor'}
        </button>
      </header>

      {showForm && (
        <div className="panel">
          <h3>Add New Doctor</h3>
          <ErrorBanner message={serverError} onClose={() => setServerError('')} />
          <form onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <Field label="Doctor ID" name="doctorid" type="number"
                value={form.doctorid} onChange={onChange} onBlur={onBlur}
                error={errors.doctorid} required min="1" />
              <Field label="First Name" name="fname"
                value={form.fname} onChange={onChange} onBlur={onBlur}
                error={errors.fname} required />
              <Field label="Last Name" name="lname"
                value={form.lname} onChange={onChange} onBlur={onBlur}
                error={errors.lname} required />
              <Field label="Email" name="email" type="email"
                value={form.email} onChange={onChange} onBlur={onBlur}
                error={errors.email} placeholder="doctor@hospital.com" />
              <Field label="Phone" name="pnumber"
                value={form.pnumber} onChange={onChange} onBlur={onBlur}
                error={errors.pnumber} placeholder="555-111-2222"
                hint="Format: 555-111-2222" />
              <Field label="Department" name="dept"
                value={form.dept} onChange={onChange} onBlur={onBlur}
                error={errors.dept} required placeholder="Cardiology" />
              <Field label="Specialization" name="spec"
                value={form.spec} onChange={onChange} onBlur={onBlur}
                error={errors.spec} placeholder="Heart Specialist" />
            </div>
            <div className="form-actions">
              <button type="button" className="secondary" onClick={reset}>Cancel</button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Doctor'}
              </button>
            </div>
          </form>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Department</th>
            <th>Specialization</th><th>Email</th><th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan="6" className="empty">No doctors yet.</td></tr>
          ) : list.map(d => (
            <tr key={d.doctorid}>
              <td>#{d.doctorid}</td>
              <td>Dr. {d.fname} {d.lname}</td>
              <td>{d.dept}</td>
              <td>{d.spec}</td>
              <td>{d.email}</td>
              <td>{d.pnumber}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Toast toast={toast.toast} onClose={toast.dismiss} />
    </>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Field } from '../components/Field.jsx'
import { Toast, useToast } from '../components/Toast.jsx'
import { ErrorBanner } from '../components/ErrorBanner.jsx'
import { validatePatient, hasErrors } from '../validators.js'

const empty = {
  patientid: '', ssn: '', fname: '', lname: '', dob: '',
  weight: '', height: '', blood: '', maritalstat: '',
  race: '', gender: '', language: '',
}

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Patients() {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const load = () => api.patients().then(setList).catch(e => toast.error(e.message))
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value }
    setForm(next)
    if (touched[e.target.name] || errors[e.target.name]) {
      setErrors(validatePatient(next, { existing: list }))
    }
  }
  const onBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true })
    setErrors(validatePatient(form, { existing: list }))
  }
  const reset = () => { setForm(empty); setErrors({}); setTouched({}); setServerError(''); setShowForm(false) }

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const v = validatePatient(form, { existing: list })
    setErrors(v)
    setTouched(Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {}))
    if (hasErrors(v)) return

    setSubmitting(true)
    try {
      await api.addPatient({
        ...form,
        patientid: Number(form.patientid),
        weight:    form.weight ? Number(form.weight) : null,
        height:    form.height ? Number(form.height) : null,
        dob:       form.dob || null,
      })
      toast.success(`Patient ${form.fname} ${form.lname} added`)
      reset(); load()
    } catch (err) {
      setServerError(err.message)
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <header>
        <div>
          <h2>Patients</h2>
          <p>{list.length} patient{list.length === 1 ? '' : 's'} registered</p>
        </div>
        <button onClick={() => showForm ? reset() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ New Patient'}
        </button>
      </header>

      {showForm && (
        <div className="panel">
          <h3>Add New Patient</h3>
          <ErrorBanner message={serverError} onClose={() => setServerError('')} />
          <form onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <Field label="Patient ID" name="patientid" type="number" min="1"
                value={form.patientid} onChange={onChange} onBlur={onBlur}
                error={errors.patientid} required />
              <Field label="SSN" name="ssn" placeholder="123-45-6789"
                value={form.ssn} onChange={onChange} onBlur={onBlur}
                error={errors.ssn} hint="Format: 123-45-6789" />
              <Field label="First Name" name="fname"
                value={form.fname} onChange={onChange} onBlur={onBlur}
                error={errors.fname} required />
              <Field label="Last Name" name="lname"
                value={form.lname} onChange={onChange} onBlur={onBlur}
                error={errors.lname} required />
              <Field label="Date of Birth" name="dob" type="date"
                value={form.dob} onChange={onChange} onBlur={onBlur}
                error={errors.dob} max={new Date().toISOString().slice(0, 10)} />
              <Field label="Weight (lbs)" name="weight" type="number" step="0.1" min="1" max="1000"
                value={form.weight} onChange={onChange} onBlur={onBlur}
                error={errors.weight} />
              <Field label="Height (ft)" name="height" type="number" step="0.1" min="1" max="10"
                value={form.height} onChange={onChange} onBlur={onBlur}
                error={errors.height} />
              <Field label="Blood Type" name="blood" as="select"
                value={form.blood} onChange={onChange} onBlur={onBlur}
                error={errors.blood}>
                <option value="">-- select --</option>
                {BLOOD.map(b => <option key={b} value={b}>{b}</option>)}
              </Field>
              <Field label="Gender" name="gender" as="select" required
                value={form.gender} onChange={onChange} onBlur={onBlur}
                error={errors.gender}>
                <option value="">-- select --</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </Field>
              <Field label="Marital Status" name="maritalstat" as="select"
                value={form.maritalstat} onChange={onChange} onBlur={onBlur}
                error={errors.maritalstat}>
                <option value="">-- select --</option>
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </Field>
              <Field label="Race" name="race"
                value={form.race} onChange={onChange} onBlur={onBlur}
                error={errors.race} />
              <Field label="Language" name="language"
                value={form.language} onChange={onChange} onBlur={onBlur}
                error={errors.language} placeholder="English" />
            </div>
            <div className="form-actions">
              <button type="button" className="secondary" onClick={reset}>Cancel</button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Patient'}
              </button>
            </div>
          </form>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>DOB</th>
            <th>Gender</th><th>Blood</th><th>Language</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan="6" className="empty">No patients yet.</td></tr>
          ) : list.map(p => (
            <tr key={p.patientid}>
              <td>#{p.patientid}</td>
              <td>{p.fname} {p.lname}</td>
              <td>{p.dob}</td>
              <td>{p.gender}</td>
              <td>{p.blood}</td>
              <td>{p.language}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Toast toast={toast.toast} onClose={toast.dismiss} />
    </>
  )
}

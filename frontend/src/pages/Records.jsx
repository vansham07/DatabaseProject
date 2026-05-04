import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Field } from '../components/Field.jsx'
import { Toast, useToast } from '../components/Toast.jsx'
import { ErrorBanner } from '../components/ErrorBanner.jsx'
import { validateRecord, hasErrors } from '../validators.js'

const empty = {
  recordid: '', appointmentid: '', doctorid: '', patientid: '',
  mdate: '', diagnosis: '', treatment: '', recordtype: 'General',
}

export default function Records() {
  const [list, setList] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appts, setAppts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const load = () => Promise.all([api.records(), api.patients(), api.doctors(), api.appointments()])
    .then(([r, p, d, a]) => { setList(r); setPatients(p); setDoctors(d); setAppts(a) })
    .catch(e => toast.error(e.message))
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value }
    setForm(next)
    if (touched[e.target.name] || errors[e.target.name]) {
      setErrors(validateRecord(next, { existing: list }))
    }
  }
  const onBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true })
    setErrors(validateRecord(form, { existing: list }))
  }
  const reset = () => { setForm(empty); setErrors({}); setTouched({}); setServerError(''); setShowForm(false) }

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const v = validateRecord(form, { existing: list })
    setErrors(v)
    setTouched(Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {}))
    if (hasErrors(v)) return

    setSubmitting(true)
    try {
      await api.addRecord({
        ...form,
        recordid:      Number(form.recordid),
        appointmentid: form.appointmentid ? Number(form.appointmentid) : null,
        doctorid:      Number(form.doctorid),
        patientid:     Number(form.patientid),
        mdate:         form.mdate || null,
      })
      toast.success('Record saved')
      reset(); load()
    } catch (err) {
      setServerError(err.message)
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <header>
        <div>
          <h2>Medical Records</h2>
          <p>{list.length} record{list.length === 1 ? '' : 's'} on file</p>
        </div>
        <button onClick={() => showForm ? reset() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ New Record'}
        </button>
      </header>

      {showForm && (
        <div className="panel">
          <h3>Create Medical Record</h3>
          <ErrorBanner message={serverError} onClose={() => setServerError('')} />
          <form onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <Field label="Record ID" name="recordid" type="number" min="1" required
                value={form.recordid} onChange={onChange} onBlur={onBlur}
                error={errors.recordid} />
              <Field label="Appointment" name="appointmentid" as="select"
                value={form.appointmentid} onChange={onChange} onBlur={onBlur}
                error={errors.appointmentid}>
                <option value="">-- none --</option>
                {appts.map(a => (
                  <option key={a.appointmentid} value={a.appointmentid}>
                    #{a.appointmentid} · {a.apdate}
                  </option>
                ))}
              </Field>
              <Field label="Patient" name="patientid" as="select" required
                value={form.patientid} onChange={onChange} onBlur={onBlur}
                error={errors.patientid}>
                <option value="">-- select patient --</option>
                {patients.map(p => (
                  <option key={p.patientid} value={p.patientid}>
                    #{p.patientid} · {p.fname} {p.lname}
                  </option>
                ))}
              </Field>
              <Field label="Doctor" name="doctorid" as="select" required
                value={form.doctorid} onChange={onChange} onBlur={onBlur}
                error={errors.doctorid}>
                <option value="">-- select doctor --</option>
                {doctors.map(d => (
                  <option key={d.doctorid} value={d.doctorid}>
                    Dr. {d.fname} {d.lname}
                  </option>
                ))}
              </Field>
              <Field label="Date" name="mdate" type="date"
                value={form.mdate} onChange={onChange} onBlur={onBlur}
                error={errors.mdate} max={new Date().toISOString().slice(0, 10)} />
              <Field label="Record Type" name="recordtype" as="select"
                value={form.recordtype} onChange={onChange} onBlur={onBlur}
                error={errors.recordtype}>
                <option>General</option>
                <option>Diagnosis</option>
                <option>Lab Result</option>
                <option>Surgery</option>
              </Field>
              <Field label="Diagnosis" name="diagnosis" full
                value={form.diagnosis} onChange={onChange} onBlur={onBlur}
                error={errors.diagnosis} maxLength="255" />
              <Field label="Treatment" name="treatment" full
                value={form.treatment} onChange={onChange} onBlur={onBlur}
                error={errors.treatment} maxLength="255" />
            </div>
            <div className="form-actions">
              <button type="button" className="secondary" onClick={reset}>Cancel</button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Patient</th><th>Doctor</th>
            <th>Date</th><th>Type</th><th>Diagnosis</th><th>Treatment</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan="7" className="empty">No records yet.</td></tr>
          ) : list.map(r => (
            <tr key={r.recordid}>
              <td>#{r.recordid}</td>
              <td>{r.patient_name}</td>
              <td>{r.doctor_name}</td>
              <td>{r.mdate}</td>
              <td><span className="badge">{r.recordtype}</span></td>
              <td>{r.diagnosis}</td>
              <td>{r.treatment}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Toast toast={toast.toast} onClose={toast.dismiss} />
    </>
  )
}

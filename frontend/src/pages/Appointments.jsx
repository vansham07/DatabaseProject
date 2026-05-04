import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Field } from '../components/Field.jsx'
import { Toast, useToast } from '../components/Toast.jsx'
import { ErrorBanner } from '../components/ErrorBanner.jsx'
import { validateAppointment, hasErrors } from '../validators.js'

const empty = {
  appointmentid: '', patientid: '', doctorid: '', apdate: '',
  status: 'Scheduled', time: '', type: '', duration: '30', reason: '',
}

export default function Appointments() {
  const [list, setList] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const load = () => Promise.all([api.appointments(), api.patients(), api.doctors()])
    .then(([a, p, d]) => { setList(a); setPatients(p); setDoctors(d) })
    .catch(e => toast.error(e.message))
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value }
    setForm(next)
    if (touched[e.target.name] || errors[e.target.name]) {
      setErrors(validateAppointment(next, { existing: list }))
    }
  }
  const onBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true })
    setErrors(validateAppointment(form, { existing: list }))
  }
  const reset = () => { setForm(empty); setErrors({}); setTouched({}); setServerError(''); setShowForm(false) }

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const v = validateAppointment(form, { existing: list })
    setErrors(v)
    setTouched(Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {}))
    if (hasErrors(v)) return

    setSubmitting(true)
    try {
      await api.addAppointment({
        ...form,
        appointmentid: Number(form.appointmentid),
        patientid:     Number(form.patientid),
        doctorid:      Number(form.doctorid),
        duration:      form.duration ? Number(form.duration) : null,
      })
      toast.success('Appointment scheduled')
      reset(); load()
    } catch (err) {
      setServerError(err.message)
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <header>
        <div>
          <h2>Appointments</h2>
          <p>{list.length} appointment{list.length === 1 ? '' : 's'} on file</p>
        </div>
        <button onClick={() => showForm ? reset() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ New Appointment'}
        </button>
      </header>

      {showForm && (
        <div className="panel">
          <h3>Schedule Appointment</h3>
          <ErrorBanner message={serverError} onClose={() => setServerError('')} />
          <form onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <Field label="Appointment ID" name="appointmentid" type="number" min="1" required
                value={form.appointmentid} onChange={onChange} onBlur={onBlur}
                error={errors.appointmentid} />
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
                    Dr. {d.fname} {d.lname} ({d.dept})
                  </option>
                ))}
              </Field>
              <Field label="Date" name="apdate" type="date" required
                value={form.apdate} onChange={onChange} onBlur={onBlur}
                error={errors.apdate} />
              <Field label="Time" name="time" placeholder="10:00AM"
                value={form.time} onChange={onChange} onBlur={onBlur}
                error={errors.time} hint="Format: 10:00AM" />
              <Field label="Type" name="type" placeholder="Checkup"
                value={form.type} onChange={onChange} onBlur={onBlur}
                error={errors.type} />
              <Field label="Duration (min)" name="duration" type="number" min="5" max="480"
                value={form.duration} onChange={onChange} onBlur={onBlur}
                error={errors.duration} />
              <Field label="Status" name="status" as="select"
                value={form.status} onChange={onChange} onBlur={onBlur}
                error={errors.status}>
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </Field>
              <Field label="Reason" name="reason" full
                value={form.reason} onChange={onChange} onBlur={onBlur}
                error={errors.reason} placeholder="Reason for visit" />
            </div>
            <div className="form-actions">
              <button type="button" className="secondary" onClick={reset}>Cancel</button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Patient</th><th>Doctor</th>
            <th>Date</th><th>Time</th><th>Type</th>
            <th>Duration</th><th>Status</th><th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan="9" className="empty">No appointments yet.</td></tr>
          ) : list.map(a => (
            <tr key={a.appointmentid}>
              <td>#{a.appointmentid}</td>
              <td>{a.patient_name}</td>
              <td>{a.doctor_name}<span className="cell-sub">{a.doctor_dept}</span></td>
              <td>{a.apdate}</td>
              <td>{a.time}</td>
              <td>{a.type}</td>
              <td>{a.duration} min</td>
              <td><span className={`badge ${a.status?.toLowerCase()}`}>{a.status}</span></td>
              <td>{a.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Toast toast={toast.toast} onClose={toast.dismiss} />
    </>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Field } from '../components/Field.jsx'
import { Toast, useToast } from '../components/Toast.jsx'
import { ErrorBanner } from '../components/ErrorBanner.jsx'
import { validatePrescription, hasErrors } from '../validators.js'

const empty = {
  prescriptionid: '', doctorid: '', patientid: '', recordid: '',
  medname: '', doses: '', frequency: '',
  startdate: '', enddate: '', status: 'Active',
}

export default function Prescriptions() {
  const [list, setList] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const load = () => Promise.all([api.prescriptions(), api.patients(), api.doctors(), api.records()])
    .then(([pr, p, d, r]) => { setList(pr); setPatients(p); setDoctors(d); setRecords(r) })
    .catch(e => toast.error(e.message))
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value }
    setForm(next)
    if (touched[e.target.name] || errors[e.target.name]) {
      setErrors(validatePrescription(next, { existing: list }))
    }
  }
  const onBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true })
    setErrors(validatePrescription(form, { existing: list }))
  }
  const reset = () => { setForm(empty); setErrors({}); setTouched({}); setServerError(''); setShowForm(false) }

  const onSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const v = validatePrescription(form, { existing: list })
    setErrors(v)
    setTouched(Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {}))
    if (hasErrors(v)) return

    setSubmitting(true)
    try {
      await api.addPrescription({
        ...form,
        prescriptionid: Number(form.prescriptionid),
        doctorid:       Number(form.doctorid),
        patientid:      Number(form.patientid),
        recordid:       form.recordid ? Number(form.recordid) : null,
        startdate:      form.startdate || null,
        enddate:        form.enddate || null,
      })
      toast.success(`Prescription for ${form.medname} issued`)
      reset(); load()
    } catch (err) {
      setServerError(err.message)
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <header>
        <div>
          <h2>Prescriptions</h2>
          <p>{list.length} prescription{list.length === 1 ? '' : 's'} on file</p>
        </div>
        <button onClick={() => showForm ? reset() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ New Prescription'}
        </button>
      </header>

      {showForm && (
        <div className="panel">
          <h3>Issue Prescription</h3>
          <ErrorBanner message={serverError} onClose={() => setServerError('')} />
          <form onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <Field label="Prescription ID" name="prescriptionid" type="number" min="1" required
                value={form.prescriptionid} onChange={onChange} onBlur={onBlur}
                error={errors.prescriptionid} />
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
              <Field label="Linked Record" name="recordid" as="select"
                value={form.recordid} onChange={onChange} onBlur={onBlur}
                error={errors.recordid}>
                <option value="">-- none --</option>
                {records.map(r => (
                  <option key={r.recordid} value={r.recordid}>
                    #{r.recordid} · {r.diagnosis}
                  </option>
                ))}
              </Field>
              <Field label="Medication" name="medname" required placeholder="Aspirin"
                value={form.medname} onChange={onChange} onBlur={onBlur}
                error={errors.medname} />
              <Field label="Dose" name="doses" placeholder="100mg"
                value={form.doses} onChange={onChange} onBlur={onBlur}
                error={errors.doses} />
              <Field label="Frequency" name="frequency" placeholder="Once daily"
                value={form.frequency} onChange={onChange} onBlur={onBlur}
                error={errors.frequency} />
              <Field label="Status" name="status" as="select"
                value={form.status} onChange={onChange} onBlur={onBlur}
                error={errors.status}>
                <option>Active</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </Field>
              <Field label="Start Date" name="startdate" type="date"
                value={form.startdate} onChange={onChange} onBlur={onBlur}
                error={errors.startdate} />
              <Field label="End Date" name="enddate" type="date"
                value={form.enddate} onChange={onChange} onBlur={onBlur}
                error={errors.enddate} />
            </div>
            <div className="form-actions">
              <button type="button" className="secondary" onClick={reset}>Cancel</button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Prescription'}
              </button>
            </div>
          </form>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Patient</th><th>Doctor</th>
            <th>Medication</th><th>Dose</th><th>Frequency</th>
            <th>Period</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan="8" className="empty">No prescriptions yet.</td></tr>
          ) : list.map(p => (
            <tr key={p.prescriptionid}>
              <td>#{p.prescriptionid}</td>
              <td>{p.patient_name}</td>
              <td>{p.doctor_name}</td>
              <td>{p.medname}</td>
              <td>{p.doses}</td>
              <td>{p.frequency}</td>
              <td>{p.startdate} → {p.enddate}</td>
              <td><span className={`badge ${p.status?.toLowerCase()}`}>{p.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <Toast toast={toast.toast} onClose={toast.dismiss} />
    </>
  )
}

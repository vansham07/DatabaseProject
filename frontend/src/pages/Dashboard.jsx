import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [appts, setAppts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.stats(), api.appointments()])
      .then(([s, a]) => { setStats(s); setAppts(a.slice(0, 5)) })
      .catch(e => setError(e.message))
  }, [])

  return (
    <>
      <header>
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your hospital system</p>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      {stats && (
        <div className="stats">
          <StatCard label="Patients"             value={stats.patients} />
          <StatCard label="Doctors"              value={stats.doctors} />
          <StatCard label="Appointments"         value={stats.appointments} />
          <StatCard label="Medical Records"      value={stats.records} />
          <StatCard label="Active Prescriptions" value={stats.activePrescriptions} />
        </div>
      )}

      <div className="panel">
        <h3>Recent Appointments</h3>
        {appts.length === 0 ? (
          <div className="empty">No appointments yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Patient</th><th>Doctor</th>
                <th>Date</th><th>Time</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appts.map(a => (
                <tr key={a.appointmentid}>
                  <td>#{a.appointmentid}</td>
                  <td>{a.patient_name}</td>
                  <td>{a.doctor_name} <span style={{color:'#9ca3af', fontSize:'0.85em'}}>· {a.doctor_dept}</span></td>
                  <td>{a.apdate}</td>
                  <td>{a.time}</td>
                  <td><span className={`badge ${a.status?.toLowerCase()}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  )
}

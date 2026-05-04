import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import Doctors from './pages/Doctors.jsx'
import Appointments from './pages/Appointments.jsx'
import Records from './pages/Records.jsx'
import Prescriptions from './pages/Prescriptions.jsx'

const navItems = [
  { to: '/',              label: 'Dashboard' },
  { to: '/patients',      label: 'Patients' },
  { to: '/doctors',       label: 'Doctors' },
  { to: '/appointments',  label: 'Appointments' },
  { to: '/records',       label: 'Medical Records' },
  { to: '/prescriptions', label: 'Prescriptions' },
]

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h1><span className="logo">+</span> Hospital MS</h1>
        <div className="tag">Management System</div>
        <nav>
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/patients"      element={<Patients />} />
          <Route path="/doctors"       element={<Doctors />} />
          <Route path="/appointments"  element={<Appointments />} />
          <Route path="/records"       element={<Records />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
        </Routes>
      </main>
    </div>
  )
}

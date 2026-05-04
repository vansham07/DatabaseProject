const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const api = {
  stats:           ()       => request('/stats'),
  doctors:         ()       => request('/doctors'),
  addDoctor:       (body)   => request('/doctors',       { method: 'POST', body: JSON.stringify(body) }),
  patients:        ()       => request('/patients'),
  patient:         (id)     => request(`/patients/${id}`),
  addPatient:      (body)   => request('/patients',      { method: 'POST', body: JSON.stringify(body) }),
  appointments:    ()       => request('/appointments'),
  addAppointment:  (body)   => request('/appointments',  { method: 'POST', body: JSON.stringify(body) }),
  records:         ()       => request('/records'),
  addRecord:       (body)   => request('/records',       { method: 'POST', body: JSON.stringify(body) }),
  prescriptions:   ()       => request('/prescriptions'),
  addPrescription: (body)   => request('/prescriptions', { method: 'POST', body: JSON.stringify(body) }),
};

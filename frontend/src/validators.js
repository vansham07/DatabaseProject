// Reusable validation primitives. Each form schema is a function
// (values, context?) -> { fieldName: 'error message', ... }.
// An empty object means valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+()]{7,20}$/;
const SSN_RE   = /^\d{3}-\d{2}-\d{4}$/;
const TIME_RE  = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM|am|pm)$/;
const BLOOD    = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const today = () => new Date().toISOString().slice(0, 10);

function intInRange(v, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (isBlank(v)) return null;
  const n = Number(v);
  if (!Number.isInteger(n)) return 'Must be a whole number';
  if (n < min) return `Must be at least ${min}`;
  if (n > max) return `Must be at most ${max}`;
  return null;
}

function numberInRange(v, { min, max, label = 'Value' } = {}) {
  if (isBlank(v)) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return `${label} must be a number`;
  if (min !== undefined && n < min) return `${label} must be at least ${min}`;
  if (max !== undefined && n > max) return `${label} must be at most ${max}`;
  return null;
}

function uniqueId(v, existing, key) {
  if (isBlank(v)) return null;
  const n = Number(v);
  if (existing?.some((row) => Number(row[key]) === n)) return 'This ID is already taken';
  return null;
}

function dateNotInFuture(v, label = 'Date') {
  if (isBlank(v)) return null;
  if (v > today()) return `${label} cannot be in the future`;
  return null;
}

function dateNotInPast(v, label = 'Date') {
  if (isBlank(v)) return null;
  if (v < today()) return `${label} cannot be in the past`;
  return null;
}

// ---------- Schemas ----------

export function validateDoctor(v, { existing = [] } = {}) {
  const e = {};
  if (isBlank(v.doctorid)) e.doctorid = 'Doctor ID is required';
  else e.doctorid = intInRange(v.doctorid, { min: 1 }) || uniqueId(v.doctorid, existing, 'doctorid');
  if (isBlank(v.fname)) e.fname = 'First name is required';
  else if (v.fname.trim().length < 2) e.fname = 'Must be at least 2 characters';
  if (isBlank(v.lname)) e.lname = 'Last name is required';
  else if (v.lname.trim().length < 2) e.lname = 'Must be at least 2 characters';
  if (!isBlank(v.email) && !EMAIL_RE.test(v.email)) e.email = 'Enter a valid email address';
  if (!isBlank(v.pnumber) && !PHONE_RE.test(v.pnumber)) e.pnumber = 'Enter a valid phone (e.g. 555-111-2222)';
  if (isBlank(v.dept)) e.dept = 'Department is required';
  return clean(e);
}

export function validatePatient(v, { existing = [] } = {}) {
  const e = {};
  if (isBlank(v.patientid)) e.patientid = 'Patient ID is required';
  else e.patientid = intInRange(v.patientid, { min: 1 }) || uniqueId(v.patientid, existing, 'patientid');
  if (!isBlank(v.ssn) && !SSN_RE.test(v.ssn)) e.ssn = 'SSN must be in 123-45-6789 format';
  if (isBlank(v.fname)) e.fname = 'First name is required';
  else if (v.fname.trim().length < 2) e.fname = 'Must be at least 2 characters';
  if (isBlank(v.lname)) e.lname = 'Last name is required';
  else if (v.lname.trim().length < 2) e.lname = 'Must be at least 2 characters';
  if (!isBlank(v.dob)) {
    const future = dateNotInFuture(v.dob, 'Date of birth');
    if (future) e.dob = future;
  }
  e.weight = numberInRange(v.weight, { min: 1, max: 1000, label: 'Weight' });
  e.height = numberInRange(v.height, { min: 1, max: 10, label: 'Height' });
  if (!isBlank(v.blood) && !BLOOD.includes(v.blood)) e.blood = 'Pick a valid blood type';
  if (isBlank(v.gender)) e.gender = 'Gender is required';
  return clean(e);
}

export function validateAppointment(v, { existing = [] } = {}) {
  const e = {};
  if (isBlank(v.appointmentid)) e.appointmentid = 'Appointment ID is required';
  else e.appointmentid = intInRange(v.appointmentid, { min: 1 }) || uniqueId(v.appointmentid, existing, 'appointmentid');
  if (isBlank(v.patientid)) e.patientid = 'Select a patient';
  if (isBlank(v.doctorid))  e.doctorid  = 'Select a doctor';
  if (isBlank(v.apdate))    e.apdate    = 'Date is required';
  else if (v.status === 'Scheduled') {
    const past = dateNotInPast(v.apdate, 'Scheduled appointments');
    if (past) e.apdate = past;
  }
  if (!isBlank(v.time) && !TIME_RE.test(v.time)) e.time = 'Use format like 10:00AM';
  e.duration = numberInRange(v.duration, { min: 5, max: 480, label: 'Duration' });
  if (!isBlank(v.reason) && v.reason.length > 255) e.reason = 'Keep under 255 characters';
  return clean(e);
}

export function validateRecord(v, { existing = [] } = {}) {
  const e = {};
  if (isBlank(v.recordid)) e.recordid = 'Record ID is required';
  else e.recordid = intInRange(v.recordid, { min: 1 }) || uniqueId(v.recordid, existing, 'recordid');
  if (isBlank(v.patientid)) e.patientid = 'Select a patient';
  if (isBlank(v.doctorid))  e.doctorid  = 'Select a doctor';
  if (!isBlank(v.mdate)) {
    const future = dateNotInFuture(v.mdate, 'Record date');
    if (future) e.mdate = future;
  }
  if (!isBlank(v.diagnosis) && v.diagnosis.length > 255) e.diagnosis = 'Keep under 255 characters';
  if (!isBlank(v.treatment) && v.treatment.length > 255) e.treatment = 'Keep under 255 characters';
  return clean(e);
}

export function validatePrescription(v, { existing = [] } = {}) {
  const e = {};
  if (isBlank(v.prescriptionid)) e.prescriptionid = 'Prescription ID is required';
  else e.prescriptionid = intInRange(v.prescriptionid, { min: 1 }) || uniqueId(v.prescriptionid, existing, 'prescriptionid');
  if (isBlank(v.patientid)) e.patientid = 'Select a patient';
  if (isBlank(v.doctorid))  e.doctorid  = 'Select a doctor';
  if (isBlank(v.medname))   e.medname   = 'Medication name is required';
  if (!isBlank(v.startdate) && !isBlank(v.enddate) && v.startdate > v.enddate) {
    e.enddate = 'End date must be on or after start date';
  }
  return clean(e);
}

function clean(errors) {
  const out = {};
  for (const [k, val] of Object.entries(errors)) if (val) out[k] = val;
  return out;
}

export const hasErrors = (errs) => Object.keys(errs).length > 0;

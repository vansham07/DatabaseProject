import express from 'express';
import cors from 'cors';
import { pool } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/api/health', wrap(async (_req, res) => {
  const [[row]] = await pool.query('SELECT 1 AS ok');
  res.json({ ok: row.ok === 1 });
}));

// ---------- DOCTORS ----------
app.get('/api/doctors', wrap(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM doctor ORDER BY doctorid');
  res.json(rows);
}));

app.post('/api/doctors', wrap(async (req, res) => {
  const { doctorid, fname, lname, email, pnumber, dept, spec } = req.body;
  await pool.query(
    'INSERT INTO doctor (doctorid, fname, lname, email, pnumber, dept, spec) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [doctorid, fname, lname, email, pnumber, dept, spec]
  );
  res.status(201).json({ doctorid });
}));

// ---------- PATIENTS ----------
app.get('/api/patients', wrap(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM patient ORDER BY patientid');
  res.json(rows);
}));

app.get('/api/patients/:id', wrap(async (req, res) => {
  const [[patient]] = await pool.query('SELECT * FROM patient WHERE patientid = ?', [req.params.id]);
  if (!patient) return res.status(404).json({ error: 'Not found' });
  const [allergies] = await pool.query('SELECT * FROM allergies WHERE patientid = ?', [req.params.id]);
  const [contacts] = await pool.query('SELECT * FROM contactinfo WHERE patientid = ?', [req.params.id]);
  const [addresses] = await pool.query(
    `SELECT a.*, z.city, z.state FROM address a LEFT JOIN zipcodes z ON a.zipid = z.zipid WHERE a.patientid = ?`,
    [req.params.id]
  );
  res.json({ ...patient, allergies, contacts, addresses });
}));

app.post('/api/patients', wrap(async (req, res) => {
  const {
    patientid, ssn, fname, lname, dob, weight, height,
    blood, maritalstat, race, gender, language,
  } = req.body;
  await pool.query(
    `INSERT INTO patient
      (patientid, ssn, fname, lname, dob, weight, height, blood, maritalstat, race, gender, \`language\`)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [patientid, ssn, fname, lname, dob, weight, height, blood, maritalstat, race, gender, language]
  );
  res.status(201).json({ patientid });
}));

// ---------- APPOINTMENTS ----------
app.get('/api/appointments', wrap(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT
        a.*,
        CONCAT(p.fname, ' ', p.lname) AS patient_name,
        CONCAT(d.fname, ' ', d.lname) AS doctor_name,
        d.dept AS doctor_dept
     FROM appointments a
     JOIN patient p ON a.patientid = p.patientid
     JOIN doctor  d ON a.doctorid  = d.doctorid
     ORDER BY a.apdate DESC, a.appointmentid DESC`
  );
  res.json(rows);
}));

app.post('/api/appointments', wrap(async (req, res) => {
  const {
    appointmentid, patientid, doctorid, apdate, status, time, type, duration, reason,
  } = req.body;
  await pool.query(
    `INSERT INTO appointments
      (appointmentid, patientid, doctorid, apdate, status, \`time\`, type, duration, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [appointmentid, patientid, doctorid, apdate, status, time, type, duration, reason]
  );
  res.status(201).json({ appointmentid });
}));

// ---------- MEDICAL RECORDS ----------
app.get('/api/records', wrap(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT
        m.*,
        CONCAT(p.fname, ' ', p.lname) AS patient_name,
        CONCAT(d.fname, ' ', d.lname) AS doctor_name
     FROM medicalrecords m
     JOIN patient p ON m.patientid = p.patientid
     JOIN doctor  d ON m.doctorid  = d.doctorid
     ORDER BY m.mdate DESC`
  );
  res.json(rows);
}));

app.post('/api/records', wrap(async (req, res) => {
  const {
    recordid, appointmentid, doctorid, patientid, mdate,
    diagnosis, treatment, recordtype,
  } = req.body;
  await pool.query(
    `INSERT INTO medicalrecords
      (recordid, appointmentid, doctorid, patientid, mdate, diagnosis, treatment, recordtype)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [recordid, appointmentid, doctorid, patientid, mdate, diagnosis, treatment, recordtype]
  );
  res.status(201).json({ recordid });
}));

// ---------- PRESCRIPTIONS ----------
app.get('/api/prescriptions', wrap(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT
        pr.*,
        CONCAT(p.fname, ' ', p.lname) AS patient_name,
        CONCAT(d.fname, ' ', d.lname) AS doctor_name
     FROM prescription pr
     JOIN patient p ON pr.patientid = p.patientid
     JOIN doctor  d ON pr.doctorid  = d.doctorid
     ORDER BY pr.startdate DESC`
  );
  res.json(rows);
}));

app.post('/api/prescriptions', wrap(async (req, res) => {
  const {
    prescriptionid, doctorid, patientid, recordid,
    medname, doses, frequency, startdate, enddate, status,
  } = req.body;
  await pool.query(
    `INSERT INTO prescription
      (prescriptionid, doctorid, patientid, recordid, medname, doses, frequency, startdate, enddate, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [prescriptionid, doctorid, patientid, recordid, medname, doses, frequency, startdate, enddate, status]
  );
  res.status(201).json({ prescriptionid });
}));

// ---------- DASHBOARD STATS ----------
app.get('/api/stats', wrap(async (_req, res) => {
  const [[doctors]] = await pool.query('SELECT COUNT(*) AS c FROM doctor');
  const [[patients]] = await pool.query('SELECT COUNT(*) AS c FROM patient');
  const [[appts]] = await pool.query('SELECT COUNT(*) AS c FROM appointments');
  const [[records]] = await pool.query('SELECT COUNT(*) AS c FROM medicalrecords');
  const [[prescriptions]] = await pool.query("SELECT COUNT(*) AS c FROM prescription WHERE status='Active'");
  res.json({
    doctors: doctors.c,
    patients: patients.c,
    appointments: appts.c,
    records: records.c,
    activePrescriptions: prescriptions.c,
  });
}));

// ---------- ERROR HANDLER ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

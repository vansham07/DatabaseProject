-- =====================================================
-- Hospital Management System - MySQL Schema
-- Converted from Oracle dialect
-- =====================================================

DROP DATABASE IF EXISTS hospital;
CREATE DATABASE hospital;
USE hospital;

-- =====================================================
-- Table: doctor
-- =====================================================
CREATE TABLE doctor (
    doctorid INT PRIMARY KEY,
    fname VARCHAR(50),
    lname VARCHAR(50),
    email VARCHAR(100),
    pnumber VARCHAR(15),
    dept VARCHAR(50),
    spec VARCHAR(50)
);

-- =====================================================
-- Table: patient
-- =====================================================
CREATE TABLE patient (
    patientid INT PRIMARY KEY,
    ssn VARCHAR(11),
    fname VARCHAR(50),
    lname VARCHAR(50),
    dob DATE,
    weight FLOAT,
    height FLOAT,
    blood VARCHAR(3) DEFAULT NULL,
    maritalstat VARCHAR(50),
    race VARCHAR(50),
    gender VARCHAR(50),
    `language` VARCHAR(50)
);

-- =====================================================
-- Table: employment
-- =====================================================
CREATE TABLE employment (
    empid INT PRIMARY KEY,
    doctorid INT,
    emptype VARCHAR(20),
    hire_date DATE,
    status VARCHAR(20),
    FOREIGN KEY (doctorid) REFERENCES doctor(doctorid)
);

-- =====================================================
-- Table: appointments
-- =====================================================
CREATE TABLE appointments (
    appointmentid INT PRIMARY KEY,
    patientid INT,
    doctorid INT,
    apdate DATE,
    status VARCHAR(20),
    `time` VARCHAR(10),
    type VARCHAR(50),
    duration INT,
    reason VARCHAR(255),
    FOREIGN KEY (patientid) REFERENCES patient(patientid),
    FOREIGN KEY (doctorid) REFERENCES doctor(doctorid)
);

-- =====================================================
-- Table: medicalrecords
-- =====================================================
CREATE TABLE medicalrecords (
    recordid INT PRIMARY KEY,
    appointmentid INT,
    doctorid INT,
    patientid INT,
    mdate DATE,
    diagnosis VARCHAR(255),
    treatment VARCHAR(255),
    recordtype VARCHAR(50),
    FOREIGN KEY (appointmentid) REFERENCES appointments(appointmentid),
    FOREIGN KEY (doctorid) REFERENCES doctor(doctorid),
    FOREIGN KEY (patientid) REFERENCES patient(patientid)
);

-- =====================================================
-- Table: prescription
-- =====================================================
CREATE TABLE prescription (
    prescriptionid INT PRIMARY KEY,
    doctorid INT,
    patientid INT,
    recordid INT,
    medname VARCHAR(100),
    doses VARCHAR(50),
    frequency VARCHAR(50),
    startdate DATE,
    enddate DATE,
    status VARCHAR(20),
    FOREIGN KEY (doctorid) REFERENCES doctor(doctorid),
    FOREIGN KEY (patientid) REFERENCES patient(patientid),
    FOREIGN KEY (recordid) REFERENCES medicalrecords(recordid)
);

-- =====================================================
-- Table: contactinfo
-- =====================================================
CREATE TABLE contactinfo (
    contactid INT PRIMARY KEY,
    patientid INT,
    patientpnumber VARCHAR(15),
    emergcontactname VARCHAR(100),
    emergcontactnumber VARCHAR(15),
    emergcontactrelation VARCHAR(50),
    FOREIGN KEY (patientid) REFERENCES patient(patientid)
);

-- =====================================================
-- Table: allergies
-- =====================================================
CREATE TABLE allergies (
    allergyid INT PRIMARY KEY,
    patientid INT,
    allergen VARCHAR(100),
    reactiontype VARCHAR(100),
    severity VARCHAR(20),
    FOREIGN KEY (patientid) REFERENCES patient(patientid)
);

-- =====================================================
-- Table: zipcodes
-- =====================================================
CREATE TABLE zipcodes (
    zipid INT PRIMARY KEY,
    city VARCHAR(50),
    state VARCHAR(50)
);

-- =====================================================
-- Table: address
-- =====================================================
CREATE TABLE address (
    addressid INT PRIMARY KEY,
    patientid INT,
    country VARCHAR(50),
    streetaddress VARCHAR(50),
    zipid INT,
    FOREIGN KEY (patientid) REFERENCES patient(patientid),
    FOREIGN KEY (zipid) REFERENCES zipcodes(zipid)
);

-- =====================================================
-- Sample Data
-- =====================================================

INSERT INTO doctor VALUES
    (1, 'John',    'Smith', 'jsmith@email.com', '555-111-2222', 'Cardiology', 'Heart Specialist'),
    (2, 'Emily',   'Davis', 'edavis@email.com', '555-222-3333', 'Pediatrics', 'Child Care'),
    (3, 'Michael', 'Brown', 'mbrown@email.com', '555-333-4444', 'Neurology',  'Brain Specialist');

INSERT INTO patient VALUES
    (1, '123-45-6789', 'Alice',  'Johnson',  '2026-05-12', 140, 5.5, 'O+', 'Single',  'White',    'Female', 'English'),
    (2, '987-65-4321', 'Bob',    'Williams', '2025-08-10', 180, 5.9, 'A-', 'Married', 'Black',    'Male',   'English'),
    (3, '456-78-9123', 'Carlos', 'Garcia',   '2024-02-10', 160, 5.7, 'B+', 'Single',  'Hispanic', 'Male',   'Spanish');

INSERT INTO zipcodes VALUES
    (1, 'New York',    'NY'),
    (2, 'Los Angeles', 'CA'),
    (3, 'Chicago',     'IL');

INSERT INTO employment VALUES
    (1, 1, 'Full-Time', '2025-01-15', 'Active'),
    (2, 2, 'Part-Time', '2024-06-10', 'Active'),
    (3, 3, 'Full-Time', '2025-09-01', 'Active');

INSERT INTO appointments VALUES
    (1, 1, 1, '2026-05-04', 'Completed', '10:00AM', 'Checkup',      30, 'Routine heart check'),
    (2, 2, 2, '2026-05-09', 'Scheduled', '11:30AM', 'Consultation', 45, 'Child fever'),
    (3, 3, 3, '2026-04-30', 'Scheduled', '02:00PM', 'Exam',         60, 'Headaches');

INSERT INTO medicalrecords VALUES
    (1, 1, 1, 1, '2026-05-14', 'Healthy',  'No treatment needed', 'General'),
    (2, 2, 2, 2, '2026-05-12', 'Flu',      'Rest and fluids',     'Diagnosis'),
    (3, 3, 3, 3, '2026-05-02', 'Migraine', 'Pain medication',     'Diagnosis');

INSERT INTO prescription VALUES
    (1, 1, 1, 1, 'Aspirin',   '100mg', 'Once daily',     '2026-03-13', '2026-05-25', 'Active'),
    (2, 2, 2, 2, 'Tylenol',   '500mg', 'Twice daily',    '2026-04-04', '2026-04-24', 'Active'),
    (3, 3, 3, 3, 'Ibuprofen', '200mg', 'Every 6 hours',  '2026-05-02', '2026-05-09', 'Active');

INSERT INTO contactinfo VALUES
    (1, 1, '555-783-1212', 'Mary Johnson',    '555-999-8888', 'Mother'),
    (2, 2, '444-454-2342', 'Sarah Williams',  '555-888-7777', 'Wife'),
    (3, 3, '555-984-3243', 'Luis Garcia',     '555-777-6666', 'Father');

INSERT INTO allergies VALUES
    (1, 1, 'Peanuts', 'Hives',      'High'),
    (2, 2, 'Dust',    'Sneezing',   'Low'),
    (3, 3, 'Pollen',  'Runny nose', 'Medium');

INSERT INTO address VALUES
    (1, 1, 'USA', '123 Main St', 1),
    (2, 2, 'USA', '456 Oak Ave', 2),
    (3, 3, 'USA', '789 Pine Rd', 3);

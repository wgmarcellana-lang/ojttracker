const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, '..', 'data', 'sqlite');
const dbPath = path.join(dataDir, 'ojttracker.db');

fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    intern_id INTEGER UNIQUE,
    supervisor_id INTEGER UNIQUE,
    FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS supervisors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS interns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    school TEXT NOT NULL,
    course TEXT NOT NULL,
    required_hours INTEGER NOT NULL DEFAULT 486,
    start_date TEXT NOT NULL,
    supervisor_id INTEGER,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intern_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time_in TEXT NOT NULL,
    time_out TEXT NOT NULL,
    break_hours REAL NOT NULL DEFAULT 1,
    hours_worked REAL NOT NULL,
    task_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    supervisor_comment TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (intern_id, date),
    FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
  );
`);

const count = (tableName) => {
  const row = db.prepare(`SELECT COUNT(*) AS total FROM ${tableName}`).get();
  return row.total;
};

if (count('supervisors') === 0) {
  const stmt = db.prepare(`
    INSERT INTO supervisors (name, email, department)
    VALUES (:name, :email, :department)
  `);

  [
    {
      name: 'Kylie Jenner',
      email: 'kylie.jenner@company.test',
      department: 'Operations'
    },
    {
      name: 'Kendall Jenner',
      email: 'kendall.jenner@company.test',
      department: 'Engineering'
    }
  ].forEach((supervisor) => stmt.run(supervisor));
}

if (count('interns') === 0) {
  const stmt = db.prepare(`
    INSERT INTO interns (name, school, course, required_hours, start_date, supervisor_id)
    VALUES (:name, :school, :course, :required_hours, :start_date, :supervisor_id)
  `);

  [
    {
      name: 'Constante Dizon',
      school: 'Adamson University',
      course: 'Computer Science',
      required_hours: 486,
      start_date: '2026-01-12',
      supervisor_id: 1
    },
    {
      name: 'Althea Karylle Correa',
      school: 'Ateneo de Manila University',
      course: 'Information Technology',
      required_hours: 486,
      start_date: '2026-01-20',
      supervisor_id: 1
    },
    {
      name: 'Johann Amago',
      school: 'University of Sto. Tomas',
      course: 'Information Systems',
      required_hours: 600,
      start_date: '2026-02-02',
      supervisor_id: 2
    }
  ].forEach((intern) => stmt.run(intern));
}

if (count('daily_logs') === 0) {
  const stmt = db.prepare(`
    INSERT INTO daily_logs (
      intern_id,
      date,
      time_in,
      time_out,
      break_hours,
      hours_worked,
      task_description,
      status,
      supervisor_comment
    )
    VALUES (
      :intern_id,
      :date,
      :time_in,
      :time_out,
      :break_hours,
      :hours_worked,
      :task_description,
      :status,
      :supervisor_comment
    )
  `);

  [
    {
      intern_id: 1,
      date: '2026-03-03',
      time_in: '08:00',
      time_out: '17:00',
      break_hours: 1,
      hours_worked: 8,
      task_description: 'Document organization and help desk support.',
      status: 'approved',
      supervisor_comment: 'Accurate and complete.'
    },
    {
      intern_id: 1,
      date: '2026-03-04',
      time_in: '08:15',
      time_out: '17:10',
      break_hours: 1,
      hours_worked: 7.92,
      task_description: 'Updated inventory records and prepared weekly report.',
      status: 'pending',
      supervisor_comment: ''
    },
    {
      intern_id: 2,
      date: '2026-03-04',
      time_in: '08:30',
      time_out: '17:00',
      break_hours: 1,
      hours_worked: 7.5,
      task_description: 'QA testing and issue reproduction.',
      status: 'approved',
      supervisor_comment: 'Good detail in the task description.'
    },
    {
      intern_id: 3,
      date: '2026-03-05',
      time_in: '09:00',
      time_out: '18:00',
      break_hours: 1,
      hours_worked: 8,
      task_description: 'API endpoint testing and database checks.',
      status: 'rejected',
      supervisor_comment: 'Please clarify the specific endpoints tested.'
    }
  ].forEach((log) => stmt.run(log));
}

if (count('users') === 0) {
  const stmt = db.prepare(`
    INSERT INTO users (username, password, role, intern_id, supervisor_id)
    VALUES (:username, :password, :role, :intern_id, :supervisor_id)
  `);

  [
    { username: 'admin', password: 'admin', role: 'admin', intern_id: null, supervisor_id: null },
    { username: 'constante', password: 'intern', role: 'intern', intern_id: 1, supervisor_id: null },
    { username: 'althea', password: 'intern', role: 'intern', intern_id: 2, supervisor_id: null },
    { username: 'johann', password: 'intern', role: 'intern', intern_id: 3, supervisor_id: null },
    { username: 'kylie', password: 'supervisor', role: 'supervisor', intern_id: null, supervisor_id: 1 },
    { username: 'kendall', password: 'supervisor', role: 'supervisor', intern_id: null, supervisor_id: 2 }
  ].forEach((user) => stmt.run(user));
}

const normalizeParams = (params) => {
  if (Array.isArray(params)) {
    return params;
  }

  return params || {};
};

const run = (sql, params) => db.prepare(sql).run(normalizeParams(params));

const get = (sql, params) => db.prepare(sql).get(normalizeParams(params));

const all = (sql, params) => db.prepare(sql).all(normalizeParams(params));

module.exports = {
  db,
  dbPath,
  run,
  get,
  all
};

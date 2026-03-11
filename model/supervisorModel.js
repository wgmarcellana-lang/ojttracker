const { all, get, run } = require('../config/database');

exports.tableName = 'supervisors';

const supervisorColumns = `
  s.id,
  s.name,
  s.email,
  s.department
`;

const internColumns = `
  id,
  name,
  school,
  course,
  required_hours,
  start_date,
  supervisor_id
`;

exports.getAll = async () => all(`
  SELECT ${supervisorColumns},
         u.username,
         COUNT(i.id) AS intern_count
  FROM supervisors s
  LEFT JOIN users u ON u.supervisor_id = s.id
  LEFT JOIN interns i ON i.supervisor_id = s.id
  GROUP BY s.id
  ORDER BY s.name ASC
`);

exports.getById = async (id) => get(`
  SELECT ${supervisorColumns},
         u.username,
         COUNT(i.id) AS intern_count
  FROM supervisors s
  LEFT JOIN users u ON u.supervisor_id = s.id
  LEFT JOIN interns i ON i.supervisor_id = s.id
  WHERE s.id = :id
  GROUP BY s.id
`, { id: Number(id) });

exports.create = async (payload) => run(`
  INSERT INTO supervisors (name, email, department)
  VALUES (:name, :email, :department)
`, {
  name: payload.name,
  email: payload.email,
  department: payload.department
});

exports.update = async (id, payload) => run(`
  UPDATE supervisors
  SET name = :name,
      email = :email,
      department = :department
  WHERE id = :id
`, {
  id: Number(id),
  name: payload.name,
  email: payload.email,
  department: payload.department
});

exports.delete = async (id) => run(`
  DELETE FROM supervisors WHERE id = :id
`, { id: Number(id) });

exports.getInterns = async (id) => all(`
  SELECT ${internColumns}
  FROM interns
  WHERE supervisor_id = :id
  ORDER BY name ASC
`, { id: Number(id) });

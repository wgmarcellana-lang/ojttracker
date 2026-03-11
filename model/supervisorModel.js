const { all, get, run } = require('../config/database');

exports.tableName = 'supervisors';

exports.getAll = () => all(`
  SELECT s.*,
         u.username,
         COUNT(i.id) AS intern_count
  FROM supervisors s
  LEFT JOIN users u ON u.supervisor_id = s.id
  LEFT JOIN interns i ON i.supervisor_id = s.id
  GROUP BY s.id
  ORDER BY s.name ASC
`);

exports.getById = (id) => get(`
  SELECT s.*,
         u.username,
         COUNT(i.id) AS intern_count
  FROM supervisors s
  LEFT JOIN users u ON u.supervisor_id = s.id
  LEFT JOIN interns i ON i.supervisor_id = s.id
  WHERE s.id = :id
  GROUP BY s.id
`, { id: Number(id) });

exports.create = (payload) => run(`
  INSERT INTO supervisors (name, email, department)
  VALUES (:name, :email, :department)
`, {
  name: payload.name,
  email: payload.email,
  department: payload.department
});

exports.update = (id, payload) => run(`
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

exports.delete = (id) => run(`
  DELETE FROM supervisors WHERE id = :id
`, { id: Number(id) });

exports.getInterns = (id) => all(`
  SELECT *
  FROM interns
  WHERE supervisor_id = :id
  ORDER BY name ASC
`, { id: Number(id) });

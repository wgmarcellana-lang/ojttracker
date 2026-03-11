const { all, get, run } = require('../config/database');

exports.tableName = 'users';

exports.getAll = () => all(`
  SELECT u.*,
         i.name AS intern_name,
         s.name AS supervisor_name
  FROM users u
  LEFT JOIN interns i ON i.id = u.intern_id
  LEFT JOIN supervisors s ON s.id = u.supervisor_id
  ORDER BY u.username ASC
`);

exports.getById = (id) => get(`
  SELECT *
  FROM users
  WHERE id = :id
`, { id: Number(id) });

exports.getByUsername = (username) => get(`
  SELECT *
  FROM users
  WHERE lower(username) = lower(:username)
`, { username });

exports.getByInternId = (internId) => get(`
  SELECT *
  FROM users
  WHERE intern_id = :internId
`, { internId: Number(internId) });

exports.getBySupervisorId = (supervisorId) => get(`
  SELECT *
  FROM users
  WHERE supervisor_id = :supervisorId
`, { supervisorId: Number(supervisorId) });

exports.create = (payload) => run(`
  INSERT INTO users (username, password, role, intern_id, supervisor_id)
  VALUES (:username, :password, :role, :intern_id, :supervisor_id)
`, {
  username: String(payload.username).trim().toLowerCase(),
  password: payload.password,
  role: payload.role,
  intern_id: payload.intern_id ? Number(payload.intern_id) : null,
  supervisor_id: payload.supervisor_id ? Number(payload.supervisor_id) : null
});

exports.update = (id, payload) => run(`
  UPDATE users
  SET username = :username,
      password = :password,
      role = :role,
      intern_id = :intern_id,
      supervisor_id = :supervisor_id
  WHERE id = :id
`, {
  id: Number(id),
  username: String(payload.username).trim().toLowerCase(),
  password: payload.password,
  role: payload.role,
  intern_id: payload.intern_id ? Number(payload.intern_id) : null,
  supervisor_id: payload.supervisor_id ? Number(payload.supervisor_id) : null
});

exports.deleteByInternId = (internId) => run(`
  DELETE FROM users WHERE intern_id = :internId
`, { internId: Number(internId) });

exports.deleteBySupervisorId = (supervisorId) => run(`
  DELETE FROM users WHERE supervisor_id = :supervisorId
`, { supervisorId: Number(supervisorId) });

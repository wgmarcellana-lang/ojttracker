const { all, get, run } = require('../config/database');
const { hashPassword, isPasswordHash } = require('../utilities/passwordUtils');

exports.tableName = 'users';

const userColumns = `
  u.id,
  u.username,
  u.password,
  u.role,
  u.intern_id,
  u.supervisor_id
`;

exports.getAll = async () => all(`
  SELECT ${userColumns},
         i.name AS intern_name,
         s.name AS supervisor_name
  FROM users u
  LEFT JOIN interns i ON i.id = u.intern_id
  LEFT JOIN supervisors s ON s.id = u.supervisor_id
  ORDER BY u.username ASC
`);

exports.getById = async (id) => get(`
  SELECT id,
         username,
         password,
         role,
         intern_id,
         supervisor_id
  FROM users
  WHERE id = :id
`, { id: Number(id) });

exports.getByUsername = async (username) => get(`
  SELECT id,
         username,
         password,
         role,
         intern_id,
         supervisor_id
  FROM users
  WHERE lower(username) = lower(:username)
`, { username });

exports.getByInternId = async (internId) => get(`
  SELECT id,
         username,
         password,
         role,
         intern_id,
         supervisor_id
  FROM users
  WHERE intern_id = :internId
`, { internId: Number(internId) });

exports.getBySupervisorId = async (supervisorId) => get(`
  SELECT id,
         username,
         password,
         role,
         intern_id,
         supervisor_id
  FROM users
  WHERE supervisor_id = :supervisorId
`, { supervisorId: Number(supervisorId) });

exports.create = async (payload) => run(`
  INSERT INTO users (username, password, role, intern_id, supervisor_id)
  VALUES (:username, :password, :role, :intern_id, :supervisor_id)
`, {
  username: String(payload.username).trim().toLowerCase(),
  password: isPasswordHash(payload.password) ? payload.password : await hashPassword(payload.password),
  role: payload.role,
  intern_id: payload.intern_id ? Number(payload.intern_id) : null,
  supervisor_id: payload.supervisor_id ? Number(payload.supervisor_id) : null
});

exports.update = async (id, payload) => run(`
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
  password: isPasswordHash(payload.password) ? payload.password : await hashPassword(payload.password),
  role: payload.role,
  intern_id: payload.intern_id ? Number(payload.intern_id) : null,
  supervisor_id: payload.supervisor_id ? Number(payload.supervisor_id) : null
});

exports.updatePassword = async (id, password) => run(`
  UPDATE users
  SET password = :password
  WHERE id = :id
`, {
  id: Number(id),
  password: isPasswordHash(password) ? password : await hashPassword(password)
});

exports.deleteByInternId = async (internId) => run(`
  DELETE FROM users WHERE intern_id = :internId
`, { internId: Number(internId) });

exports.deleteBySupervisorId = async (supervisorId) => run(`
  DELETE FROM users WHERE supervisor_id = :supervisorId
`, { supervisorId: Number(supervisorId) });

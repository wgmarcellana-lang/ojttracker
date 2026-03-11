const { all, get, run } = require('../config/database');

exports.tableName = 'interns';

exports.getAll = () => all(`
  SELECT i.*,
         s.name AS supervisor_name,
         s.email AS supervisor_email,
         u.username,
         COALESCE(approved.approved_hours, 0) AS approved_hours
  FROM interns i
  LEFT JOIN supervisors s ON s.id = i.supervisor_id
  LEFT JOIN users u ON u.intern_id = i.id
  LEFT JOIN (
    SELECT intern_id, ROUND(SUM(hours_worked), 2) AS approved_hours
    FROM daily_logs
    WHERE status = 'approved'
    GROUP BY intern_id
  ) approved ON approved.intern_id = i.id
  ORDER BY i.name ASC
`);

exports.getById = (id) => get(`
  SELECT i.*,
         s.name AS supervisor_name,
         s.email AS supervisor_email,
         s.department AS supervisor_department,
         u.username
  FROM interns i
  LEFT JOIN supervisors s ON s.id = i.supervisor_id
  LEFT JOIN users u ON u.intern_id = i.id
  WHERE i.id = :id
`, { id: Number(id) });

exports.getWithSupervisor = (id) => exports.getById(id);

exports.getDashboardSummary = (id) => {
  const intern = exports.getById(id);
  if (!intern) {
    return null;
  }

  const approvedHoursRow = get(`
    SELECT ROUND(COALESCE(SUM(hours_worked), 0), 2) AS approved_hours
    FROM daily_logs
    WHERE intern_id = :id AND status = 'approved'
  `, { id: Number(id) });

  const totalHoursRow = get(`
    SELECT ROUND(COALESCE(SUM(hours_worked), 0), 2) AS total_hours
    FROM daily_logs
    WHERE intern_id = :id
  `, { id: Number(id) });

  const pendingLogsRow = get(`
    SELECT COUNT(*) AS pending_count
    FROM daily_logs
    WHERE intern_id = :id AND status = 'pending'
  `, { id: Number(id) });

  return {
    intern,
    approvedHours: Number(approvedHoursRow.approved_hours || 0),
    totalHours: Number(totalHoursRow.total_hours || 0),
    pendingCount: Number(pendingLogsRow.pending_count || 0)
  };
};

exports.create = (payload) => run(`
  INSERT INTO interns (
    name,
    school,
    course,
    required_hours,
    start_date,
    supervisor_id
  )
  VALUES (
    :name,
    :school,
    :course,
    :required_hours,
    :start_date,
    :supervisor_id
  )
`, {
  name: payload.name,
  school: payload.school,
  course: payload.course,
  required_hours: Number(payload.required_hours),
  start_date: payload.start_date,
  supervisor_id: payload.supervisor_id ? Number(payload.supervisor_id) : null
});

exports.update = (id, payload) => run(`
  UPDATE interns
  SET name = :name,
      school = :school,
      course = :course,
      required_hours = :required_hours,
      start_date = :start_date,
      supervisor_id = :supervisor_id
  WHERE id = :id
`, {
  id: Number(id),
  name: payload.name,
  school: payload.school,
  course: payload.course,
  required_hours: Number(payload.required_hours),
  start_date: payload.start_date,
  supervisor_id: payload.supervisor_id ? Number(payload.supervisor_id) : null
});

exports.delete = (id) => run(`
  DELETE FROM interns WHERE id = :id
`, { id: Number(id) });

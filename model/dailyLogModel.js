const { all, get, run } = require('../config/database');

exports.tableName = 'daily_logs';

const dailyLogColumns = `
  dl.id,
  dl.intern_id,
  dl.date,
  dl.time_in,
  dl.time_out,
  dl.break_hours,
  dl.hours_worked,
  dl.task_description,
  dl.status,
  dl.supervisor_comment,
  dl.created_at,
  dl.updated_at
`;

const selectClause = `
  SELECT ${dailyLogColumns},
         i.name AS intern_name,
         i.required_hours,
         s.name AS supervisor_name
  FROM daily_logs dl
  INNER JOIN interns i ON i.id = dl.intern_id
  LEFT JOIN supervisors s ON s.id = i.supervisor_id
`;

exports.getAll = async () => all(`
  ${selectClause}
  ORDER BY dl.date DESC, dl.id DESC
`);

exports.getById = async (id) => get(`
  ${selectClause}
  WHERE dl.id = :id
`, { id: Number(id) });

exports.getByInternId = async (internId) => all(`
  ${selectClause}
  WHERE dl.intern_id = :internId
  ORDER BY dl.date DESC, dl.id DESC
`, { internId: Number(internId) });

exports.getRecentByIntern = async (internId, limit = 5) => all(`
  ${selectClause}
  WHERE dl.intern_id = :internId
  ORDER BY dl.date DESC, dl.id DESC
  LIMIT :limit
`, {
  internId: Number(internId),
  limit: Number(limit)
});

exports.getBySupervisor = async (supervisorId) => all(`
  ${selectClause}
  WHERE i.supervisor_id = :supervisorId
  ORDER BY CASE dl.status
    WHEN 'pending' THEN 1
    WHEN 'rejected' THEN 2
    ELSE 3
  END,
  dl.date DESC
`, { supervisorId: Number(supervisorId) });

exports.getApprovedHoursByIntern = async (internId) => get(`
  SELECT ROUND(COALESCE(SUM(hours_worked), 0), 2) AS approved_hours
  FROM daily_logs
  WHERE intern_id = :internId
    AND status = 'approved'
`, { internId: Number(internId) });

exports.findByInternAndDate = async (internId, date, excludeId) => {
  const params = {
    internId: Number(internId),
    date
  };

  if (excludeId) {
    return get(`
      SELECT id,
             intern_id,
             date
      FROM daily_logs
      WHERE intern_id = :internId
        AND date = :date
        AND id != :excludeId
    `, {
      ...params,
      excludeId: Number(excludeId)
    });
  }

  return get(`
    SELECT id,
           intern_id,
           date
    FROM daily_logs
    WHERE intern_id = :internId
      AND date = :date
  `, params);
};

exports.create = async (payload) => run(`
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
`, {
  intern_id: Number(payload.intern_id),
  date: payload.date,
  time_in: payload.time_in,
  time_out: payload.time_out,
  break_hours: Number(payload.break_hours),
  hours_worked: Number(payload.hours_worked),
  task_description: payload.task_description,
  status: payload.status || 'pending',
  supervisor_comment: payload.supervisor_comment || ''
});

exports.update = async (id, payload) => run(`
  UPDATE daily_logs
  SET intern_id = :intern_id,
      date = :date,
      time_in = :time_in,
      time_out = :time_out,
      break_hours = :break_hours,
      hours_worked = :hours_worked,
      task_description = :task_description,
      status = :status,
      supervisor_comment = :supervisor_comment,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = :id
`, {
  id: Number(id),
  intern_id: Number(payload.intern_id),
  date: payload.date,
  time_in: payload.time_in,
  time_out: payload.time_out,
  break_hours: Number(payload.break_hours),
  hours_worked: Number(payload.hours_worked),
  task_description: payload.task_description,
  status: payload.status || 'pending',
  supervisor_comment: payload.supervisor_comment || ''
});

exports.updateStatus = async (id, status, comment = '') => run(`
  UPDATE daily_logs
  SET status = :status,
      supervisor_comment = :comment,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = :id
`, {
  id: Number(id),
  status,
  comment
});

exports.delete = async (id) => run(`
  DELETE FROM daily_logs WHERE id = :id
`, { id: Number(id) });

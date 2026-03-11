const { all, get, run } = require('../config/database');

exports.tableName = 'daily_logs';

const selectClause = `
  SELECT dl.*,
         i.name AS intern_name,
         i.required_hours,
         s.name AS supervisor_name
  FROM daily_logs dl
  INNER JOIN interns i ON i.id = dl.intern_id
  LEFT JOIN supervisors s ON s.id = i.supervisor_id
`;

exports.getAll = () => all(`
  ${selectClause}
  ORDER BY dl.date DESC, dl.id DESC
`);

exports.getById = (id) => get(`
  ${selectClause}
  WHERE dl.id = :id
`, { id: Number(id) });

exports.getByInternId = (internId) => all(`
  ${selectClause}
  WHERE dl.intern_id = :internId
  ORDER BY dl.date DESC, dl.id DESC
`, { internId: Number(internId) });

exports.getRecentByIntern = (internId, limit = 5) => all(`
  ${selectClause}
  WHERE dl.intern_id = :internId
  ORDER BY dl.date DESC, dl.id DESC
  LIMIT :limit
`, {
  internId: Number(internId),
  limit: Number(limit)
});

exports.getBySupervisor = (supervisorId) => all(`
  ${selectClause}
  WHERE i.supervisor_id = :supervisorId
  ORDER BY CASE dl.status
    WHEN 'pending' THEN 1
    WHEN 'rejected' THEN 2
    ELSE 3
  END,
  dl.date DESC
`, { supervisorId: Number(supervisorId) });

exports.getApprovedHoursByIntern = (internId) => get(`
  SELECT ROUND(COALESCE(SUM(hours_worked), 0), 2) AS approved_hours
  FROM daily_logs
  WHERE intern_id = :internId
    AND status = 'approved'
`, { internId: Number(internId) });

exports.findByInternAndDate = (internId, date, excludeId) => {
  const params = {
    internId: Number(internId),
    date
  };

  if (excludeId) {
    return get(`
      SELECT *
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
    SELECT *
    FROM daily_logs
    WHERE intern_id = :internId
      AND date = :date
  `, params);
};

exports.create = (payload) => run(`
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

exports.update = (id, payload) => run(`
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

exports.updateStatus = (id, status, comment = '') => run(`
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

exports.delete = (id) => run(`
  DELETE FROM daily_logs WHERE id = :id
`, { id: Number(id) });

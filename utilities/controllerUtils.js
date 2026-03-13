const getScopedInternId = ({
  user,
  query = {},
  params = {},
  interns = [],
  fallbackInternId = 0
} = {}) => {
  if (user?.role === 'intern') {
    return Number(user.entityId);
  }

  return Number(
    params.internId
      || query.internId
      || fallbackInternId
      || interns[0]?.id
      || 0
  );
};

const getScopedSupervisorId = ({
  user,
  query = {},
  fallbackSupervisorId = 1
} = {}) => {
  if (user?.role === 'supervisor') {
    return Number(user.entityId);
  }

  return Number(query.id || fallbackSupervisorId);
};

const buildLogStatusStats = (logs = []) => ({
  pending: logs.filter((log) => log.status === 'pending').length,
  approved: logs.filter((log) => log.status === 'approved').length,
  rejected: logs.filter((log) => log.status === 'rejected').length
});

module.exports = {
  getScopedInternId,
  getScopedSupervisorId,
  buildLogStatusStats
};

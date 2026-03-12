const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const reportUtils = require('../utilities/reportUtils');

async function getReport(req, res, next) {
  try {
    const interns = await internModel.getAll();
    const selectedInternId = req.user.role === 'intern'
      ? Number(req.user.entityId)
      : Number(req.query.internId || interns[0]?.id || 0);
    const intern = interns.find((item) => Number(item.id) === selectedInternId) || await internModel.getById(selectedInternId);
    const logs = intern ? await dailyLogModel.getByInternId(intern.id) : [];
    const report = intern ? reportUtils.buildCompletionReport(intern, logs) : null;

    return res.status(200).json({
      success: true,
      interns,
      selectedInternId,
      report
    });
  } catch (error) {
    return next(error);
  }
}

async function exportCsv(req, res, next) {
  try {
    const internId = req.user.role === 'intern'
      ? req.user.entityId
      : Number(req.params.internId || req.query.internId || 0);
    const intern = await internModel.getById(internId);

    if (!intern) {
      return res.status(404).json({
        success: false,
        details: 'Intern not found.'
      });
    }

    const logs = await dailyLogModel.getByInternId(intern.id);
    const csv = reportUtils.buildCsv(intern, logs);

    res.setHeader('Content-Type', 'text/csv');
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getReport,
  exportCsv
};

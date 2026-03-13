const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const { getScopedInternId } = require('../utilities/controllerUtils');
const reportUtils = require('../utilities/reportUtils');

async function getReport(req, res, next) {
  try {
    const { query, user } = req;
    const interns = await internModel.getAll();
    const selectedInternId = getScopedInternId({ user, query, interns });
    const intern = interns.find((item) => Number(item.id) === selectedInternId)
      || await internModel.getById(selectedInternId);
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
    const { params, query, user } = req;
    const internId = getScopedInternId({ user, query, params });
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

const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const reportUtils = require('../utilities/reportUtils');

async function showReports(req, res, next) {
  try {
    const interns = await internModel.getAll();
    const selectedInternId = req.user && req.user.role === 'intern'
      ? Number(req.user.entityId)
      : Number(req.query.internId || interns[0]?.id || 0);
    const intern = interns.find((item) => Number(item.id) === selectedInternId) || await internModel.getById(selectedInternId);
    const logs = intern ? await dailyLogModel.getByInternId(intern.id) : [];
    const report = intern ? reportUtils.buildCompletionReport(intern, logs) : null;

    return res.render('reports/index', {
      pageTitle: 'Reports',
      interns,
      selectedInternId,
      report,
      pdfMessage: null
    });
  } catch (error) {
    return next(error);
  }
}

async function exportCsv(req, res, next) {
  try {
    const internId = req.user && req.user.role === 'intern'
      ? req.user.entityId
      : (req.query.internId || 1);
    const intern = await internModel.getById(internId);

    if (!intern) {
      return res.status(404).send('Intern not found.');
    }

    const logs = await dailyLogModel.getByInternId(intern.id);
    const csv = reportUtils.buildCsv(intern, logs);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ojt-report-${intern.id}.csv"`);
    return res.send(csv);
  } catch (error) {
    return next(error);
  }
}

async function exportPdf(req, res, next) {
  try {
    return res.status(501).render('reports/index', {
      pageTitle: 'Reports',
      interns: await internModel.getAll(),
      selectedInternId: Number(req.query.internId || 1),
      report: null,
      pdfMessage: 'PDF export is not available at the moment.'
    });
  } catch (error) {
    return next(error);
  }
}

exports.showReports = showReports;
exports.exportCsv = exportCsv;
exports.exportPdf = exportPdf;

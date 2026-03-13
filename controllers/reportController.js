const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const { getScopedInternId } = require('../utilities/controllerUtils');
const reportUtils = require('../utilities/reportUtils');

async function showReports(req, res, next) {
  try {
    const { query, user } = req;
    const interns = await internModel.getAll();
    const selectedInternId = getScopedInternId({ user, query, interns });
    const intern = interns.find((item) => Number(item.id) === selectedInternId)
      || await internModel.getById(selectedInternId);
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
    const { query, user } = req;
    const internId = getScopedInternId({ user, query, fallbackInternId: 1 });
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
    const { query } = req;
    const interns = await internModel.getAll();
    const selectedInternId = getScopedInternId({
      query,
      interns,
      fallbackInternId: 1
    });

    return res.status(501).render('reports/index', {
      pageTitle: 'Reports',
      interns,
      selectedInternId,
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

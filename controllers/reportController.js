const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const reportUtils = require('../utilities/reportUtils');

exports.showReports = (req, res) => {
  const interns = internModel.getAll();
  const selectedInternId = req.user && req.user.role === 'intern'
    ? Number(req.user.entityId)
    : Number(req.query.internId || interns[0]?.id || 0);
  const intern = interns.find((item) => Number(item.id) === selectedInternId) || internModel.getById(selectedInternId);
  const logs = intern ? dailyLogModel.getByInternId(intern.id) : [];
  const report = intern ? reportUtils.buildCompletionReport(intern, logs) : null;

  res.render('reports/index', {
    pageTitle: 'Reports',
    interns,
    selectedInternId,
    report,
    pdfMessage: null
  });
};

exports.exportCsv = (req, res) => {
  const internId = req.user && req.user.role === 'intern'
    ? req.user.entityId
    : (req.query.internId || 1);
  const intern = internModel.getById(internId);

  if (!intern) {
    return res.status(404).send('Intern not found.');
  }

  const logs = dailyLogModel.getByInternId(intern.id);
  const csv = reportUtils.buildCsv(intern, logs);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="ojt-report-${intern.id}.csv"`);
  res.send(csv);
};

exports.exportPdf = (req, res) => {
  res.status(501).render('reports/index', {
    pageTitle: 'Reports',
    interns: internModel.getAll(),
    selectedInternId: Number(req.query.internId || 1),
    report: null,
    pdfMessage: 'PDF export is not available at the moment.'
  });
};

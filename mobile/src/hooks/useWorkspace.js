import { useState } from 'react';
import {
  deleteInternRequest,
  deleteLogRequest,
  deleteSupervisorRequest,
  fetchDashboard,
  fetchIntern,
  fetchInterns,
  fetchLogs,
  fetchReport,
  fetchReportCsv,
  fetchReviewLogs,
  fetchSupervisor,
  fetchSupervisors,
  saveLogRequest,
  saveInternRequest,
  saveSupervisorRequest,
  submitReviewRequest,
} from '../services';

const emptyForm = {
  date: '',
  time_in: '08:00',
  time_out: '17:00',
  break_hours: '1',
  task_description: '',
};

const emptyInternForm = {
  name: '',
  school: '',
  course: '',
  required_hours: '486',
  start_date: '',
  supervisor_id: '',
  username: '',
  password: '',
};

const emptySupervisorForm = {
  name: '',
  email: '',
  department: '',
  username: '',
  password: '',
};

export function useWorkspace() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState([]);
  const [reviewLogs, setReviewLogs] = useState([]);
  const [reviewNotes, setReviewNotes] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [adminInterns, setAdminInterns] = useState([]);
  const [adminSupervisors, setAdminSupervisors] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedInternLogs, setSelectedInternLogs] = useState([]);
  const [selectedInternReport, setSelectedInternReport] = useState(null);
  const [internForm, setInternForm] = useState(emptyInternForm);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [supervisorForm, setSupervisorForm] = useState(emptySupervisorForm);
  const [report, setReport] = useState(null);
  const [reportInternId, setReportInternId] = useState(null);

  const loadAdminWorkspace = async (token) => {
    const [internData, supervisorData, reportData] = await Promise.all([
      fetchInterns(token),
      fetchSupervisors(token),
      fetchReport(token),
    ]);

    setAdminInterns(internData.interns || []);
    setAdminSupervisors(supervisorData.supervisors || []);
    setReport(reportData.report || null);
    setReportInternId(reportData.selectedInternId || null);
  };

  const loadWorkspace = async (token, role) => {
    if (!token) {
      return;
    }

    setBusy(true);
    try {
      const [dash, logData, reviewData] = await Promise.all([
        fetchDashboard(token),
        fetchLogs(token),
        role === 'supervisor' || role === 'admin' ? fetchReviewLogs(token) : Promise.resolve({ logs: [] }),
      ]);

      setDashboard(dash.dashboard || null);
      setLogs(logData.logs || []);
      setReviewLogs(reviewData.logs || []);

      if (role === 'admin') {
        await loadAdminWorkspace(token);
      }

      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveLog = async (token) => {
    setBusy(true);
    try {
      await saveLogRequest(token, editingId, form);
      setEditingId(null);
      setForm(emptyForm);
      setActiveTab('logs');
      setError('');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const loadInternDetail = async (token, id) => {
    setBusy(true);
    try {
      const detail = await fetchIntern(token, id);
      setSelectedIntern(detail.intern || null);
      setSelectedInternLogs(detail.logs || []);
      setSelectedInternReport(detail.report || null);
      setAdminSupervisors(detail.supervisors || []);
      setInternForm({
        name: detail.intern?.name || '',
        school: detail.intern?.school || '',
        course: detail.intern?.course || '',
        required_hours: String(detail.intern?.required_hours || '486'),
        start_date: detail.intern?.start_date || '',
        supervisor_id: detail.intern?.supervisor_id ? String(detail.intern.supervisor_id) : '',
        username: detail.intern?.username || '',
        password: '',
      });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const loadSupervisorDetail = async (token, id) => {
    setBusy(true);
    try {
      const detail = await fetchSupervisor(token, id);
      setSelectedSupervisor(detail.supervisor || null);
      setSupervisorForm({
        name: detail.supervisor?.name || '',
        email: detail.supervisor?.email || '',
        department: detail.supervisor?.department || '',
        username: detail.supervisor?.username || '',
        password: '',
      });
      setAdminSupervisors(detail.supervisors || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startCreateIntern = () => {
    setSelectedIntern(null);
    setSelectedInternLogs([]);
    setSelectedInternReport(null);
    setInternForm(emptyInternForm);
  };

  const startCreateSupervisor = () => {
    setSelectedSupervisor(null);
    setSupervisorForm(emptySupervisorForm);
  };

  const saveIntern = async (token) => {
    setBusy(true);
    try {
      const result = await saveInternRequest(token, selectedIntern?.id, internForm);
      await loadAdminWorkspace(token);
      if (result.internId) {
        await loadInternDetail(token, result.internId);
      } else {
        startCreateIntern();
      }
      setError('');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const deleteIntern = async (token, id) => {
    setBusy(true);
    try {
      await deleteInternRequest(token, id);
      await loadAdminWorkspace(token);
      startCreateIntern();
      setError('');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const saveSupervisor = async (token) => {
    setBusy(true);
    try {
      const result = await saveSupervisorRequest(token, selectedSupervisor?.id, supervisorForm);
      await loadAdminWorkspace(token);
      if (result.supervisorId) {
        await loadSupervisorDetail(token, result.supervisorId);
      } else {
        startCreateSupervisor();
      }
      setError('');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const deleteSupervisor = async (token, id) => {
    setBusy(true);
    try {
      await deleteSupervisorRequest(token, id);
      await loadAdminWorkspace(token);
      startCreateSupervisor();
      setError('');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const loadSelectedReport = async (token, internId) => {
    setBusy(true);
    try {
      const data = await fetchReport(token, internId);
      setReport(data.report || null);
      setReportInternId(data.selectedInternId || internId || null);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const exportSelectedReportCsv = async (token) => {
    if (!reportInternId) {
      throw new Error('Select an intern report first.');
    }

    return fetchReportCsv(token, reportInternId);
  };

  const deleteLog = async (token, id) => {
    setBusy(true);
    try {
      await deleteLogRequest(token, id);
      setError('');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async (token, id, action) => {
    setBusy(true);
    try {
      await submitReviewRequest(token, id, action, reviewNotes[id] || '');
      setReviewNotes((current) => ({ ...current, [id]: '' }));
      setError('');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActiveTab('form');
  };

  const openEdit = (log) => {
    setEditingId(log.id);
    setForm({
      date: log.date || '',
      time_in: log.time_in || '08:00',
      time_out: log.time_out || '17:00',
      break_hours: String(log.break_hours ?? '1'),
      task_description: log.task_description || '',
    });
    setActiveTab('form');
  };

  const resetWorkspace = () => {
    setActiveTab('dashboard');
    setBusy(false);
    setError('');
    setDashboard(null);
    setLogs([]);
    setReviewLogs([]);
    setReviewNotes({});
    setForm(emptyForm);
    setEditingId(null);
    setAdminInterns([]);
    setAdminSupervisors([]);
    setSelectedIntern(null);
    setSelectedInternLogs([]);
    setSelectedInternReport(null);
    setInternForm(emptyInternForm);
    setSelectedSupervisor(null);
    setSupervisorForm(emptySupervisorForm);
    setReport(null);
    setReportInternId(null);
  };

  return {
    activeTab,
    setActiveTab,
    busy,
    error,
    dashboard,
    logs,
    reviewLogs,
    reviewNotes,
    setReviewNotes,
    form,
    setForm,
    editingId,
    adminInterns,
    adminSupervisors,
    selectedIntern,
    selectedInternLogs,
    selectedInternReport,
    internForm,
    setInternForm,
    selectedSupervisor,
    supervisorForm,
    setSupervisorForm,
    report,
    reportInternId,
    loadWorkspace,
    loadInternDetail,
    loadSupervisorDetail,
    saveLog,
    saveIntern,
    deleteIntern,
    saveSupervisor,
    deleteSupervisor,
    startCreateIntern,
    startCreateSupervisor,
    loadSelectedReport,
    exportSelectedReportCsv,
    deleteLog,
    submitReview,
    openCreate,
    openEdit,
    resetWorkspace,
  };
}

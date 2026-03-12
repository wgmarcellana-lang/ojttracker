import { apiClient } from './apiClient';
import { API_BASE_URL } from '../config/api';

export async function fetchDashboard(token) {
  return apiClient('/api/dashboard', { token });
}

export async function fetchLogs(token) {
  return apiClient('/api/logs', { token });
}

export async function fetchReviewLogs(token) {
  return apiClient('/api/review-logs', { token });
}

export async function saveLogRequest(token, editingId, form) {
  return apiClient(editingId ? `/api/logs/${editingId}` : '/api/logs', {
    token,
    method: editingId ? 'PUT' : 'POST',
    body: JSON.stringify(form),
  });
}

export async function deleteLogRequest(token, id) {
  return apiClient(`/api/logs/${id}`, {
    token,
    method: 'DELETE',
  });
}

export async function submitReviewRequest(token, id, action, supervisorComment) {
  return apiClient(`/api/review-logs/${id}/${action}`, {
    token,
    method: 'POST',
    body: JSON.stringify({ supervisor_comment: supervisorComment || '' }),
  });
}

export async function fetchInterns(token) {
  return apiClient('/api/interns', { token });
}

export async function fetchIntern(token, id) {
  return apiClient(`/api/interns/${id}`, { token });
}

export async function saveInternRequest(token, editingId, form) {
  return apiClient(editingId ? `/api/interns/${editingId}` : '/api/interns', {
    token,
    method: editingId ? 'PUT' : 'POST',
    body: JSON.stringify(form),
  });
}

export async function deleteInternRequest(token, id) {
  return apiClient(`/api/interns/${id}`, {
    token,
    method: 'DELETE',
  });
}

export async function fetchSupervisors(token) {
  return apiClient('/api/supervisors', { token });
}

export async function fetchSupervisor(token, id) {
  return apiClient(`/api/supervisors/${id}`, { token });
}

export async function saveSupervisorRequest(token, editingId, form) {
  return apiClient(editingId ? `/api/supervisors/${editingId}` : '/api/supervisors', {
    token,
    method: editingId ? 'PUT' : 'POST',
    body: JSON.stringify(form),
  });
}

export async function deleteSupervisorRequest(token, id) {
  return apiClient(`/api/supervisors/${id}`, {
    token,
    method: 'DELETE',
  });
}

export async function fetchReport(token, internId) {
  const query = internId ? `?internId=${encodeURIComponent(internId)}` : '';
  return apiClient(`/api/reports${query}`, { token });
}

export async function fetchReportCsv(token, internId) {
  const response = await fetch(`${API_BASE_URL}/api/reports/${internId}/csv`, {
    headers: {
      Accept: 'text/csv',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.text();

  if (!response.ok) {
    throw new Error(data || 'Unable to export CSV.');
  }

  return data;
}

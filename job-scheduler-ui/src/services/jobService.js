import apiClient from "../api/apiClient";

const jobService = {
  getJobs: () => apiClient.get("/jobs"),
  getJob: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (data) => apiClient.post("/jobs", data),
  updateJob: (id, data) => apiClient.put(`/jobs/${id}`, data),
  pauseJob: (id) => apiClient.post(`/jobs/${id}/pause`),
  resumeJob: (id) => apiClient.post(`/jobs/${id}/resume`),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
  getJobHistory: (id) => apiClient.get(`/jobs/${id}/history`),
};

export default jobService;

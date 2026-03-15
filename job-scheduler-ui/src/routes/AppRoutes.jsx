import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/Layout";

// Pages
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import JobsPage from "../pages/JobsPage";
import CreateJobPage from "../pages/CreateJobPage";
import JobDetailsPage from "../pages/JobDetailsPage";
import JobHistoryPage from "../pages/JobHistoryPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes inside Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/create" element={<CreateJobPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/jobs/:id/history" element={<JobHistoryPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

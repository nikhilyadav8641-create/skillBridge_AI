import { Routes, Route, Outlet } from "react-router-dom";

import Navbar from "./component/common/Navbar.jsx";
import Sidebar from "./component/common/Sidebar.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AnalysisPage from "./pages/AnalysisPage.jsx";
import RoadmapPage from "./pages/RoadmapPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HelpSupportPage from "./pages/HelpSupportPage.jsx";
import CareerComparisonPage from "./pages/CareerComparisonPage.jsx";

import "./App.css";

function AppLayout() {
  return (
    <div className="app">
      <Navbar />

      <div className="app-layout">
        <Sidebar />

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/help" element={<HelpSupportPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/career-comparison" element={<CareerComparisonPage />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="container py-5">
            <h2>404 — Page Not Found</h2>
            <p>Check the URL or return to the dashboard.</p>
            <a href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;

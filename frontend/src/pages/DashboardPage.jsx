
import { useEffect, useState, useCallback } from 'react'
import {
  FileText,
  Target,
  BookOpen,
  BriefcaseBusiness,
  RefreshCw,
} from 'lucide-react'


import { useAuth } from '../context/AuthContext'
import SummaryCard from '../component/dashboard/SummaryCard.jsx'
import ProgressChart from '../component/dashboard/ProgressChart.jsx'
import API from '../api/auth.js'

const initialStats = {
  resumeScore: '--',
  skillMatch: '--',
  skillsToLearn: '--',
  projects: 0,
  totalProjects: 0,
  completedProjects: 0,
  pendingProjects: 0,
  projectCompletion: 0,
  totalRoadmaps: 0,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  progress: 0,
}

function DashboardPage() {
  const { user } = useAuth()

  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardStats = useCallback(async () => {
    if (!user) {
      setStats(initialStats)
      setError('')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    setStats(initialStats)

    try {
      const response = await API.get('/dashboard/stats')

      setStats({
        ...initialStats,
        ...response.data,
      })
    } catch (err) {
      setStats(initialStats)

      setError(
        err.response?.data?.message ||
          'Unable to load dashboard data. Please try again.'
      )

      console.error('Dashboard stats error:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.email])

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  const totalProjects = Number(
    stats.totalProjects ?? stats.projects ?? 0
  )

  const completedProjects = Number(
    stats.completedProjects ?? 0
  )

  const pendingProjects = Number(
    stats.pendingProjects ?? 0
  )

  const projectCompletion = Math.min(
    100,
    Math.max(0, Number(stats.projectCompletion) || 0)
  )

  return (
    <main className="dashboard-page">
      <div className="dashboard-welcome d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="app-heading">
            Welcome{user?.name ? `, ${user.name}` : ''} 👋
          </h2>

          <p className="app-description">
            Track your career readiness and build your skills.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary d-flex align-items-center gap-2"
          onClick={fetchDashboardStats}
          disabled={loading || !user}
        >
          <RefreshCw size={16} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {!user && (
        <div className="alert alert-info mt-3" role="status">
          Please log in to view your dashboard.
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center gap-3 mt-3"
          role="alert"
        >
          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={fetchDashboardStats}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      {user && loading && (
        <p className="text-secondary mt-3">
          Loading your dashboard...
        </p>
      )}

      <div className="row g-4 mt-2">
        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            title="Resume Score"
            value={stats.resumeScore}
            subtitle="Based on resume analysis"
            icon={FileText}
            color="blue"
          />
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            title="Skill Match"
            value={stats.skillMatch}
            subtitle="Based on job matching"
            icon={Target}
            color="purple"
          />
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            title="Skills to Learn"
            value={stats.skillsToLearn}
            subtitle="Skills identified as missing or partial"
            icon={BookOpen}
            color="green"
          />
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <SummaryCard
            title="Projects"
            value={totalProjects}
            subtitle={`${completedProjects} completed · ${pendingProjects} pending`}
            icon={BriefcaseBusiness}
            color="orange"
            progress={projectCompletion}
            progressLabel="Completion"
          />
        </div>
      </div>

      <section className="mt-4">
        <ProgressChart
          completedTasks={stats.completedTasks}
          pendingTasks={stats.pendingTasks}
        />
      </section>
    </main>
  )
}

export default DashboardPage

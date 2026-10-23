
import { useEffect, useState } from 'react'
import API from '../api/auth'


function ProgressPage() {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await API.get('/progress')
        setProgress(response.data)
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load your progress. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  if (loading) {
    return <div className="container py-4">Loading your progress...</div>
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-outline-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  const {
    completedTasks,
    totalTasks,
    completionPercentage,
    latestScore,
    previousScore,
    scoreChange,
    jobRole,
    scoreHistory = [],
  } = progress

  return (
    <div className="container-fluid py-3">
      <h2 className="mb-2">My Progress</h2>
      <p className="text-secondary">
        Track your completed learning tasks and resume analysis scores.
      </p>

      <div className="row g-3 mt-2">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5>Learning Completion</h5>
            <h2 className="my-3">{completionPercentage}%</h2>

            <div
              className="progress"
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="progress-bar"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <p className="text-secondary mt-3 mb-0">
              {completedTasks} of {totalTasks} roadmap tasks completed
            </p>

            {totalTasks === 0 && (
              <p className="small text-secondary mt-2 mb-0">
                Generate a career roadmap to start tracking your tasks.
              </p>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5>Latest Resume Match</h5>

            {latestScore == null ? (
              <p className="text-secondary mt-3 mb-0">
                No resume analysis available yet.
              </p>
            ) : (
              <>
                <h2 className="my-3">{latestScore}%</h2>
                <p className="text-secondary mb-1">
                  Target role: {jobRole}
                </p>

                {previousScore == null ? (
                  <p className="small text-secondary mb-0">
                    Analyze this role again to compare your scores.
                  </p>
                ) : (
                  <p className="mb-0">
                    Previous score: {previousScore}%
                    <br />
                    Change:{' '}
                    <strong>
                      {scoreChange > 0 ? '+' : ''}
                      {Number(scoreChange.toFixed(2))} percentage points
                    </strong>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mt-4">
        <h5 className="mb-3">Resume Score History</h5>

        {scoreHistory.length === 0 ? (
          <p className="text-secondary mb-0">
            Your analysis history will appear here.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Target Role</th>
                  <th>Match Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {scoreHistory.map((item, index) => (
                  <tr key={`${item.date}-${index}`}>
                    <td>{item.jobRole}</td>
                    <td>{item.score}%</td>
                    <td>
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : 'Not available'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressPage

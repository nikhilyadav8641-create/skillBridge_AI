import { Target } from 'lucide-react'

function MatchScore({ score = 0 }) {
  return (
    <div className="card p-4 h-100">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Target size={24} color="#6c63ff" />
        <h5 className="mb-0">Skill Match Score</h5>
      </div>

      <h2 className="fw-bold">{score}%</h2>

      <div
        className="progress"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="progress-bar"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      <p className="text-muted mt-3 mb-0">
        How well your skills match the selected job role.
      </p>
    </div>
  )
}

export default MatchScore
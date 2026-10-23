
import { TrendingUp } from 'lucide-react'
import './SummaryCard.css'

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  progress,
  progressLabel = 'Completion',
}) {
  const showProgress = progress !== undefined && progress !== null

  const progressValue = Math.min(
    100,
    Math.max(0, Number(progress) || 0)
  )

  return (
    <div className="summary-card">
      <div className={`summary-icon ${color}`}>
        {Icon && <Icon size={24} />}
      </div>

      <div className="summary-info">
        <p className="summary-title">{title}</p>

        <h3 className="summary-value">{value}</h3>

        <p className="summary-subtitle">
          {subtitle}
          <TrendingUp size={14} className="summary-trend" />
        </p>

        {showProgress && (
          <div className="summary-card-progress">
            <div className="summary-progress-header">
              <span>{progressLabel}</span>
              <span>{progressValue}%</span>
            </div>

            <div
              className="summary-progress-track"
              role="progressbar"
              aria-label={progressLabel}
              aria-valuenow={progressValue}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="summary-progress-fill"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SummaryCard
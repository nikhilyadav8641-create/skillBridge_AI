
import { useEffect, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

function ProjectMilestone({
  title,
  initialCompleted = false,
  onCompletionChange,
  disabled = false,
}) {
  const [completed, setCompleted] = useState(initialCompleted)

  useEffect(() => {
    setCompleted(initialCompleted)
  }, [initialCompleted])

  function toggleCompleted() {
    const next = !completed
    setCompleted(next)
    onCompletionChange?.(next)
  }

  return (
    <div className="d-flex align-items-center gap-2 mb-2">
      <button
        type="button"
        className="btn p-0 border-0"
        disabled={disabled}
        onClick={toggleCompleted}
        aria-label={
          completed ? 'Mark milestone incomplete' : 'Mark milestone complete'
        }
      >
        {completed ? (
          <CheckCircle2 size={19} color="green" />
        ) : (
          <Circle size={19} color="gray" />
        )}
      </button>

      <span className={completed ? 'text-decoration-line-through' : ''}>
        {title}
      </span>
    </div>
  )
}

export default ProjectMilestone

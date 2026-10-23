
import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  BookOpen,
  ExternalLink,
} from 'lucide-react'


import { getLearningResources } from '../../utils/learningResources.js'
import API from '../../api/auth'

function RoadmapTask({
  id,
  title,
  description,
  initialCompleted = false,
  onTaskUpdated,
}) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setCompleted(initialCompleted)
  }, [initialCompleted, id])

  const learningResources = getLearningResources(title, description)

  const handleToggle = async () => {
    if (!id || saving) return

    const nextCompleted = !completed

    setSaving(true)
    setError('')

    try {
      await API.patch(`/roadmap/tasks/${id}`, {
        completed: nextCompleted,
      })

      setCompleted(nextCompleted)

      if (onTaskUpdated) {
        await onTaskUpdated()
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not save task status. Please try again.'
      )

      console.error('Task update error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border rounded p-3 mb-3 bg-white">
      <div className="d-flex gap-3 align-items-start">
        <button
          type="button"
          className="btn p-0 border-0 flex-shrink-0"
          onClick={handleToggle}
          disabled={saving || !id}
          aria-label={
            completed ? 'Mark task incomplete' : 'Mark task complete'
          }
          title={completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {completed ? (
            <CheckCircle2 color="green" size={24} />
          ) : (
            <Circle color="gray" size={24} />
          )}
        </button>

        <div className="flex-grow-1">
          <h6
            className={`fw-semibold mb-2 ${
              completed ? 'text-decoration-line-through text-secondary' : ''
            }`}
          >
            {title}
          </h6>

          <p className="text-secondary mb-2">
            {description || 'Work on this skill to improve your career readiness.'}
          </p>

          <small
            className={
              completed
                ? 'text-success fw-semibold'
                : 'text-secondary'
            }
          >
            {saving
              ? 'Saving progress...'
              : completed
                ? 'Completed'
                : 'Pending'}
          </small>

          {error && (
            <p className="text-danger small mt-2 mb-0" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-top">
        <h6 className="fw-semibold mb-3">
          <BookOpen size={17} className="me-2" />
          Recommended Learning Resources
        </h6>

        {learningResources.map((resource) => (
          <div
            key={resource.url}
            className="d-flex justify-content-between align-items-center gap-3 border rounded p-2 mb-2"
          >
            <div className="flex-grow-1">
              <div className="fw-semibold small">
                {resource.name}
              </div>

              <small className="text-secondary">
                {resource.description}
              </small>
            </div>

            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm flex-shrink-0"
            >
              Start
              <ExternalLink size={13} className="ms-1" />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoadmapTask

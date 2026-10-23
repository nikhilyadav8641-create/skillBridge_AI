
import { useEffect, useState } from 'react';
import { Code2, Clock3, Gauge, Lightbulb } from 'lucide-react';

import API from '../../api/auth';
import ProjectMilestone from './ProjectMilestone.jsx';

function ProjectCard({
  id,
  title,
  description,
  milestones = [],
  techStack = [],
  requiredSkills = [],
  difficulty,
  duration,
}) {
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMilestone, setSavingMilestone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchProgress() {
      try {
        const response = await API.get(`/projects/${id}/progress`);

        if (active) {
          setCompletedMilestones(
            response.data
              .filter((item) => item.completed)
              .map((item) => item.milestoneTitle)
          );
        }
      } catch (err) {
        if (active) {
          setError('Unable to load saved progress.');
          console.error(err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProgress();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleMilestoneChange(milestone, completed) {
    setError('');
    setSavingMilestone(milestone);

    try {
      await API.put(`/projects/${id}/progress`, {
        milestoneTitle: milestone,
        completed,
      });

      setCompletedMilestones((current) => {
        if (completed && !current.includes(milestone)) {
          return [...current, milestone];
        }

        if (!completed) {
          return current.filter((item) => item !== milestone);
        }

        return current;
      });
    } catch (err) {
      setError('Could not save progress. Please try again.');
      console.error(err);
    } finally {
      setSavingMilestone('');
    }
  }

  const progress = milestones.length
    ? Math.round(
        (completedMilestones.length / milestones.length) * 100
      )
    : 0;

  return (
    <div className="card p-4 h-100 shadow-sm">
      <h5 className="fw-bold">{title}</h5>

      <p className="text-secondary">{description}</p>

      <div className="d-flex flex-wrap gap-3 mb-3">
        {difficulty && (
          <span className="badge text-bg-primary">
            <Gauge size={14} className="me-1" />
            {difficulty}
          </span>
        )}

        {duration && (
          <span className="badge text-bg-light">
            <Clock3 size={14} className="me-1" />
            {duration}
          </span>
        )}
      </div>

      <h6>
        <Code2 size={17} className="me-2" />
        Tech Stack
      </h6>

      {techStack.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {techStack.map((technology) => (
            <span
              key={technology}
              className="badge rounded-pill text-bg-light border"
            >
              {technology}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-secondary small">
          Tech stack not available.
        </p>
      )}

      <h6>
        <Lightbulb size={17} className="me-2" />
        Skills to Develop
      </h6>

      {requiredSkills.length > 0 ? (
        <ul className="small">
          {requiredSkills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      ) : (
        <p className="text-secondary small">
          No additional skills listed.
        </p>
      )}

      <hr />

      <h6>Project Milestones</h6>

      {loading && <p>Loading saved progress...</p>}

      {error && <p className="text-danger">{error}</p>}

      {milestones.map((milestone) => (
        <ProjectMilestone
          key={milestone}
          title={milestone}
          initialCompleted={completedMilestones.includes(milestone)}
          disabled={loading || savingMilestone === milestone}
          onCompletionChange={(completed) =>
            handleMilestoneChange(milestone, completed)
          }
        />
      ))}

      <div
        className="progress mt-3"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      <small className="mt-2">
        {completedMilestones.length} of {milestones.length} milestones
        completed ({progress}%)
      </small>
    </div>
  );
}

export default ProjectCard;

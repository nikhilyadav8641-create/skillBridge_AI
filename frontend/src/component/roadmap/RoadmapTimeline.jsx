import RoadmapTask from "./RoadmapTask.jsx";

function RoadmapTimeline({ tasks = [], onTaskUpdated }) {
  return (
    <section className="card border-0 shadow-sm p-4 p-md-5">
      <h4 className="mb-2 fw-semibold">Your Learning Roadmap</h4>

      <p className="text-secondary mb-4">
        Follow these steps to build your career skills.
      </p>

      {tasks.length === 0 ? (
        <div className="alert alert-info mb-0">
          No learning steps available. Generate a new roadmap to get started.
        </div>
      ) : (
        <div className="roadmap-timeline">
          {tasks.map((task, index) => (
            <div
              key={task.id ?? `${task.stepNumber ?? index + 1}-${task.title}`}
              className="mb-4"
            >
              <small className="text-primary fw-semibold">
                Step {task.stepNumber ?? index + 1}
              </small>

              <RoadmapTask
                id={task.id}
                title={task.title}
                description={task.description}
                initialCompleted={task.completed ?? false}
                onTaskUpdated={onTaskUpdated}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RoadmapTimeline;

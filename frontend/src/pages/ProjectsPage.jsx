
import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles, Trash2, FolderOpen } from "lucide-react";

import API from "../api/auth";
import ProjectCard from "../component/projects/ProjectCard.jsx";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProjects = useCallback(async () => {
    const response = await API.get("/projects");

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid projects response from backend.");
    }

    setProjects(response.data);
  }, []);

  useEffect(() => {
    async function loadProjects() {
      try {
        setError("");
        await fetchProjects();
      } catch (err) {
        console.error("Loading projects failed:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load saved projects."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [fetchProjects]);

  const generations = useMemo(() => {
    const groups = new Map();

    projects.forEach((project) => {
      const generationId = project.generationId;
      const key = generationId
        ? `generation-${generationId}`
        : `project-${project.id}`;

      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          generationId: generationId || null,
          jobRole: project.jobRole || project.targetJobRole || "",
          createdAt: project.createdAt || null,
          projects: [],
        });
      }

      const group = groups.get(key);

      if (
        !group.jobRole &&
        (project.jobRole || project.targetJobRole)
      ) {
        group.jobRole = project.jobRole || project.targetJobRole;
      }

      if (
        project.createdAt &&
        (!group.createdAt ||
          new Date(project.createdAt).getTime() >
            new Date(group.createdAt).getTime())
      ) {
        group.createdAt = project.createdAt;
      }

      group.projects.push(project);
    });

    return Array.from(groups.values()).sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  }, [projects]);

  async function handleGenerateProjects(event) {
    event.preventDefault();

    const role = jobRole.trim();

    if (!role) {
      setError("Please enter your target job role.");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      await API.post("/projects/recommendations/generate", {
        jobRole: role,
      });

      await fetchProjects();

      setSuccess(`Projects for ${role} have been generated and saved.`);
      setJobRole("");
    } catch (err) {
      console.error("Project generation failed:", err);
      setError(
        err.response?.data?.message ||
          "Unable to generate projects. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteProject(project) {
    if (!window.confirm(`Delete "${project.title}" permanently?`)) return;

    setDeletingId(`project-${project.id}`);
    setError("");
    setSuccess("");

    try {
      await API.delete(`/projects/${project.id}`);

      setProjects((current) =>
        current.filter((item) => item.id !== project.id)
      );

      setSuccess(`"${project.title}" was deleted successfully.`);
    } catch (err) {
      console.error("Project deletion failed:", err);
      setError(
        err.response?.data?.message || "Unable to delete this project."
      );
    } finally {
      setDeletingId("");
    }
  }

  async function handleDeleteGeneration(generation) {
    if (
      !window.confirm(
        `Delete all ${generation.projects.length} project(s) in this group permanently?`
      )
    ) {
      return;
    }

    setDeletingId(`group-${generation.id}`);
    setError("");
    setSuccess("");

    try {
      if (generation.generationId) {
        await API.delete(
          `/projects/generation/${encodeURIComponent(
            generation.generationId
          )}`
        );
      } else {
        for (const project of generation.projects) {
          await API.delete(`/projects/${project.id}`);
        }
      }

      const deletedIds = new Set(
        generation.projects.map((project) => project.id)
      );

      setProjects((current) =>
        current.filter((project) => !deletedIds.has(project.id))
      );

      setSuccess(
        `${generation.jobRole || "Project group"} was deleted successfully.`
      );
    } catch (err) {
      console.error("Generation deletion failed:", err);

      try {
        await fetchProjects();
      } catch (refreshError) {
        console.error("Refreshing projects failed:", refreshError);
      }

      setError(
        err.response?.data?.message ||
          "Unable to delete the complete group."
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="container-fluid py-3">
      <h2 className="mb-2">AI Project Recommendations</h2>

      <p className="text-secondary mb-4">
        Build practical projects based on your resume, skill gaps, and career
        goal. Your saved projects remain available after refreshing the page.
      </p>

      <form className="card p-4 mb-4" onSubmit={handleGenerateProjects}>
        <label htmlFor="jobRole" className="form-label fw-semibold">
          Target Job Role
        </label>

        <input
          id="jobRole"
          type="text"
          className="form-control mb-3"
          placeholder="e.g. Machine Learning Engineer"
          value={jobRole}
          onChange={(event) => setJobRole(event.target.value)}
          maxLength={150}
          required
          disabled={generating || Boolean(deletingId)}
        />

        <div>
          <button
            type="submit"
            className="btn btn-primary d-flex align-items-center gap-2"
            disabled={generating || Boolean(deletingId)}
          >
            <Sparkles size={17} />
            {generating ? "Generating projects..." : "Generate AI Projects"}
          </button>
        </div>

        <small className="text-secondary mt-2">
          First analyze your resume for the same job role.
        </small>
      </form>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {loading && <p>Loading saved projects...</p>}

      {!loading && projects.length === 0 && !error && (
        <div className="alert alert-info">
          No saved projects yet. Generate your first set above.
        </div>
      )}

      {!loading &&
        generations.map((generation) => (
          <section key={generation.id} className="mb-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div>
                <h4 className="mb-1 d-flex align-items-center gap-2">
                  <FolderOpen size={22} />
                  {generation.jobRole ||
                    `Job role not saved (${generation.projects.length} projects)`}
                </h4>

                <small className="text-secondary">
                  {generation.createdAt
                    ? new Date(generation.createdAt).toLocaleString()
                    : "Creation date unavailable"}
                  {" · "}
                  {generation.projects.length} project(s)
                </small>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
                onClick={() => handleDeleteGeneration(generation)}
                disabled={Boolean(deletingId) || generating}
              >
                <Trash2 size={16} />
                {deletingId === `group-${generation.id}`
                  ? "Deleting..."
                  : "Delete Group"}
              </button>
            </div>

            <div className="row g-4">
              {generation.projects.map((project) => (
                <div className="col-12 col-lg-6" key={project.id}>
                  <div className="card h-100 p-3">
                    <ProjectCard
                      id={project.id}
                      title={project.title}
                      description={project.description}
                      milestones={project.milestones ?? []}
                      techStack={project.techStack ?? []}
                      requiredSkills={project.requiredSkills ?? []}
                      difficulty={project.difficulty}
                      duration={project.duration}
                    />

                    <div className="mt-3 pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
                        onClick={() => handleDeleteProject(project)}
                        disabled={Boolean(deletingId) || generating}
                      >
                        <Trash2 size={16} />
                        {deletingId === `project-${project.id}`
                          ? "Deleting..."
                          : "Delete Project"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
    </main>
  );
}

export default ProjectsPage;
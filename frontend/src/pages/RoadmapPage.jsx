import { useEffect, useState } from "react";
import {
  Sparkles,
  Target,
  BookOpen,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock3,
  History,
  Trash2,
  Plus,
  CalendarDays,
} from "lucide-react";

import RoadmapTimeline from "../component/roadmap/RoadmapTimeline";
import "./RoadmapPage.css";

const API_URL = "http://localhost:8080/api/roadmap";

function RoadmapPage() {
  const [jobRole, setJobRole] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

  const getToken = () => localStorage.getItem("token");

  async function apiRequest(url, options = {}) {
    const token = getToken();

    if (!token) {
      throw new Error("Please log in again.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        if (response.ok) {
          data = text;
        } else {
          throw new Error(`Request failed (${response.status}).`);
        }
      }
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          (typeof data === "string" ? data : null) ||
          `Request failed (${response.status}).`
      );
    }

    return data;
  }

  // Load the user's roadmap history.
  async function loadHistory() {
    const data = await apiRequest(`${API_URL}/history`);

    if (!Array.isArray(data)) {
      throw new Error("The server returned invalid roadmap history.");
    }

    setHistory(data);
    return data;
  }

  // Open a particular roadmap by its ID.
  async function openRoadmap(roadmapId) {
    setError("");

    try {
      const data = await apiRequest(`${API_URL}/${roadmapId}`);

      if (!data || !Array.isArray(data.tasks)) {
        throw new Error("Could not load this roadmap.");
      }

      setRoadmap(data);
      setJobRole(data.jobRole || "");
      setShowGenerator(false);
    } catch (err) {
      setError(err.message || "Could not open this roadmap.");
    }
  }

  // Load history and the latest roadmap when the page opens.
  async function loadInitialData() {
    setLoading(true);
    setError("");

    try {
      const items = await loadHistory();

      if (items.length > 0) {
        const latest = items[0];

        const data = await apiRequest(`${API_URL}/${latest.id}`);

        setRoadmap(data);
        setJobRole(data.jobRole || "Java Backend Developer");
      } else {
        setRoadmap(null);
      }
    } catch (err) {
      setError(err.message || "Could not load your roadmaps.");
    } finally {
      setLoading(false);
    }
  }

  // Refresh the currently selected roadmap after a task update.
  async function refreshSelectedRoadmap() {
    if (!roadmap?.id) {
      return;
    }

    const selectedId = roadmap.id;

    try {
      const [updatedRoadmap] = await Promise.all([
        apiRequest(`${API_URL}/${selectedId}`),
        loadHistory(),
      ]);

      setRoadmap(updatedRoadmap);
    } catch (err) {
      setError(err.message || "Could not refresh the roadmap.");
    }
  }

  async function generateRoadmap() {
    const role = jobRole.trim();

    if (!role) {
      setError("Please enter a target job role.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const data = await apiRequest(`${API_URL}/generate`, {
        method: "POST",
        body: JSON.stringify({ jobRole: role }),
      });

      if (!data || !Array.isArray(data.tasks)) {
        throw new Error("The server did not return valid roadmap tasks.");
      }

      setRoadmap(data);
      setJobRole(data.jobRole || role);
      setShowGenerator(false);

      await loadHistory();
    } catch (err) {
      setError(err.message || "Could not generate roadmap.");
    } finally {
      setGenerating(false);
    }
  }

  async function deleteRoadmap(roadmapId) {
    const item = history.find(
      (entry) => String(entry.id) === String(roadmapId)
    );

    const role = item?.jobRole || "this roadmap";

    const confirmed = window.confirm(
      `Delete the roadmap for "${role}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(roadmapId);
    setError("");

    try {
      await apiRequest(`${API_URL}/${roadmapId}`, {
        method: "DELETE",
      });

      const remainingHistory = await loadHistory();

      // If the deleted roadmap was open, show the next available roadmap.
      if (String(roadmap?.id) === String(roadmapId)) {
        if (remainingHistory.length > 0) {
          const nextRoadmap = await apiRequest(
            `${API_URL}/${remainingHistory[0].id}`
          );

          setRoadmap(nextRoadmap);
          setJobRole(nextRoadmap.jobRole || "");
        } else {
          setRoadmap(null);
          setShowGenerator(true);
        }
      }
    } catch (err) {
      setError(err.message || "Could not delete the roadmap.");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  const tasks = roadmap?.tasks || [];
  const completedTasks = tasks.filter((task) => task.completed).length;

  const progress =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="roadmap-loading">
        <div className="roadmap-loading-icon">
          <Sparkles size={25} />
        </div>
        <h5>Preparing your workspace</h5>
        <p>Loading your career roadmap...</p>
      </div>
    );
  }

  return (
    <main className="roadmap-page">
      <div className="roadmap-topline">
        <div>
          <div className="roadmap-eyebrow">
            <Sparkles size={15} /> SKILLBRIDGE AI
          </div>

          <h1>Your Career Roadmap</h1>

          <p className="roadmap-subtitle">
            Turn your career goals into clear, actionable learning steps.
          </p>
        </div>

        <div className="roadmap-ai-badge">
          <span className="roadmap-status-dot" />
          AI-powered learning
        </div>
      </div>

      {error && (
        <div className="roadmap-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

     

      {/* Generator */}
      {(showGenerator || !roadmap) && (
        <section className="roadmap-hero">
          <div className="roadmap-hero-copy">
            <div className="roadmap-icon-box">
              <Target size={23} />
            </div>

            <span className="roadmap-overline">YOUR NEXT CHAPTER</span>

            <h2>Build skills. Reach your goals.</h2>

            <p>
              Choose your target role and let AI organize your learning journey.
            </p>
          </div>

          <div className="roadmap-form">
            <label htmlFor="jobRole">
              What role are you aiming for?
            </label>

            <div className="roadmap-input-wrap">
              <Target size={18} />

              <input
                id="jobRole"
                value={jobRole}
                onChange={(event) => setJobRole(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !generating) {
                    generateRoadmap();
                  }
                }}
                placeholder="e.g. React Developer"
                maxLength={150}
                disabled={generating}
              />
            </div>

            <button
              className="roadmap-generate-btn"
              onClick={generateRoadmap}
              disabled={generating || !jobRole.trim()}
            >
              {generating ? (
                <>
                  <span className="roadmap-spinner" />
                  Creating your plan...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate Roadmap
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <p className="roadmap-form-hint">
              <span className="roadmap-status-dot" />
              Your personalized learning journey starts here
            </p>
          </div>
        </section>
      )}
       {/* Roadmap history */}
      <section className="roadmap-history-section">
        <div className="roadmap-history-heading">
          <div>
            <span className="roadmap-overline">YOUR SAVED PLANS</span>
            <h2>
              <History size={21} />
              Roadmap History
            </h2>
            <p>Open an earlier roadmap or delete one you no longer need.</p>
          </div>

          <button
            className="roadmap-new-btn"
            onClick={() => {
              setError("");
              setJobRole("");
              setShowGenerator(true);
            }}
          >
            <Plus size={17} />
            New Roadmap
          </button>
        </div>

        {history.length === 0 ? (
          <div className="roadmap-history-empty">
            <BookOpen size={23} />
            <span>No saved roadmaps yet. Generate your first one below.</span>
          </div>
        ) : (
          <div className="roadmap-history-list">
            {history.map((item) => {
              const selected =
                String(roadmap?.id) === String(item.id);

              const itemTasks = item.tasks || [];
              const itemCompleted = itemTasks.filter(
                (task) => task.completed
              ).length;

              const itemProgress =
                itemTasks.length > 0
                  ? Math.round(
                      (itemCompleted / itemTasks.length) * 100
                    )
                  : 0;

              return (
                <div
                  key={item.id}
                  className={`roadmap-history-item ${
                    selected ? "selected" : ""
                  }`}
                >
                  <button
                    className="roadmap-history-open"
                    onClick={() => openRoadmap(item.id)}
                    disabled={deletingId !== null}
                    aria-current={selected ? "true" : undefined}
                  >
                    <div className="roadmap-history-icon">
                      <Target size={20} />
                    </div>

                    <div className="roadmap-history-info">
                      <strong>{item.jobRole || "Career Roadmap"}</strong>

                      <span>
                        <CalendarDays size={13} />
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "Saved roadmap"}
                      </span>

                      <div className="roadmap-history-meta">
                        <span>{itemTasks.length} steps</span>
                        <span>{itemProgress}% complete</span>
                      </div>
                    </div>

                    <ArrowRight
                      className="roadmap-history-arrow"
                      size={18}
                    />
                  </button>

                  <button
                    className="roadmap-delete-btn"
                    onClick={() => deleteRoadmap(item.id)}
                    disabled={deletingId !== null}
                    title="Delete roadmap"
                    aria-label={`Delete roadmap for ${item.jobRole}`}
                  >
                    {deletingId === item.id ? (
                      <span className="roadmap-spinner" />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {generating && (
        <div className="roadmap-generating">
          <div className="roadmap-generating-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <strong>Your roadmap is taking shape</strong>
            <p>
              AI is organizing practical learning steps for your target role.
            </p>
          </div>
        </div>
      )}

      {!roadmap && !generating && !error && (
        <section className="roadmap-empty">
          <div className="roadmap-empty-icon">
            <BookOpen size={30} />
          </div>

          <h3>Your journey starts here</h3>

          <p>
            Enter a target role above to generate your first learning roadmap.
          </p>
        </section>
      )}

      {/* Selected roadmap */}
      {roadmap && (
        <>
          <section className="roadmap-selected-banner">
            <div>
              <span className="roadmap-overline">CURRENTLY VIEWING</span>
              <h2>{roadmap.jobRole || jobRole}</h2>
              <p>
                Roadmap ID: {roadmap.id}
                {roadmap.createdAt &&
                  ` · ${new Date(roadmap.createdAt).toLocaleDateString()}`}
              </p>
            </div>

            <button
              className="roadmap-create-another-btn"
              onClick={() => {
                setJobRole("");
                setShowGenerator((current) => !current);
              }}
            >
              <Plus size={16} />
              Create Another
            </button>
          </section>

          <section className="roadmap-stats">
            <div className="roadmap-stat-card">
              <div className="roadmap-stat-icon purple">
                <BookOpen size={21} />
              </div>
              <div>
                <span>Total learning steps</span>
                <strong>{tasks.length}</strong>
              </div>
            </div>

            <div className="roadmap-stat-card">
              <div className="roadmap-stat-icon green">
                <CheckCircle2 size={21} />
              </div>
              <div>
                <span>Steps completed</span>
                <strong>{completedTasks}</strong>
              </div>
            </div>

            <div className="roadmap-stat-card">
              <div className="roadmap-stat-icon blue">
                <Target size={21} />
              </div>
              <div>
                <span>Overall progress</span>
                <strong>{progress}%</strong>
              </div>
            </div>
          </section>

          <section className="roadmap-progress-card">
            <div className="roadmap-progress-heading">
              <div>
                <span className="roadmap-overline">YOUR PROGRESS</span>
                <h3>Every step moves you forward.</h3>
              </div>

              <strong>{progress}%</strong>
            </div>

            <div
              className="roadmap-progress-track"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Roadmap completion"
            >
              <div
                className="roadmap-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p>
              {completedTasks === tasks.length && tasks.length > 0
                ? "Amazing work! You have completed every step."
                : `${
                    tasks.length - completedTasks
                  } steps left in your learning journey.`}
            </p>
          </section>

          <div className="roadmap-section-heading">
            <div>
              <span className="roadmap-overline">THE GAME PLAN</span>
              <h2>Your learning journey</h2>
              <p>
                Target role: <strong>{roadmap.jobRole || jobRole}</strong>
              </p>
            </div>

            <div className="roadmap-steps-pill">
              <Clock3 size={15} />
              {tasks.length} steps
            </div>
          </div>

          {tasks.length > 0 ? (
            <div className="roadmap-timeline-shell">
              <RoadmapTimeline
                tasks={tasks}
                onTaskUpdated={refreshSelectedRoadmap}
              />
            </div>
          ) : (
            <div className="roadmap-empty">
              <BookOpen size={30} />
              <h3>No learning steps found</h3>
              <p>Generate the roadmap again to create your learning plan.</p>
            </div>
          )}

          <div className="roadmap-bottom-note">
            <RefreshCw size={16} />
            <span>
              Keep going at your own pace. Consistency matters more than speed.
            </span>
          </div>
        </>
      )}
    </main>
  );
}

export default RoadmapPage;

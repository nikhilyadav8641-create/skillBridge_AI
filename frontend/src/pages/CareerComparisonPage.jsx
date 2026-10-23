
import { useState } from "react";

import Button from "../component/common/Button.jsx";
import ErrorMessage from "../component/common/ErrorMessage.jsx";
import AnalysisLoader from "../component/resume/AnalysisLoader.jsx";
import ResumeUpload from "../component/resume/ResumeUpload.jsx";

const CAREER_ROLES = [
  "Product Manager",
  "Business Analyst",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "Management Consultant",
  "Analytics Manager",
  "Data Scientist",
  "Frontend Developer",
  "Backend Developer",
  "Machine Learning Engineer",
  "Full Stack Developer",
];

const INITIAL_VISIBLE_ROLES = 6;
const MAX_ROLES = 3;

export default function CareerComparisonPage() {
  const [resume, setResume] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showAllRoles, setShowAllRoles] = useState(false);

  const [customRole, setCustomRole] = useState("");
  const [showCustomRoleInput, setShowCustomRoleInput] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comparisons, setComparisons] = useState([]);

  function toggleRole(role) {
    setError("");

    setSelectedRoles((current) => {
      if (current.includes(role)) {
        return current.filter((item) => item !== role);
      }

      if (current.length >= MAX_ROLES) {
        setError("You can compare a maximum of 3 career paths.");
        return current;
      }

      return [...current, role];
    });

    setComparisons([]);
  }

  function handleAddCustomRole() {
    const role = customRole.trim();

    setError("");

    if (!role) {
      setError("Please enter a job role.");
      return;
    }

    if (selectedRoles.length >= MAX_ROLES) {
      setError("You can compare a maximum of 3 career paths.");
      return;
    }

    const alreadyExists = [
      ...CAREER_ROLES,
      ...selectedRoles,
    ].some((item) => item.toLowerCase() === role.toLowerCase());

    if (alreadyExists) {
      setError("This career role already exists or is selected.");
      return;
    }

    setSelectedRoles((current) => [...current, role]);
    setCustomRole("");
    setShowCustomRoleInput(false);
    setComparisons([]);
  }

  async function handleCompare() {
    setError("");
    setComparisons([]);

    if (!resume) {
      setError("Please upload your resume first.");
      return;
    }

    if (selectedRoles.length < 2) {
      setError("Select at least 2 career paths.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resume);

      selectedRoles.forEach((role) => {
        formData.append("jobRoles", role);
      });

      const response = await fetch(
        "http://localhost:8080/api/analysis/compare",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const text = await response.text();
      let data = {};

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Invalid backend response (HTTP ${response.status}).`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Career comparison failed (HTTP ${response.status}).`
        );
      }

      const results = Array.isArray(data)
        ? data
        : data.comparisons;

      if (!Array.isArray(results)) {
        throw new Error(
          "Invalid career comparison response from backend."
        );
      }

      const normalizedResults = results.map((item) => ({
        jobRole: item.jobRole,
        score: item.result?.score ?? item.score ?? 0,
        evidence: item.result?.evidence ?? item.evidence ?? [],
        partial: item.result?.partial ?? item.partial ?? [],
        gaps: item.result?.gaps ?? item.gaps ?? [],
      }));

      const returnedRoles = new Set(
        normalizedResults.map((item) => item.jobRole)
      );

      const missingRoles = selectedRoles.filter(
        (role) => !returnedRoles.has(role)
      );

      if (missingRoles.length > 0) {
        throw new Error(
          `Missing results for: ${missingRoles.join(", ")}`
        );
      }

      setComparisons(normalizedResults);
    } catch (err) {
      console.error("Career comparison failed:", err);
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  const visibleRoles = showAllRoles
    ? CAREER_ROLES
    : CAREER_ROLES.slice(0, INITIAL_VISIBLE_ROLES);

  return (
    <div className="container-fluid py-3">
      <h2>Career Path Comparison</h2>

      <p className="text-secondary">
        Compare your resume against different career paths using
        role-specific skill analysis.
      </p>

      {/* Resume Upload */}
      <div className="card p-4 mb-4">
        <h4>1. Upload your resume</h4>

        <ResumeUpload
          onFileSelect={(file) => {
            setResume(file);
            setComparisons([]);
            setError("");
          }}
        />
      </div>

      {/* Career Role Selection */}
      <div className="card p-4 mb-4">
        <h4>2. Select career paths</h4>

        <p className="text-secondary">
          Select between 2 and 3 roles.
        </p>

        <div className="row g-3">
          {visibleRoles.map((role) => {
            const selected = selectedRoles.includes(role);

            return (
              <div className="col-12 col-md-6 col-xl-4" key={role}>
                <button
                  type="button"
                  className={`btn w-100 text-start p-3 ${
                    selected
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  aria-pressed={selected}
                  disabled={
                    loading ||
                    (!selected && selectedRoles.length >= MAX_ROLES)
                  }
                  onClick={() => toggleRole(role)}
                >
                  <strong>{role}</strong>

                  <div className="small mt-1">
                    {selected ? "Selected" : "Click to select"}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Show More / Less */}
        {CAREER_ROLES.length > INITIAL_VISIBLE_ROLES && (
          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowAllRoles((current) => !current)}
              disabled={loading}
            >
              {showAllRoles
                ? "Show fewer roles ▲"
                : "Show more roles ▼"}
            </button>
          </div>
        )}

        {/* Add Custom Role */}
        <div className="mt-4">
          {!showCustomRoleInput ? (
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                setShowCustomRoleInput(true);
                setError("");
              }}
              disabled={
                loading || selectedRoles.length >= MAX_ROLES
              }
            >
              + Add Custom Role
            </button>
          ) : (
            <div className="border rounded p-3">
              <label
                htmlFor="customRole"
                className="form-label fw-semibold"
              >
                Enter your career role
              </label>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <input
                  id="customRole"
                  type="text"
                  className="form-control"
                  placeholder="e.g. DevOps Engineer"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomRole();
                    }
                  }}
                  maxLength={100}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddCustomRole}
                  disabled={loading}
                >
                  Add Role
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowCustomRoleInput(false);
                    setCustomRole("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Roles */}
        {selectedRoles.length > 0 && (
          <div className="mt-4">
            <h5>Selected Career Paths ({selectedRoles.length}/3)</h5>

            <div className="d-flex flex-wrap gap-2">
              {selectedRoles.map((role) => (
                <span
                  key={role}
                  className="badge text-bg-primary p-2 d-inline-flex align-items-center"
                >
                  {role}

                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    aria-label={`Remove ${role}`}
                    onClick={() => toggleRole(role)}
                    disabled={loading}
                  />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Compare Button */}
        <div className="mt-4">
          <Button onClick={handleCompare} disabled={loading}>
            {loading ? "Comparing..." : "Compare Career Paths"}
          </Button>
        </div>

        {loading && (
          <div className="mt-3">
            <AnalysisLoader
              message="Analyzing your resume against each selected career path..."
            />
          </div>
        )}

        {error && (
          <div className="mt-3">
            <ErrorMessage message={error} />
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisons.length > 0 && (
        <section className="mt-4">
          <h3>Comparison Results</h3>

          <div className="row g-4">
            {comparisons.map((item) => (
              <div
                className="col-12 col-lg-6 col-xl-4"
                key={item.jobRole}
              >
                <div className="card h-100 p-4">
                  <h4>{item.jobRole}</h4>

                  <div className="my-3">
                    <div className="d-flex justify-content-between">
                      <span>Resume match</span>
                      <strong>{item.score}%</strong>
                    </div>

                    <div
                      className="progress mt-2"
                      role="progressbar"
                      aria-label={`${item.jobRole} match score`}
                      aria-valuenow={item.score}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div
                        className="progress-bar"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>

                  <p>
                    <strong>Matched skills:</strong>{" "}
                    {item.evidence.length}
                  </p>

                  <p>
                    <strong>Partial skills:</strong>{" "}
                    {item.partial.length}
                  </p>

                  <p>
                    <strong>Missing skills:</strong>{" "}
                    {item.gaps.length}
                  </p>

                  <hr />

                  <h5>Missing skills</h5>

                  {item.gaps.length > 0 ? (
                    <ul className="mb-0">
                      {item.gaps.map((gap, index) => (
                        <li key={`${gap.skill}-${index}`}>
                          <strong>{gap.skill}</strong>

                          {gap.suggestion && (
                            <p className="small text-secondary">
                              {gap.suggestion}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-secondary">
                      No missing skills were identified.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

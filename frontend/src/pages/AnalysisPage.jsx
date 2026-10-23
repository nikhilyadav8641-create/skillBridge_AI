
import { useState } from "react";

import Button from "../component/common/Button.jsx";
import ErrorMessage from "../component/common/ErrorMessage.jsx";
import AnalysisLoader from "../component/resume/AnalysisLoader.jsx";
import ResumeUpload from "../component/resume/ResumeUpload.jsx";
import JobRoleSelector from "../component/resume/JobRoleSelector.jsx";

import MatchScore from "../component/analysis/MatchScore.jsx";
import SkillEvidence from "../component/analysis/SkillEvidence.jsx";
import SkillGapList from "../component/analysis/SkillGapList.jsx";

export default function AnalysisPage() {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleAnalyze() {
    setError("");
    setResult(null);

    if (!resume) {
      setError("Please upload your resume first.");
      return;
    }

    if (!jobRole.trim()) {
      setError("Please select or enter a target job role.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in again to analyze your resume.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jobRole", jobRole.trim());

      const response = await fetch(
        "http://localhost:8080/api/analysis/analyze",
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
        if (response.status === 401) {
          throw new Error("Your session expired. Please log in again.");
        }

        throw new Error(
          data.message ||
          data.error ||
          `Analysis failed (HTTP ${response.status}).`
        );
      }

      if (!text.trim()) {
        throw new Error("The backend returned an empty response.");
      }

      const score = Number(data.score);

      if (
        !Number.isFinite(score) ||
        score < 0 ||
        score > 100 ||
        !Array.isArray(data.evidence) ||
        !Array.isArray(data.partial) ||
        !Array.isArray(data.gaps)
      ) {
        throw new Error(
          "Unexpected response. Check AnalysisResponse.java."
        );
      }

      setResult({
        score,
        evidence: data.evidence,
        partial: data.partial,
        gaps: data.gaps,
      });
    } catch (err) {
      console.error("Resume analysis failed:", err);
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Resume Analysis</h2>

      <p className="text-secondary">
        Upload your resume and choose a target role. AI evaluates
        matched, partially demonstrated, and missing skills using
        evidence from your resume.
      </p>

      <div className="resume-analysis-card">
        <ResumeUpload
          onFileSelect={(file) => {
            setResume(file);
            setResult(null);
            setError("");
          }}
        />

        <JobRoleSelector
          jobRole={jobRole}
          setJobRole={(role) => {
            setJobRole(role);
            setResult(null);
            setError("");
          }}
        />

        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </Button>

        {loading && (
          <AnalysisLoader
            message="AI is evaluating job requirements and resume evidence..."
          />
        )}

        {error && (
          <div className="mt-3">
            <ErrorMessage message={error} />
          </div>
        )}
      </div>

      {result && (
        <section className="mt-4">
          <h3>Analysis Results</h3>

          <p className="text-secondary">
            Target role: {jobRole}
          </p>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <MatchScore score={result.score} />
            </div>

            <div className="col-12 col-lg-6">
              <SkillEvidence skills={result.evidence} />
            </div>

            <div className="col-12">
              <div className="d-flex align-items-center gap-2 mb-3">
                <h4 className="mb-0">Partially Demonstrated Skills</h4>
                <span className="badge text-bg-warning">
                  {result.partial.length}
                </span>
              </div>

              {result.partial.length === 0 ? (
                <div className="card p-3 text-secondary">
                  No partially demonstrated skills were identified.
                </div>
              ) : (
                <div className="card p-3">
                  {result.partial.map((item, index) => (
                    <div
                      key={`${item.skill}-${index}`}
                      className="py-3 border-bottom"
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <strong>{item.skill}</strong>

                        <div className="d-flex gap-2">
                          <span className="badge text-bg-warning">
                            Partial
                          </span>
                          <span className="badge text-bg-secondary">
                            {item.priority || "Medium"} priority
                          </span>
                        </div>
                      </div>

                      {item.evidence && (
                        <p className="small text-secondary mt-2 mb-1">
                          Evidence: {item.evidence}
                        </p>
                      )}

                      <p className="mb-0 mt-2">
                        {item.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-12">
              <SkillGapList skills={result.gaps} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

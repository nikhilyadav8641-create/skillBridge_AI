
import "./JobRoleSelector.css";

const suggestedRoles = [
  "Product Manager",
  "Business Analyst",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "DevOps Engineer",
  "Management Consultant",
  "Analytics Manager"
];

export default function JobRoleSelector({
  jobRole,
  setJobRole
}) {
  return (
    <div className="job-role-selector mb-3">
      <label htmlFor="jobRole" className="form-label">
        Target Job Role
      </label>

      <input
        id="jobRole"
        className="form-control"
        type="text"
        list="suggested-job-roles"
        value={jobRole}
        onChange={(event) => setJobRole(event.target.value)}
        placeholder="e.g. Cybersecurity Analyst"
        maxLength={120}
        required
      />

      <datalist id="suggested-job-roles">
        {suggestedRoles.map((role) => (
          <option key={role} value={role} />
        ))}
      </datalist>

      <small className="text-muted">
        Select a suggestion or enter any job title.
      </small>
    </div>
  );
}

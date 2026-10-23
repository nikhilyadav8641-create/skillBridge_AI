
import { BookOpen, AlertCircle } from "lucide-react";

function SkillGapList({ skills = [] }) {
  const validSkills = Array.isArray(skills)
    ? skills.filter(
        (item) =>
          item &&
          typeof item.skill === "string" &&
          item.skill.trim() !== ""
      )
    : [];

  return (
    <div className="card p-4 h-100">
      <div className="d-flex align-items-center gap-2 mb-3">
        <BookOpen size={22} color="#dc2626" />

        <h5 className="mb-0">Missing Skills</h5>

        <span className="badge text-bg-danger ms-auto">
          {validSkills.length}
        </span>
      </div>

      {validSkills.length === 0 ? (
        <div className="text-muted">
          <AlertCircle size={18} className="me-2" />
          No missing skills were identified for this analysis.
        </div>
      ) : (
        <ul className="list-group list-group-flush">
          {validSkills.map((item, index) => (
            <li
              key={`${item.skill}-${index}`}
              className="list-group-item px-0 py-3"
            >
              <div className="d-flex justify-content-between align-items-start gap-2">
                <strong>{item.skill}</strong>

                <div className="d-flex gap-2 flex-wrap justify-content-end">
                  <span className="badge text-bg-danger">
                    Missing
                  </span>

                  <span
                    className={`badge ${
                      item.priority?.toLowerCase() === "high"
                        ? "text-bg-danger"
                        : item.priority?.toLowerCase() === "medium"
                          ? "text-bg-warning"
                          : "text-bg-secondary"
                    }`}
                  >
                    {item.priority || "Medium"} priority
                  </span>
                </div>
              </div>

              <p className="text-muted mb-0 mt-2">
                {item.suggestion ||
                  `Build a practical project to develop ${item.skill}.`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SkillGapList;

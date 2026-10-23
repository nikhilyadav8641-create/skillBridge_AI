
import { CheckCircle } from "lucide-react";

function SkillEvidence({ skills = [] }) {
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
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
        <h5 className="mb-0">Matched Skills</h5>
        <span className="badge text-bg-success">
          {validSkills.length}
        </span>
      </div>

      {validSkills.length === 0 ? (
        <p className="text-muted mb-0">
          No skills met the evidence requirements for a full match.
        </p>
      ) : (
        <ul className="list-group list-group-flush">
          {validSkills.map((item, index) => (
            <li
              key={`${item.skill}-${index}`}
              className="list-group-item px-0 py-3"
            >
              <div className="d-flex align-items-start gap-2">
                <CheckCircle
                  size={20}
                  color="#16a34a"
                  className="flex-shrink-0"
                />

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <strong>{item.skill}</strong>
                    <span className="badge text-bg-success">
                      Matched
                    </span>
                  </div>

                  <p className="text-muted mb-0 mt-2">
                    Evidence: {item.evidence}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SkillEvidence;

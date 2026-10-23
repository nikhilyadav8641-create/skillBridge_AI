import { BrainCircuit } from 'lucide-react'
import './AnalysisLoader.css'

function AnalysisLoader({ message = 'Analyzing your resume...' }) {
  return (
    <div className="analysis-loader" role="status" aria-live="polite">
      <div className="analysis-loader-icon">
        <BrainCircuit size={34} />
      </div>

      <div className="analysis-loader-spinner"></div>

      <h3>AI is analyzing your resume</h3>
      <p>{message}</p>
      <span>This may take a little time.</span>
    </div>
  )
}

export default AnalysisLoader
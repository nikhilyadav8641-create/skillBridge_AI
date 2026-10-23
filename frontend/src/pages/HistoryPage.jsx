
import { useEffect, useState } from 'react'
import API from '../api/auth'

function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingAll, setDeletingAll] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      setLoading(true)
      setError('')
      const response = await API.get('/analysis/history')
      setHistory(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load analysis history. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function viewResult(id) {
    try {
      setDetailLoading(true)
      setError('')
      setSelectedAnalysis(null)

      const response = await API.get(`/analysis/history/${id}`)
      setSelectedAnalysis(response.data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load this analysis result.'
      )
    } finally {
      setDetailLoading(false)
    }
  }

  async function deleteOne(id) {
    if (!window.confirm(
      'Delete this analysis record? This cannot be undone.'
    )) return

    try {
      setDeletingId(id)
      setError('')
      setMessage('')

      await API.delete(`/analysis/history/${id}`)

      setHistory(previous =>
        previous.filter(record => record.id !== id)
      )

      setSelectedAnalysis(previous =>
        previous?.id === id ? null : previous
      )

      setMessage('Analysis record deleted successfully.')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to delete this analysis record.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  async function deleteAllHistory() {
    if (history.length === 0) return

    if (!window.confirm(
      `Delete all ${history.length} analysis records? This cannot be undone.`
    )) return

    try {
      setDeletingAll(true)
      setError('')
      setMessage('')

      await API.delete('/analysis/history')

      setHistory([])
      setSelectedAnalysis(null)
      setMessage('All analysis history deleted successfully.')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to delete analysis history.'
      )
    } finally {
      setDeletingAll(false)
    }
  }

  function formatDate(value) {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleString()
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2>Analysis History</h2>
          <p className="text-secondary">
            Review your previous resume analysis records.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-primary"
            onClick={fetchHistory}
            disabled={loading || deletingAll || deletingId !== null}
          >
            Refresh History
          </button>

          <button
            className="btn btn-danger"
            onClick={deleteAllHistory}
            disabled={
              loading ||
              history.length === 0 ||
              deletingAll ||
              deletingId !== null
            }
          >
            {deletingAll ? 'Deleting...' : 'Delete All History'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary mt-2">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h5>No analysis history yet</h5>
            <p className="text-secondary mb-0">
              Your completed resume analyses will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Target Role</th>
                    <th>Match Score</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map(record => (
                    <tr key={record.id}>
                      <td>{record.jobRole || '—'}</td>
                      <td>
                        {record.score ?? '—'}
                        {record.score != null ? '%' : ''}
                      </td>
                      <td>{formatDate(record.createdAt)}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewResult(record.id)}
                            disabled={
                              detailLoading ||
                              deletingId !== null ||
                              deletingAll
                            }
                          >
                            View Result
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteOne(record.id)}
                            disabled={
                              deletingId !== null || deletingAll
                            }
                          >
                            {deletingId === record.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading result...</span>
          </div>
          <p className="text-secondary mt-2">
            Loading analysis result...
          </p>
        </div>
      )}

      {selectedAnalysis && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h4 className="mb-0">Analysis Result</h4>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSelectedAnalysis(null)}
              >
                Close
              </button>
            </div>

            <h5>{selectedAnalysis.jobRole || 'Target Role'}</h5>

            <p>
              <strong>Match Score: </strong>
              {selectedAnalysis.score ?? '—'}
              {selectedAnalysis.score != null ? '%' : ''}
            </p>

            {selectedAnalysis.result?.evidence && (
              <div className="mb-3">
                <h6>Matched Skills / Evidence</h6>
                {selectedAnalysis.result.evidence.length === 0 ? (
                  <p className="text-secondary">No evidence available.</p>
                ) : (
                  <ul>
                    {selectedAnalysis.result.evidence.map((item, index) => (
                      <li key={index}>
                        {typeof item === 'string'
                          ? item
                          : item.skill || item.name || JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {selectedAnalysis.result?.partial && (
              <div className="mb-3">
                <h6>Partially Matched Skills</h6>
                {selectedAnalysis.result.partial.length === 0 ? (
                  <p className="text-secondary">No partial matches.</p>
                ) : (
                  <ul>
                    {selectedAnalysis.result.partial.map((item, index) => (
                      <li key={index}>
                        {typeof item === 'string'
                          ? item
                          : item.skill || item.name || JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {selectedAnalysis.result?.gaps && (
              <div className="mb-3">
                <h6>Missing Skills</h6>
                {selectedAnalysis.result.gaps.length === 0 ? (
                  <p className="text-secondary">No missing skills listed.</p>
                ) : (
                  <ul>
                    {selectedAnalysis.result.gaps.map((item, index) => (
                      <li key={index}>
                        {typeof item === 'string'
                          ? item
                          : item.skill || item.name || JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPage

import { useRef, useState } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import './ResumeUpload.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.rtf',
  '.odt',
]

function ResumeUpload({ onFileSelect }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function handleFile(selectedFile) {
    if (!selectedFile) return

    const filename = selectedFile.name.toLowerCase()
    const supported = ALLOWED_EXTENSIONS.some(
      extension => filename.endsWith(extension)
    )

    if (!supported) {
      setError('Supported formats: PDF, DOC, DOCX, TXT, RTF and ODT.')
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must not exceed 5 MB.')
      return
    }

    if (selectedFile.size === 0) {
      setError('This file is empty. Please choose another document.')
      return
    }

    setError('')
    setFile(selectedFile)
    onFileSelect?.(selectedFile)
  }

  function removeFile() {
    setFile(null)
    setError('')

    if (inputRef.current) {
      inputRef.current.value = ''
    }

    onFileSelect?.(null)
  }

  return (
    <div className="resume-upload">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
        hidden
        onChange={event => {
          handleFile(event.target.files?.[0])
        }}
      />

      {!file ? (
        <button
          type="button"
          className="resume-upload-area"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud size={38} />
          <strong>Upload your resume</strong>
          <span>
            PDF, DOC, DOCX, TXT, RTF or ODT · Maximum 5 MB
          </span>
        </button>
      ) : (
        <div className="resume-selected-file">
          <FileText size={28} />

          <div className="resume-file-info">
            <strong>{file.name}</strong>
            <span>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <button
            type="button"
            className="resume-remove-button"
            onClick={removeFile}
            aria-label="Remove resume"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {error && (
        <p className="resume-upload-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default ResumeUpload
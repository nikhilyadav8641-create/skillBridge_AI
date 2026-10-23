function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
}) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center gap-3 p-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={`spinner-border text-primary ${
          size === 'sm' ? 'spinner-border-sm' : ''
        }`}
        aria-hidden="true"
      ></div>

      <p className="text-secondary mb-0">{message}</p>
    </div>
  )
}

export default LoadingSpinner
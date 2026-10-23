function ErrorMessage({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) {
  return (
    <div className="alert alert-danger d-flex flex-column gap-2" role="alert">
      <p className="mb-0">{message}</p>

      {onRetry && (
        <div>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={onRetry}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export default ErrorMessage
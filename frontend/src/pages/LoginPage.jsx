import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(event) {
  event.preventDefault()
  setError('')

  if (!email.trim() || !password) {
    setError('Please enter your email and password.')
    return
  }

const normalizedEmail = email.trim()

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!emailPattern.test(normalizedEmail)) {
  setError('Please enter a valid email, e.g. nikhil@gmail.com')
  return
}

  setLoading(true)

  try {
    await login({
  email: normalizedEmail,
  password,
})

    navigate('/dashboard')
  } catch (err) {
    setError(
      err?.response?.data?.message ||
      'Invalid email or password. Please try again.'
    )
  } finally {
    setLoading(false)
  }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" className="login-brand">
          <GraduationCap size={34} />
          <span>SkillBridge <strong>AI</strong></span>
        </Link>

        <Link to="/" className="login-home-link">
          Back to Home
        </Link>
      </header>

      <main className="login-main">
        <section className="login-visual">
          <span className="login-visual-badge">
            <Sparkles size={15} /> YOUR FUTURE STARTS HERE
          </span>

          <h1>
            Welcome back.
            <span>Your future is waiting.</span>
          </h1>

          <p className="login-visual-description">
            Continue your learning journey, strengthen your skills and
            take the next step towards your dream career.
          </p>

          <div className="login-illustration">
            <div className="login-illustration-circle" />

            <div className="login-floating-note login-note-top">
              <span className="login-note-icon">✓</span>
              <div>
                <strong>Keep learning</strong>
                <small>One step at a time</small>
              </div>
            </div>

            <div className="login-illustration-cap">
              <GraduationCap size={100} strokeWidth={1.4} />
            </div>

            <div className="login-illustration-screen">
              <div className="login-screen-top">
                <span />
                <span />
                <span />
              </div>
              <div className="login-screen-content">
                <div className="login-screen-sidebar">
                  <i /><i /><i /><i />
                </div>
                <div className="login-screen-chart">
                  <strong>Your Progress</strong>
                  <div className="login-chart-bars">
                    <i /><i /><i /><i /><i />
                  </div>
                  <div className="login-chart-line" />
                </div>
              </div>
            </div>

            <div className="login-floating-note login-note-bottom">
              <span className="login-note-sparkle">✦</span>
              <div>
                <strong>Build your skills</strong>
                <small>Grow with every project</small>
              </div>
            </div>
          </div>

          <div className="login-visual-footer">
            <ShieldCheck size={18} />
            <span>Your career journey, organised in one place.</span>
          </div>
        </section>

        <section className="login-form-section">
          <div className="login-card">
            <div className="login-mobile-logo">
              <GraduationCap size={30} />
            </div>

            <span className="login-welcome-label">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p className="login-form-description">
              Enter your details to continue to SkillBridge AI.
            </p>

            <form onSubmit={handleLogin}>
              <div className="login-field">
                <label htmlFor="login-email">Email address</label>
                <div className="login-input-wrap">
                  <Mail size={19} />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="login-password-label">
                  <label htmlFor="login-password">Password</label>
                </div>

                <div className="login-input-wrap">
                  <LockKeyhole size={19} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-show-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {error && <p className="login-error">{error}</p>}
              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight size={18} />}
              </button>

            </form>

            <div className="login-divider">
              <span>YOUR CAREER JOURNEY</span>
            </div>

            <p className="login-register-text">
              New to SkillBridge AI?{' '}
              <Link to="/register">Create an account</Link>
              <br></br>
              <Link to="">Forget Password</Link>
            </p>

            <p className="login-demo-note">
           <ShieldCheck size={15} />
              Your account details are verified securely.
            </p>
          </div>
        </section>
      </main>

      <footer className="login-footer">
        <span>© {new Date().getFullYear()} SkillBridge AI</span>
        <span>Learn with purpose. Build with confidence.</span>
      </footer>
    </div>
  )
}

export default LoginPage
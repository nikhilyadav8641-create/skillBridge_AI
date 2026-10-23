import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Target,
  BookOpen,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  
async function handleSubmit(event) {
  event.preventDefault()
  setError('')

  const normalizedEmail = form.email.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!form.name.trim()) {
    setError('Please enter your full name.')
    return
  }

  if (!emailPattern.test(normalizedEmail)) {
    setError('Please enter a valid email, e.g. @gmail.com')
    return
  }

  if (form.password.length < 8) {
    setError('Password must be at least 8 characters.')
    return
  }

  setLoading(true)

  try {
    await register({
      ...form,
      name: form.name.trim(),
      email: normalizedEmail,
    })

    navigate('/dashboard')
  } catch (err) {
    setError(
      err?.response?.data?.message ||
      err?.message ||
      'Unable to create your account. Please try again.'
    )
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="register-page">
      <header className="register-header">
        <Link to="/" className="register-brand">
          <GraduationCap size={34} />
          <span>SkillBridge <strong>AI</strong></span>
        </Link>
        <Link to="/" className="register-back-link">Back to Home</Link>
      </header>

      <main className="register-main">
        <section className="register-intro">
          <span className="register-badge">
            <Sparkles size={15} /> START YOUR JOURNEY
          </span>

          <h1>
            Your next chapter
            <span>starts here.</span>
          </h1>

          <p className="register-intro-text">
            Create your account and take the first step towards
            understanding your skills, planning your learning and
            building your career.
          </p>

          <div className="register-benefits">
            <div>
              <span className="register-benefit-icon blue">
                <Target size={22} />
              </span>
              <span>
                <strong>Discover your skill gaps</strong>
                <small>Understand what to learn next.</small>
              </span>
            </div>

            <div>
              <span className="register-benefit-icon purple">
                <BookOpen size={22} />
              </span>
              <span>
                <strong>Build your roadmap</strong>
                <small>Follow a clear learning path.</small>
              </span>
            </div>

            <div>
              <span className="register-benefit-icon green">
                <ShieldCheck size={22} />
              </span>
              <span>
                <strong>Track your progress</strong>
                <small>Keep your career goals organised.</small>
              </span>
            </div>
          </div>

          <div className="register-decoration">
            <GraduationCap size={110} strokeWidth={1.2} />
            <span className="register-decoration-star">✦</span>
          </div>
        </section>

        <section className="register-form-section">
          <div className="register-card">
            <div className="register-mobile-logo">
              <GraduationCap size={34} />
            </div>

            <span className="register-form-eyebrow">CREATE YOUR ACCOUNT</span>
            <h2>Get started for free</h2>
            <p className="register-form-subtitle">
              Fill in your details to join SkillBridge AI.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="register-field">
                <label htmlFor="register-name">Full name</label>
                <div className="register-input-wrap">
                  <UserRound size={19} />
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="register-email">Email address</label>
                <div className="register-input-wrap">
                  <Mail size={19} />
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="register-password">Password</label>
                <div className="register-input-wrap">
                  <LockKeyhole size={19} />
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                <small className="register-field-hint">
                  Use at least 8 characters.
                </small>
              </div>

              {error && <div className="register-error">{error}</div>}

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="register-divider">
              <span>YOUR FUTURE STARTS HERE</span>
            </div>

            <p className="register-login-text">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <p className="register-security-note">
              <ShieldCheck size={15} />
              Your journey begins with one simple step.
            </p>
          </div>
        </section>
      </main>

      <footer className="register-footer">
        <span>© {new Date().getFullYear()} SkillBridge AI</span>
        <span>Learn with purpose. Build with confidence.</span>
      </footer>
    </div>
  )
}

export default RegisterPage
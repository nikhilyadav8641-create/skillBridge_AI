
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  ChevronDown,
  UserRound,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container py-2">
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 fw-bold"
        >
          <GraduationCap size={30} color="#2563eb" />
          <span>
            SkillBridge <span className="text-primary">AI</span>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarMenu">
          <ul className="navbar-nav mx-auto gap-lg-3">
            {/* <li className="nav-item">
              <NavLink to="/" className="nav-link">
                Home
              </NavLink>
            </li> */}

            <li className="nav-item">
              <NavLink to="/dashboard" className="nav-link">
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/analysis" className="nav-link">
                Resume Analysis
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/roadmap" className="nav-link">
                Career Roadmap
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/projects" className="nav-link">
                Projects
              </NavLink>
            </li>
          </ul>

          <div className="d-flex gap-2 mt-3 mt-lg-0 align-items-center">
            {user ? (
              <div className="position-relative" ref={menuRef}>
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2 p-1 border-0"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-label="Open user menu"
                >
                  <span
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: 40,
                      height: 40,
                      background: '#2563eb',
                      fontSize: 17,
                    }}
                  >
                    {initial}
                  </span>

                  <ChevronDown size={16} />
                </button>

                {menuOpen && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow p-2"
                    style={{ width: 250, zIndex: 1050 }}
                  >
                    <div className="px-3 py-2 border-bottom mb-2">
                      <div className="fw-semibold text-dark">
                        {user.name || 'User'}
                      </div>
                      <small className="text-secondary text-break">
                        {user.email}
                      </small>
                    </div>

                    <Link
                      to="/progress"
                      className="dropdown-item rounded py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserRound size={17} className="me-2" />
                      My Progress
                    </Link>

                    <button
                      type="button"
                      className="dropdown-item rounded py-2 text-danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} className="me-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary px-3">
                  Login
                </Link>

                <Link to="/register" className="btn btn-primary px-3">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

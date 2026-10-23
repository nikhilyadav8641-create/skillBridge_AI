
import { useNavigate, NavLink } from 'react-router-dom'
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Map,
  FolderKanban,
  User,
  LifeBuoy,
  LogOut,
  History,
  GitCompareArrows,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analysis', path: '/analysis', icon: FileText },
    {
      name: 'Career Comparison',
      path: '/career-comparison',
      icon: GitCompareArrows,
    },
    { name: 'Career Roadmap', path: '/roadmap', icon: Map },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'My Progress', path: '/progress', icon: User },
    { name: 'History', path: '/history', icon: History },
  ]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sb-sidebar">
      <NavLink to="/dashboard" className="sb-logo">
        <GraduationCap size={28} />
        <span>
          SkillBridge <strong>AI</strong>
        </span>
      </NavLink>

      <p className="sb-menu-title">WORKSPACE</p>

      <nav className="sb-nav">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sb-link ${isActive ? 'sb-active' : ''}`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sb-bottom">
        <NavLink
          to="/help"
          className={({ isActive }) =>
            `sb-link ${isActive ? 'sb-active' : ''}`
          }
        >
          <LifeBuoy size={19} />
          <span>Help &amp; Support</span>
        </NavLink>

        <NavLink
          type="button"
          className="sb-link sb-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar

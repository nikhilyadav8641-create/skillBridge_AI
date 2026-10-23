import { Link } from "react-router-dom";
import {
  GraduationCap,
  FileText,
  Map,
  FolderKanban,
  TrendingUp,
  ArrowRight,
  UploadCloud,
  Target,
  Search,
  Rocket,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import "./LandingPage.css";

const features = [
  {
    title: "Resume Analysis",
    description: "Understand your resume match and discover skills to improve.",
    link: "/analysis",
    label: "Analyze Now",
    icon: FileText,
    color: "blue",
  },
  {
    title: "Career Roadmap",
    description: "Follow a structured learning path with clear next steps.",
    link: "/roadmap",
    label: "Explore Roadmap",
    icon: Map,
    color: "purple",
  },
  {
    title: "Project Building",
    description: "Build practical projects and track each milestone.",
    link: "/projects",
    label: "View Projects",
    icon: FolderKanban,
    color: "green",
  },
  {
    title: "Track Your Progress",
    description: "Review learning progress and monitor completed tasks.",
    link: "/progress",
    label: "View Progress",
    icon: TrendingUp,
    color: "orange",
  },
];

const steps = [
  {
    title: "Upload Resume",
    description: "Choose your PDF resume.",
    icon: UploadCloud,
    color: "blue",
  },
  {
    title: "Select Job Role",
    description: "Choose the career you want.",
    icon: Target,
    color: "purple",
  },
  {
    title: "Review Skill Gaps",
    description: "See the sample analysis results.",
    icon: Search,
    color: "green",
  },
  {
    title: "Follow Your Roadmap",
    description: "Learn, practise and build projects.",
    icon: Rocket,
    color: "orange",
  },
];

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-nav">
          <Link to="/" className="landing-brand">
            <GraduationCap size={34} />
            <span>
              SkillBridge <strong>AI</strong>
            </span>
          </Link>

          {/* <nav className="landing-nav-links">
            <a href="#home" className="landing-nav-active">
              Home
            </a>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/analysis">Resume Analysis</Link>
            <Link to="/roadmap">Career Roadmap</Link>
            <Link to="/projects">Projects</Link>
          </nav> */}

          <div className="landing-nav-actions">
            <Link to="/login" className="landing-login">
              Login
            </Link>
            <Link to="/register" className="landing-primary-button">
              Start Your Journey <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="home">
          <div className="landing-hero-inner">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">
                <Star size={15} /> Your Career, Your Journey
              </span>

              <h1>
                Bridge Your Skills Gap.
                <span> Build Your Future.</span>
              </h1>

              <p className="landing-hero-description">
                Discover the skills you need, follow a learning roadmap and
                build projects that prepare you for your dream career.
              </p>

              <div className="landing-hero-actions">
                <Link to="/register" className="landing-primary-button">
                  Start Your Journey <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="landing-secondary-button">
                  Explore How It Works
                </a>
              </div>

              <div className="landing-trust-row">
                <div>
                  <Users size={22} />
                  <span>
                    <strong>One Platform</strong>
                    <small>Career preparation</small>
                  </span>
                </div>
                <div>
                  <ShieldCheck size={22} />
                  <span>
                    <strong>Skill Focused</strong>
                    <small>Structured learning</small>
                  </span>
                </div>
                <div>
                  <TrendingUp size={22} />
                  <span>
                    <strong>Track Progress</strong>
                    <small>Milestone tracking</small>
                  </span>
                </div>
              </div>
            </div>

            <div className="landing-hero-visual">
              <div className="hero-orbit hero-orbit-one" />
              <div className="hero-orbit hero-orbit-two" />

              <div className="hero-floating-card hero-resume-card">
                <div className="hero-card-icon blue">
                  <FileText size={23} />
                </div>
                <div>
                  <strong>Resume Analysis</strong>
                  <p>Discover your skill gaps</p>
                  <span className="hero-mini-bar">
                    <i />
                  </span>
                </div>
              </div>

              <div className="hero-main-illustration">
                <div className="hero-cap">
                  <GraduationCap size={90} strokeWidth={1.4} />
                </div>
                <div className="hero-laptop">
                  <div className="hero-laptop-screen">
                    <TrendingUp size={58} />
                    <span>Build your future</span>
                  </div>
                  <div className="hero-laptop-base" />
                </div>
                <div className="hero-spark hero-spark-one">✦</div>
                <div className="hero-spark hero-spark-two">✧</div>
              </div>

              <div className="hero-floating-card hero-roadmap-card">
                <div className="hero-card-icon purple">
                  <Map size={23} />
                </div>
                <div>
                  <strong>Your Roadmap</strong>
                  <p>Learn · Practise · Build</p>
                  <span className="hero-roadmap-line">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              </div>

              <div className="hero-decoration hero-decoration-one" />
              <div className="hero-decoration hero-decoration-two" />
            </div>
          </div>
        </section>

        <section className="landing-features section-container" id="features">
          <div className="landing-section-heading">
            <span>YOUR CAREER TOOLKIT</span>
            <h2>Everything You Need for Career Growth</h2>
            <p>
              One place to understand your skills, plan your learning and work
              towards your career goals.
            </p>
          </div>

          <div className="landing-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="landing-feature-card" key={feature.title}>
                  <div className={`landing-feature-icon ${feature.color}`}>
                    <Icon size={25} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <Link to="/register">
                    {feature.label} <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-how section-container" id="how-it-works">
          <div className="landing-how-heading">
            <span>GET STARTED</span>
            <h2>Your Journey in Four Steps</h2>
            <p>Turn your career goal into a practical learning plan.</p>
          </div>

          <div className="landing-steps">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article className="landing-step" key={step.title}>
                  <div className={`landing-step-icon ${step.color}`}>
                    <Icon size={24} />
                    <span>{index + 1}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-cta section-container">
          <div className="landing-cta-icon">
            <Rocket size={34} />
          </div>
          <div>
            <h2>Ready to Build Your Future?</h2>
            <p>Start planning your next career step with SkillBridge AI.</p>
          </div>
          <Link to="/register">
            Get Started <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <Link to="/" className="landing-brand">
          <GraduationCap size={26} />
          <span>
            SkillBridge <strong>AI</strong>
          </span>
        </Link>
        <p>Learn with purpose. Build with confidence.</p>
        <div>
          <Link to="/help">Help & Support</Link>
          <Link to="/login">Login</Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

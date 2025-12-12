import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const accentLines = useMemo(
    () => (
      <div className="accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>
    ),
    []
  );

  return (
    <section className="minimal-root">
      {/* Fixed Background Layer */}
      <div className="background-layer">{accentLines}</div>

      {/* Content Layer */}
      <div className="content-layer">
        <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

.minimal-root, .minimal-root * {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.minimal-root {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;

  --primary: #0b5cff;
  --primary-dark: #0a4fd8;
  --bg: #ffffff;
  --fg: #0f172a;
  --muted: #5f6a7a;
  --border: #c8d7f5;
  --accent: #f1f4fc;

  background: var(--bg);
  color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 300;
  line-height: 1.5;
}

.background-layer {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.content-layer {
  position: relative;
  z-index: 10;
}

.lp-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(11,92,255,0.08);
  z-index: 50;
}
.lp-brand {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--fg);
}
.lp-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lp-link {
  font-size: 13px;
  color: var(--muted);
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  transition: all 0.15s ease;
  text-decoration: none;
  cursor: pointer;
}
.lp-link:hover {
  color: var(--fg);
  border-color: rgba(11,92,255,0.12);
  background: rgba(11,92,255,0.06);
}
.lp-cta {
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  border: 1px solid rgba(11,92,255,0.2);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 10px 30px rgba(11,92,255,0.18);
}
.lp-cta:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 12px 34px rgba(11,92,255,0.22);
}
.lp-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lp-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(11,92,255,0.12);
  background: rgba(11,92,255,0.06);
}
.lp-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.lp-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--fg);
}
.lp-logout {
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  border: 1px solid rgba(11,92,255,0.12);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.15s ease;
}
.lp-logout:hover {
  color: var(--fg);
  border-color: rgba(11,92,255,0.2);
  background: rgba(11,92,255,0.06);
}

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px 24px;
}

.kicker {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.083em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 8px;
  opacity: 0.9;
}
.title {
  font-weight: 200;
  font-size: clamp(48px, 8vw, 112px);
  line-height: 1.05;
  letter-spacing: -0.003em;
  margin: 0 0 16px 0;
  color: var(--fg);
}
.subtitle {
  margin-top: 0;
  font-size: clamp(19px, 2.5vw, 28px);
  font-weight: 300;
  letter-spacing: 0.011em;
  color: var(--muted);
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.4;
}

.accent-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hline, .vline {
  position: absolute;
  background: rgba(11,92,255,0.22);
  opacity: .9;
  will-change: transform, opacity;
}
.hline {
  height: 1px; left: 0; right: 0;
  transform: scaleX(0);
  transform-origin: 50% 50%;
  animation: drawX 800ms cubic-bezier(.22,.61,.36,1) forwards;
}
.hline:nth-child(1){ top: 20%; animation-delay: 150ms; }
.hline:nth-child(2){ top: 50%; animation-delay: 280ms; }
.hline:nth-child(3){ top: 80%; animation-delay: 410ms; }

.vline {
  width: 1px; top: 0; bottom: 0;
  transform: scaleY(0);
  transform-origin: 50% 0%;
  animation: drawY 900ms cubic-bezier(.22,.61,.36,1) forwards;
}
.vline:nth-child(4){ left: 20%; animation-delay: 520ms; }
.vline:nth-child(5){ left: 50%; animation-delay: 640ms; }
.vline:nth-child(6){ left: 80%; animation-delay: 760ms; }

.hline::after, .vline::after{
  content:"";
  position:absolute;
  inset:0;
  background: linear-gradient(90deg, transparent, rgba(11,92,255,.28), transparent);
  opacity:0;
  animation: shimmer 900ms ease-out forwards;
}
.hline:nth-child(1)::after{ animation-delay: 150ms; }
.hline:nth-child(2)::after{ animation-delay: 280ms; }
.hline:nth-child(3)::after{ animation-delay: 410ms; }
.vline:nth-child(4)::after{ animation-delay: 520ms; }
.vline:nth-child(5)::after{ animation-delay: 640ms; }
.vline:nth-child(6)::after{ animation-delay: 760ms; }

@keyframes drawX {
  0% { transform: scaleX(0); opacity: 0; }
  60% { opacity: .9; }
  100% { transform: scaleX(1); opacity: .75; }
}
@keyframes drawY {
  0% { transform: scaleY(0); opacity: 0; }
  60% { opacity: .9; }
  100% { transform: scaleY(1); opacity: .75; }
}
@keyframes shimmer {
  0% { opacity: .0; }
  30% { opacity: .25; }
  100% { opacity: 0; }
}

.trusted {
  padding: 48px 24px 96px 24px;
  display: flex;
  justify-content: center;
}
.trusted-card {
  max-width: 920px;
  width: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #eef3ff 100%);
  border: 1px solid rgba(11,92,255,0.12);
  border-radius: 32px;
  padding: 32px 28px;
  box-shadow: 0 18px 60px rgba(11,92,255,0.08);
}
.trusted-kicker {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 8px;
}
.trusted-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 300;
  color: var(--fg);
  margin: 0 0 12px 0;
  letter-spacing: -0.01em;
}
.trusted-sub {
  margin: 0 0 24px 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.5;
  max-width: 640px;
}
.trusted-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
.pill {
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(11,92,255,0.08);
  color: #0f172a;
  font-size: 13px;
  text-align: center;
  border: 1px solid rgba(11,92,255,0.14);
}

@media (max-width: 768px) {
  .hero {
    padding: 100px 20px 60px 20px;
  }
  .trusted-card {
    padding: 28px 22px;
  }
  .lp-header {
    padding: 12px 18px;
  }
}
@media (max-width: 480px) {
  .hero {
    padding: 80px 16px 40px 16px;
  }
}
        `}</style>

        {/* Hero */}
        <main className="hero">
          <div>
            <div className="kicker">Realta Wealth</div>
            <h1 className="title">
              Wealth that feels
              <br />
              calm and effortless.
            </h1>
            <p className="subtitle">
              A modern wealth platform for Realta clients and advisors. Clean, minimal, and guided—so every investor profile stays accurate, secure, and fast to complete.
            </p>
            <div style={{ marginTop: "48px", display: "flex", justifyContent: "center" }}>
              <Button
                type="button"
                onClick={() => navigate("/app")}
                className="h-12 px-6 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-transform duration-150"
              >
                Enter workspace
              </Button>
            </div>
          </div>
        </main>

        {/* Trusted/Testimonials placeholder */}
        <section className="trusted">
          <div className="trusted-card">
            <p className="trusted-kicker">Trusted</p>
            <h2 className="trusted-title">Realta Wealth, built for clarity and speed.</h2>
            <p className="trusted-sub">
              Guided investor onboarding, advisor-ready controls, and secure data flows. Everything your team needs to keep profiles current and compliant.
            </p>
            <div className="trusted-grid">
              <div className="pill">Blue-first palette</div>
              <div className="pill">Client-friendly</div>
              <div className="pill">Advisor-ready</div>
              <div className="pill">Secure</div>
            </div>
          </div>
        </section>

        {/* Header */}
        <header className="lp-header">
          <Link to="/" className="lp-brand" style={{ textDecoration: "none", color: "inherit" }}>
            Realta Wealth
          </Link>
          <div className="lp-actions">
            {isAuthenticated && user ? (
              <>
                <div className="lp-user">
                  <div className="lp-user-info">
                    <span className="lp-avatar">{user.fullName?.[0]?.toUpperCase() || "U"}</span>
                    <span className="lp-user-name">{user.fullName}</span>
                  </div>
                  <button className="lp-link" onClick={() => navigate("/app")}>
                    Dashboard
                  </button>
                  <button className="lp-logout" onClick={() => logout()}>
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className="lp-link" onClick={() => navigate("/auth")}>
                  Log in
                </button>
                <button className="lp-cta" onClick={() => navigate("/auth")}>
                  Sign up
                </button>
              </>
            )}
          </div>
        </header>
      </div>
    </section>
  );
}


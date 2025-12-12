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


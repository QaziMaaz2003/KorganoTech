/* eslint-disable @next/next/no-img-element */
// Static markup ported from the client's approved preview. Interactions live in ref-root.tsx.
import Link from "next/link";

export function EnvironmentalContent() {
  return (
    <>
      <section className="rx-page-hero" aria-labelledby="hero-title">
        <div className="rx-container-page">
          <nav aria-label="Breadcrumb" className="rx-breadcrumb">
            <Link href="/">
              Home
            </Link>
            {" "}
            <span>
              /
            </span>
            {" "}
            <Link href="/technology">
              Clean Air Technology
            </Link>
            {" "}
            <span>
              /
            </span>
            {" "}
            <span className="rx-breadcrumb__current">
              Environmental Air Filters
            </span>
          </nav>
          <div className="rx-hero-showcase">
            <div className="rx-hero-grid">
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
                  <span className="rx-pill-badge rx-pill-badge--dark">
                    <span className="rx-pill-badge__dot" />
                    {" "}TECHNOLOGY IN DEVELOPMENT
                  </span>
                  {" "}
                  <span className="rx-eyebrow rx-eyebrow--light">
                    Addressing a Climate Urgency
                  </span>
                </div>
                <h1 id="hero-title" className="rx-hero-title">
                  KorganoTech’s{" "}
                  <span className="rx-text-gradient-lilac">
                    Environmental Air Filters
                  </span>
                </h1>
                <p className="rx-hero-lead">
                  Our Technology captures CO₂ from landfill gas while recovering renewable methane, built on science from{" "}
                  <strong>
                    Lawrence Livermore National Laboratory
                  </strong>
                  .
                </p>
                <div className="rx-hero-actions">
                  <a href="#contact" className="rx-btn rx-btn--white">
                    Partner with us{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </a>
                  {" "}
                  <a href="#technology" className="rx-btn rx-btn--outline-light">
                    Explore automated platform
                  </a>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "1rem" }}>
                <div className="rx-hero-stats-grid">
                  <article className="rx-hero-glass-card">
                    <span className="rx-eyebrow rx-eyebrow--light" style={{ display: "block" }}>
                      U.S. Landfill Impact
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginTop: "0.35rem" }}>
                      <p className="rx-hero-stat-value">
                        14.4%
                      </p>
                      <svg
                        width="52"
                        height="52"
                        viewBox="0 0 64 64"
                        aria-hidden="true"
                        style={{ flexShrink: "0" }}>
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          fill="none"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="6" />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          fill="none"
                          stroke="#a6e3d8"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray="23.5 163.3"
                          transform="rotate(-90 32 32)" />
                        <text
                          x="32"
                          y="36"
                          textAnchor="middle"
                          fill="#a6e3d8"
                          fontSize="11.5"
                          fontWeight="800">
                          MSW
                        </text>
                      </svg>
                    </div>
                    <p
                      style={{ marginTop: "0.75rem", fontSize: "0.875rem", lineHeight: "1.55", color: "rgba(255, 255, 255, 0.82)" }}>
                      of U.S. human-related methane emissions came from municipal solid waste landfills in 2022.
                    </p>
                  </article>
                  <article className="rx-hero-glass-card rx-hero-glass-card--highlight">
                    <span className="rx-eyebrow rx-eyebrow--teal" style={{ display: "block" }}>
                      Heat-Trapping Potency
                    </span>
                    <p
                      className="rx-hero-stat-value"
                      style={{ marginTop: "0.35rem", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.15rem 0.35rem" }}>
                      <span>
                        ≥28×
                      </span>
                      {" "}
                      <span style={{ fontSize: "1rem", fontWeight: "700", color: "var(--lilac-highlight)" }}>
                        Harmful
                      </span>
                    </p>
                    <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.35rem" }} aria-hidden="true">
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" }}>
                        <span style={{ width: "2.25rem", fontWeight: "700" }}>
                          CO₂
                        </span>
                        <div
                          style={{ height: "6px", width: "4%", minWidth: "6px", borderRadius: "99px", background: "rgba(255,255,255,0.45)" }} />
                        <span>
                          1× baseline
                        </span>
                      </div>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "#fde68a" }}>
                        <span style={{ width: "2.25rem", fontWeight: "700" }}>
                          CH₄
                        </span>
                        <div
                          style={{ height: "6px", flex: "1", borderRadius: "99px", background: "linear-gradient(90deg, #c5b0f6 0%, #fbbf24 100%)" }} />
                        <span style={{ fontWeight: "700" }}>
                          28× heat
                        </span>
                      </div>
                    </div>
                    <p
                      style={{ marginTop: "0.75rem", fontSize: "0.875rem", lineHeight: "1.55", color: "rgba(255, 255, 255, 0.86)" }}>
                      Methane traps at least 28 times more heat than CO₂ over 100 years, making near-term capture especially valuable.
                    </p>
                  </article>
                </div>
                <p
                  style={{ fontSize: "0.75rem", lineHeight: "1.5", color: "rgba(255, 255, 255, 0.6)", paddingInline: "0.25rem" }}>
                  Source: U.S. EPA, Basic Information about Landfill Gas. 14.4% refers to municipal solid waste landfills in 2022. Methane 100-year global warming potential: 28.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <nav className="rx-page-subnav" aria-label="Page sections">
        <div className="rx-container-page rx-page-subnav__inner">
          <span className="rx-page-subnav__label">
            On this page:
          </span>
          {" "}
          <a href="#climate-urgency" className="rx-page-subnav__link">
            The Climate Liability
          </a>
          {" "}
          <a href="#technology" className="rx-page-subnav__link">
            Automated Platform
          </a>
          {" "}
          <a href="#how-it-works" className="rx-page-subnav__link">
            How It Works &amp; Sensor
          </a>
          {" "}
          <a href="#llnl-science" className="rx-page-subnav__link">
            LLNL Capture Science
          </a>
          {" "}
          <a href="#case-study" className="rx-page-subnav__link">
            Orange County Case Study
          </a>
          {" "}
          <a href="#contact" className="rx-page-subnav__link">
            Contact Us
          </a>
        </div>
      </nav>
      <section id="climate-urgency" className="rx-section rx-section--white" aria-labelledby="urgency-title">
        <div className="rx-container-page">
          <div className="rx-section-header">
            <p className="rx-eyebrow">
              Addressing a Climate Urgency
            </p>
            <h2 id="urgency-title" className="rx-section-heading" style={{ marginTop: "0.5rem" }}>
              Your Waste is Destroying this Beautiful Planet
            </h2>
            <p className="rx-section-subtitle">
              Landfills turn organic waste into a gas that is two climate liabilities at once.
            </p>
          </div>
          <div style={{ maxWidth: "62rem", marginInline: "auto" }}>
            <div className="rx-composition-bar" role="region" aria-label="Landfill gas composition">
              <div className="rx-composition-bar__segment rx-composition-bar__segment--ch4">
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                  <span
                    style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--teal-highlight)" }}>
                    Renewable Fuel Potential
                  </span>
                  {" "}
                  <span
                    style={{ fontSize: "0.75rem", fontWeight: "700", padding: "0.15rem 0.5rem", borderRadius: "99px", background: "rgba(255,255,255,0.16)" }}>
                    GWP: 28×
                  </span>
                </div>
                <span
                  style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.85rem)", fontWeight: "800", marginTop: "0.15rem" }}>
                  ≈50% methane (CH₄)
                </span>
              </div>
              <div className="rx-composition-bar__segment rx-composition-bar__segment--co2">
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                  <span
                    style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--lilac-highlight)" }}>
                    Long-Term Carbon Burden
                  </span>
                  {" "}
                  <span
                    style={{ fontSize: "0.75rem", fontWeight: "700", padding: "0.15rem 0.5rem", borderRadius: "99px", background: "rgba(255,255,255,0.12)" }}>
                    Cumulative
                  </span>
                </div>
                <span
                  style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.85rem)", fontWeight: "800", marginTop: "0.15rem" }}>
                  ≈50% carbon dioxide (CO₂)
                </span>
              </div>
            </div>
            <div className="rx-grid-2" style={{ marginTop: "1.5rem" }}>
              <article className="rx-surface-card rx-surface-card--interactive rx-molecule-card">
                <div className="rx-molecule-card__graphic" aria-hidden="true">
                  <svg
                    width="240"
                    height="140"
                    viewBox="0 0 240 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <circle
                      cx="120"
                      cy="72"
                      r="54"
                      stroke="#7d67ae"
                      strokeOpacity="0.18"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="rx-animate-pulse-ring" />
                    <circle cx="120" cy="72" r="38" stroke="#4a3570" strokeOpacity="0.15" strokeWidth="1.5" />
                    <line
                      x1="120"
                      y1="72"
                      x2="120"
                      y2="24"
                      stroke="#4a3570"
                      strokeWidth="4"
                      strokeLinecap="round" />
                    <line
                      x1="120"
                      y1="72"
                      x2="76"
                      y2="98"
                      stroke="#4a3570"
                      strokeWidth="4"
                      strokeLinecap="round" />
                    <line
                      x1="120"
                      y1="72"
                      x2="164"
                      y2="98"
                      stroke="#4a3570"
                      strokeWidth="4"
                      strokeLinecap="round" />
                    <line
                      x1="120"
                      y1="72"
                      x2="148"
                      y2="48"
                      stroke="#7d67ae"
                      strokeWidth="3"
                      strokeDasharray="3 3"
                      strokeLinecap="round" />
                    <circle cx="120" cy="22" r="11" fill="#7d67ae" />
                    <text x="120" y="26" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">
                      H
                    </text>
                    <circle cx="74" cy="100" r="11" fill="#7d67ae" />
                    <text x="74" y="104" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">
                      H
                    </text>
                    <circle cx="166" cy="100" r="11" fill="#7d67ae" />
                    <text x="166" y="104" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">
                      H
                    </text>
                    <circle cx="152" cy="45" r="9" fill="#9582c4" />
                    <text x="152" y="48.5" textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="800">
                      H
                    </text>
                    <circle cx="120" cy="72" r="18" fill="#23163c" stroke="#c5b0f6" strokeWidth="2.5" />
                    <text x="120" y="76" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">
                      CH₄
                    </text>
                    <rect x="14" y="14" width="66" height="22" rx="11" fill="#4a3570" />
                    <text x="47" y="28" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="700">
                      28× GWP₁₀₀
                    </text>
                  </svg>
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.5rem 0.75rem" }}>
                  <div>
                    <span className="rx-eyebrow">
                      ≈50% Methane (CH₄)
                    </span>
                    <h3
                      style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--primary)", marginTop: "0.2rem" }}>
                      High-impact methane
                    </h3>
                  </div>
                  <span
                    className="rx-pill-badge"
                    style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" }}>
                    Recoverable Energy
                  </span>
                </div>
                <p
                  style={{ marginTop: "0.875rem", fontSize: "0.9625rem", lineHeight: "1.65", color: "var(--muted-foreground)" }}>
                  Traps at least 28× more heat than CO₂ over 100 years. Captured, it is a renewable energy source.
                </p>
              </article>
              <article className="rx-surface-card rx-surface-card--interactive rx-molecule-card">
                <div
                  className="rx-molecule-card__graphic rx-molecule-card__graphic--night"
                  aria-hidden="true">
                  <svg
                    width="240"
                    height="140"
                    viewBox="0 0 240 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <ellipse
                      cx="120"
                      cy="72"
                      rx="76"
                      ry="38"
                      stroke="#c5b0f6"
                      strokeOpacity="0.22"
                      strokeWidth="1.5"
                      strokeDasharray="5 5"
                      className="rx-animate-pulse-ring" />
                    <line x1="68" y1="67" x2="172" y2="67" stroke="#c5b0f6" strokeWidth="3.5" />
                    <line x1="68" y1="77" x2="172" y2="77" stroke="#c5b0f6" strokeWidth="3.5" />
                    <circle cx="64" cy="72" r="15" fill="#7d67ae" stroke="#ece8f7" strokeWidth="2" />
                    <text x="64" y="76" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">
                      O
                    </text>
                    <circle cx="176" cy="72" r="15" fill="#7d67ae" stroke="#ece8f7" strokeWidth="2" />
                    <text x="176" y="76" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">
                      O
                    </text>
                    <circle cx="120" cy="72" r="19" fill="#4a3570" stroke="#a6e3d8" strokeWidth="2.5" />
                    <text x="120" y="76" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">
                      CO₂
                    </text>
                    <rect x="148" y="14" width="78" height="22" rx="11" fill="rgba(255,255,255,0.14)" />
                    <text x="187" y="28" textAnchor="middle" fill="#c5b0f6" fontSize="9.5" fontWeight="700">
                      O = C = O
                    </text>
                  </svg>
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.5rem 0.75rem" }}>
                  <div>
                    <span className="rx-eyebrow">
                      ≈50% Carbon Dioxide (CO₂)
                    </span>
                    <h3
                      style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--primary)", marginTop: "0.2rem" }}>
                      Cumulative CO₂
                    </h3>
                  </div>
                  <span className="rx-pill-badge">
                    Target for Capture
                  </span>
                </div>
                <p
                  style={{ marginTop: "0.875rem", fontSize: "0.9625rem", lineHeight: "1.65", color: "var(--muted-foreground)" }}>
                  Released CO₂ adds directly to the long-term greenhouse-gas burden. Flaring the methane only adds more.
                </p>
              </article>
            </div>
            <div
              className="rx-callout-box rx-callout-box--night"
              style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span
                  className="rx-icon-box"
                  style={{ background: "rgba(251, 191, 36, 0.16)", color: "#fbbf24", border: "1px solid rgba(251, 191, 36, 0.35)" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true">
                    <path
                      d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
                  </svg>
                </span>
                <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "rgba(255, 255, 255, 0.92)" }}>
                  <strong style={{ color: "#fde68a" }}>
                    Today&apos;s default is flaring.
                  </strong>
                  {" "}High mitigation costs mean most landfill gas is simply burned off, and its value with it.
                </p>
              </div>
              <a
                href="#technology"
                className="rx-btn rx-btn--outline-light"
                style={{ height: "2.5rem", padding: "0 1.125rem", fontSize: "0.8125rem" }}>
                See our alternative →
              </a>
            </div>
            <p className="rx-source-note">
              Landfill gas composition and methane impact: U.S. EPA, Basic Information about Landfill Gas.
            </p>
          </div>
        </div>
      </section>
      <section id="technology" className="rx-section rx-section--soft" aria-labelledby="tech-title">
        <div className="rx-container-page">
          <div className="rx-section-header" style={{ marginBottom: "2.25rem" }}>
            <p className="rx-eyebrow">
              Technology
            </p>
            <h2 id="tech-title" className="rx-section-heading" style={{ marginTop: "0.5rem" }}>
              One automated platform, two valuable outputs
            </h2>
            <p className="rx-section-subtitle">
              Continuous landfill-gas separation combining selective CO₂ microcapsule filters, optical saturation sensing, and automated cartridge regeneration.
            </p>
          </div>
          <div
            className="rx-media-frame"
            style={{ maxWidth: "70rem", marginInline: "auto", background: "var(--night)" }}>
            <div
              style={{ padding: "1.35rem 1.5rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <div
                style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem 1rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
                  <span className="rx-pill-badge rx-pill-badge--dark">
                    <span className="rx-pill-badge__dot" />
                    {" "}INTERACTIVE LIVE FLOW
                  </span>
                  {" "}
                  <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>
                    Continuous Dual-Output Architecture
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.75rem", fontWeight: "700", color: "rgba(255,255,255,0.8)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <span
                      style={{ width: "8px", height: "8px", borderRadius: "99px", background: "#34d399" }} />
                    {" "}CH₄ (Recovered Methane)
                  </span>
                  {" "}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <span
                      style={{ width: "8px", height: "8px", borderRadius: "99px", background: "#fbbf24" }} />
                    {" "}CO₂ (Captured &amp; Compressed)
                  </span>
                </div>
              </div>
              <div
                id="live-step-status"
                style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--lilac-highlight)", lineHeight: "1.45" }}>
                Step 1 Active: Selective CO₂ media filter captures CO₂ as landfill gas flows through while allowing purified CH₄ to pass to recovery.
              </div>
            </div>
            <div style={{ padding: "0.5rem 1.5rem 1.5rem", overflowX: "auto" }}>
              <svg
                viewBox="0 0 1060 436"
                width="100%"
                height="auto"
                role="img"
                aria-label="Animated KorganoTech Landfill Gas Separation, Automated Regeneration, and CO2 Compression Schematic"
                style={{ minWidth: "640px", fontFamily: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <defs>
                  <linearGradient id="purpleHeaderGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4a3570" />
                    <stop offset="100%" stopColor="#7d67ae" />
                  </linearGradient>
                  <linearGradient id="amberHeaderGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                  <linearGradient id="tealHeaderGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="co2PipeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4a3570" />
                    <stop offset="100%" stopColor="#7d67ae" />
                  </linearGradient>
                  <linearGradient id="steelGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b2c5a" />
                    <stop offset="50%" stopColor="#56437e" />
                    <stop offset="100%" stopColor="#31234d" />
                  </linearGradient>
                  <linearGradient id="tankGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#382954" />
                    <stop offset="45%" stopColor="#675394" />
                    <stop offset="100%" stopColor="#2c1f45" />
                  </linearGradient>
                  <linearGradient id="heatGlowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(251, 191, 36, 0.32)" />
                    <stop offset="100%" stopColor="rgba(217, 119, 6, 0.14)" />
                  </linearGradient>
                  <radialGradient id="spotPurpleRadial" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#c5b0f6" stopOpacity="0.38" />
                    <stop offset="65%" stopColor="#7d67ae" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#4a3570" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="spotAmberRadial" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
                    <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="spotTealRadial" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.38" />
                    <stop offset="65%" stopColor="#10b981" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0" />
                  </radialGradient>
                  <filter id="glowPurple" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#c5b0f6" floodOpacity="0.95" />
                    <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#8b5cf6" floodOpacity="0.65" />
                  </filter>
                  <filter id="glowAmber" x="-35%" y="-35%" width="170%" height="170%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#fde68a" floodOpacity="1" />
                    <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#f59e0b" floodOpacity="0.8" />
                  </filter>
                  <filter id="glowTeal" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#6ee7b7" floodOpacity="0.95" />
                    <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#10b981" floodOpacity="0.7" />
                  </filter>
                </defs>
                <rect
                  x="1"
                  y="1"
                  width="1058"
                  height="434"
                  rx="20"
                  fill="#1b1030"
                  stroke="rgba(197,176,246,0.18)" />
                <g id="svg-spotlight-1" className="rx-svg-spotlight rx-is-visible">
                  <ellipse cx="338" cy="245" rx="145" ry="135" fill="url(#spotPurpleRadial)" />
                  <rect
                    x="242"
                    y="170"
                    width="192"
                    height="172"
                    rx="16"
                    fill="none"
                    stroke="#c5b0f6"
                    strokeWidth="3"
                    strokeDasharray="8 5"
                    filter="url(#glowPurple)">
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-26"
                      dur="1.2s"
                      repeatCount="indefinite" />
                  </rect>
                </g>
                <g id="svg-spotlight-2" className="rx-svg-spotlight">
                  <ellipse cx="338" cy="296" rx="130" ry="78" fill="url(#spotAmberRadial)" />
                  <rect
                    x="256"
                    y="280"
                    width="164"
                    height="42"
                    rx="12"
                    fill="none"
                    stroke="#fde68a"
                    strokeWidth="3.5"
                    filter="url(#glowAmber)">
                    <animate attributeName="opacity" values="1;0.45;1" dur="1.1s" repeatCount="indefinite" />
                  </rect>
                </g>
                <g id="svg-spotlight-3" className="rx-svg-spotlight">
                  <circle cx="588" cy="256" r="92" fill="url(#spotPurpleRadial)" />
                  <circle
                    cx="588"
                    cy="256"
                    r="56"
                    fill="none"
                    stroke="#fde68a"
                    strokeWidth="3.5"
                    strokeDasharray="10 6"
                    filter="url(#glowAmber)">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 588 256"
                      to="360 588 256"
                      dur="6s"
                      repeatCount="indefinite" />
                  </circle>
                </g>
                <g id="svg-spotlight-4" className="rx-svg-spotlight">
                  <ellipse cx="686" cy="256" rx="115" ry="125" fill="url(#spotAmberRadial)" />
                  <ellipse cx="930" cy="246" rx="115" ry="125" fill="url(#spotTealRadial)" />
                  <rect
                    x="640"
                    y="190"
                    width="92"
                    height="132"
                    rx="14"
                    fill="none"
                    stroke="#fde68a"
                    strokeWidth="3.2"
                    filter="url(#glowAmber)">
                    <animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite" />
                  </rect>
                </g>
                <g id="svg-group-inlet" className="rx-svg-subsystem">
                  <path
                    d="M 66 322 Q 88 312 110 320 T 154 316"
                    fill="none"
                    stroke="rgba(197,176,246,0.28)"
                    strokeWidth="2.5"
                    strokeLinecap="round" />
                  <path
                    d="M 78 334 Q 102 325 124 332 T 164 328"
                    fill="none"
                    stroke="rgba(197,176,246,0.18)"
                    strokeWidth="2"
                    strokeLinecap="round" />
                  <path
                    d={"M 58 298\n                         C 34 298, 22 278, 30 258\n                         C 24 238, 40 218, 62 220\n                         C 74 196, 112 194, 130 214\n                         C 152 206, 178 220, 178 244\n                         C 194 252, 194 280, 178 292\n                         C 172 298, 160 298, 148 298 Z"}
                    fill="#291b47"
                    stroke="#c5b0f6"
                    strokeWidth="2" />
                  <text
                    x="108"
                    y="250"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13.5"
                    fontWeight="800"
                    letterSpacing="0.4">
                    LANDFILL GAS
                  </text>
                  <text x="108" y="272" textAnchor="middle" fontSize="13" fontWeight="800">
                    <tspan fill="#34d399">
                      CH₄
                    </tspan>
                    {" "}
                    <tspan fill="rgba(255,255,255,0.65)">
                      +
                    </tspan>
                    {" "}
                    <tspan fill="#c5b0f6">
                      CO₂
                    </tspan>
                  </text>
                  <path
                    d="M 190 245 L 232 245 L 232 235 L 250 255 L 232 275 L 232 265 L 190 265 Z"
                    fill="#433268"
                    stroke="rgba(197,176,246,0.4)"
                    strokeWidth="1.2" />
                  <circle r="4" fill="#34d399">
                    <animateMotion dur="1.6s" repeatCount="indefinite" path="M 192 250 L 244 250" />
                  </circle>
                  <circle r="4" fill="#c5b0f6">
                    <animateMotion
                      dur="1.6s"
                      begin="0.8s"
                      repeatCount="indefinite"
                      path="M 192 260 L 244 260" />
                  </circle>
                </g>
                <g
                  id="svg-stage-capture"
                  className="rx-svg-subsystem"
                  style={{ cursor: "pointer" }}
                  data-svg-step="1">
                  <rect
                    x="232"
                    y="76"
                    width="212"
                    height="46"
                    rx="12"
                    fill="url(#purpleHeaderGrad)"
                    stroke="#c5b0f6"
                    strokeWidth="1.5" />
                  <text
                    x="338"
                    y="96"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    CO₂ CAPTURE +
                  </text>
                  <text
                    x="338"
                    y="113"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    METHANE RECOVERY
                  </text>
                  <path
                    d="M 306 180 L 306 148 Q 306 138 316 138 L 344 138"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeLinecap="round" />
                  <polygon points="342,127 360,138 342,149" fill="#34d399" />
                  <circle r="3.5" fill="#a7f3d0">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path="M 306 180 L 306 138 L 352 138" />
                  </circle>
                  <text x="366" y="144" fill="#34d399" fontSize="11" fontWeight="800" letterSpacing="0.4">
                    RECOVERED
                  </text>
                  <text x="366" y="159" fill="#34d399" fontSize="11" fontWeight="800" letterSpacing="0.4">
                    METHANE
                  </text>
                  <g transform="translate(436, 122)">
                    <path
                      d="M 16 2 C 16 2, 30 14, 28 28 C 27 36, 20 42, 14 42 C 6 42, 0 35, 2 25 C 3 19, 8 15, 9 10 C 9 10, 12 15, 11 20 C 14 14, 16 7, 16 2 Z"
                      fill="#10b981" />
                    <path
                      d="M 15 16 C 15 16, 22 23, 21 31 C 20 36, 17 40, 13 40 C 9 40, 6 36, 8 30 C 9 26, 13 22, 15 16 Z"
                      fill="#a7f3d0" />
                  </g>
                  <rect
                    x="270"
                    y="330"
                    width="14"
                    height="20"
                    rx="2"
                    fill="#3b2c5a"
                    stroke="#8e74c4"
                    strokeWidth="1.2" />
                  <rect
                    x="392"
                    y="330"
                    width="14"
                    height="20"
                    rx="2"
                    fill="#3b2c5a"
                    stroke="#8e74c4"
                    strokeWidth="1.2" />
                  <rect x="264" y="346" width="26" height="6" rx="2" fill="#56437e" />
                  <rect x="386" y="346" width="26" height="6" rx="2" fill="#56437e" />
                  <rect
                    id="svg-box-capture"
                    x="258"
                    y="182"
                    width="160"
                    height="148"
                    rx="10"
                    fill="#24173d"
                    stroke="#c5b0f6"
                    strokeWidth="2.2" />
                  <rect
                    x="250"
                    y="178"
                    width="176"
                    height="14"
                    rx="4"
                    fill="url(#steelGrad)"
                    stroke="#c5b0f6"
                    strokeWidth="1.4" />
                  <rect
                    x="250"
                    y="318"
                    width="176"
                    height="14"
                    rx="4"
                    fill="url(#steelGrad)"
                    stroke="#c5b0f6"
                    strokeWidth="1.4" />
                  <g stroke="rgba(197,176,246,0.32)" strokeWidth="3" strokeLinecap="round">
                    <line x1="276" y1="196" x2="276" y2="286" />
                    <line x1="294" y1="196" x2="294" y2="286" />
                    <line x1="312" y1="196" x2="312" y2="286" />
                    <line x1="330" y1="196" x2="330" y2="286" />
                    <line x1="348" y1="196" x2="348" y2="286" />
                    <line x1="366" y1="196" x2="366" y2="286" />
                    <line x1="384" y1="196" x2="384" y2="286" />
                    <line x1="400" y1="196" x2="400" y2="286" />
                  </g>
                  <circle
                    className="rx-capture-microcapsule"
                    cx="285"
                    cy="222"
                    r="6.5"
                    fill="#8e74c4"
                    stroke="#ece8f7"
                    strokeWidth="1.2" />
                  <circle
                    className="rx-capture-microcapsule"
                    cx="312"
                    cy="244"
                    r="7.5"
                    fill="#7d67ae"
                    stroke="#ece8f7"
                    strokeWidth="1.2" />
                  <circle
                    className="rx-capture-microcapsule"
                    cx="338"
                    cy="214"
                    r="6"
                    fill="#9f86d6"
                    stroke="#ece8f7"
                    strokeWidth="1.2" />
                  <circle
                    className="rx-capture-microcapsule"
                    cx="356"
                    cy="256"
                    r="7"
                    fill="#7d67ae"
                    stroke="#ece8f7"
                    strokeWidth="1.2" />
                  <circle
                    className="rx-capture-microcapsule"
                    cx="384"
                    cy="228"
                    r="6.5"
                    fill="#9f86d6"
                    stroke="#ece8f7"
                    strokeWidth="1.2" />
                  <circle
                    className="rx-capture-microcapsule"
                    cx="302"
                    cy="272"
                    r="5.5"
                    fill="#8e74c4"
                    stroke="#ece8f7"
                    strokeWidth="1.2" />
                  <circle
                    className="rx-capture-microcapsule"
                    cx="372"
                    cy="272"
                    r="6"
                    fill="#8e74c4"
                    stroke="#ece8f7"
                    strokeWidth="1.2" />
                  <g
                    id="svg-stage-sensor"
                    className="rx-svg-subsystem"
                    style={{ cursor: "pointer" }}
                    data-svg-step="2">
                    <rect
                      id="svg-box-sensor"
                      x="268"
                      y="290"
                      width="140"
                      height="22"
                      rx="6"
                      fill="#140b24"
                      stroke="#fbbf24"
                      strokeWidth="1.4" />
                    <circle cx="282" cy="301" r="4.5" fill="#fbbf24">
                      <animate attributeName="r" values="3.5;5.5;3.5" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text
                      x="344"
                      y="305"
                      textAnchor="middle"
                      fill="#fde68a"
                      fontSize="9"
                      fontWeight="800"
                      letterSpacing="0.4">
                      OPTICAL SENSOR
                    </text>
                  </g>
                </g>
                <g id="svg-group-conduit1" className="rx-svg-subsystem">
                  <path
                    d="M 424 236 L 502 236 L 502 224 L 526 255 L 502 286 L 502 274 L 424 274 Z"
                    fill="url(#co2PipeGrad)"
                    stroke="#c5b0f6"
                    strokeWidth="1.4" />
                  <text x="482" y="260" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="800">
                    CO₂
                  </text>
                  <circle r="4.5" fill="#ece8f7" opacity="0.9">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path="M 432 248 L 460 248" />
                  </circle>
                  <circle r="3.5" fill="#c5b0f6" opacity="0.85">
                    <animateMotion
                      dur="1.8s"
                      begin="0.9s"
                      repeatCount="indefinite"
                      path="M 432 263 L 460 263" />
                  </circle>
                </g>
                <g
                  id="svg-stage-regen"
                  className="rx-svg-subsystem"
                  style={{ cursor: "pointer" }}
                  data-svg-step="4">
                  <g transform="translate(575, 18)">
                    <circle cx="58" cy="18" r="11" fill="#fbbf24" />
                    <g stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round">
                      <line x1="58" y1="1" x2="58" y2="4" />
                      <line x1="75" y1="18" x2="72" y2="18" />
                      <line x1="41" y1="18" x2="44" y2="18" />
                      <line x1="70" y1="6" x2="68" y2="8" />
                      <line x1="46" y1="6" x2="48" y2="8" />
                    </g>
                    <polygon
                      points="18,32 98,32 110,50 6,50"
                      fill="#3b2760"
                      stroke="#c5b0f6"
                      strokeWidth="1.5" />
                    <line x1="12" y1="41" x2="104" y2="41" stroke="rgba(197,176,246,0.55)" strokeWidth="1.2" />
                    <line x1="44" y1="32" x2="40" y2="50" stroke="rgba(197,176,246,0.55)" strokeWidth="1.2" />
                    <line x1="72" y1="32" x2="76" y2="50" stroke="rgba(197,176,246,0.55)" strokeWidth="1.2" />
                  </g>
                  <rect
                    x="528"
                    y="76"
                    width="210"
                    height="46"
                    rx="12"
                    fill="url(#amberHeaderGrad)"
                    stroke="#fde68a"
                    strokeWidth="1.5" />
                  <text
                    x="633"
                    y="96"
                    textAnchor="middle"
                    fill="#170e29"
                    fontSize="11.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    AUTOMATED
                  </text>
                  <text
                    x="633"
                    y="113"
                    textAnchor="middle"
                    fill="#170e29"
                    fontSize="11.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    REGENERATION
                  </text>
                  <line x1="633" y1="122" x2="633" y2="164" stroke="#f59e0b" strokeWidth="6" />
                  <polygon points="622,162 633,176 644,162" fill="#fbbf24" />
                  <rect
                    id="svg-box-regen"
                    x="528"
                    y="182"
                    width="210"
                    height="148"
                    rx="18"
                    fill="#2a1d47"
                    stroke="#fbbf24"
                    strokeWidth="2.2" />
                  <g
                    id="svg-stage-exchange"
                    className="rx-svg-subsystem"
                    style={{ cursor: "pointer" }}
                    data-svg-step="3">
                    <circle
                      id="svg-box-exchange"
                      cx="588"
                      cy="256"
                      r="46"
                      fill="#1b1030"
                      stroke="#c5b0f6"
                      strokeWidth="2.5" />
                    <g id="svg-wheel-sectors">
                      <path
                        d="M 588 216 A 40 40 0 0 1 624 238 L 608 246 A 22 22 0 0 0 588 234 Z"
                        fill="#f59e0b" />
                      <path
                        d="M 588 296 A 40 40 0 0 1 552 274 L 568 266 A 22 22 0 0 0 588 278 Z"
                        fill="#d97706" />
                      <path
                        d="M 552 238 A 40 40 0 0 1 588 216 L 588 234 A 22 22 0 0 0 568 246 Z"
                        fill="#7d67ae" />
                    </g>
                    <circle cx="588" cy="256" r="18" fill="#31224f" stroke="#ece8f7" strokeWidth="1.5" />
                    <text x="588" y="261" textAnchor="middle" fill="#fde68a" fontSize="14" fontWeight="800">
                      ↻
                    </text>
                  </g>
                  <g id="svg-stage-oven" className="rx-svg-subsystem">
                    <rect
                      id="svg-box-oven"
                      x="648"
                      y="198"
                      width="76"
                      height="116"
                      rx="10"
                      fill="url(#heatGlowGrad)"
                      stroke="#f59e0b"
                      strokeWidth="1.8" />
                    <g stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none">
                      <path d="M 668 282 Q 663 268 668 256 T 668 230">
                        <animate
                          attributeName="opacity"
                          values="0.45;1;0.45"
                          dur="1.8s"
                          repeatCount="indefinite" />
                      </path>
                      <path d="M 686 282 Q 681 268 686 256 T 686 230">
                        <animate
                          attributeName="opacity"
                          values="1;0.45;1"
                          dur="1.8s"
                          repeatCount="indefinite" />
                      </path>
                      <path d="M 704 282 Q 699 268 704 256 T 704 230">
                        <animate
                          attributeName="opacity"
                          values="0.6;1;0.6"
                          dur="1.8s"
                          begin="0.4s"
                          repeatCount="indefinite" />
                      </path>
                    </g>
                  </g>
                </g>
                <g id="svg-group-reuse" className="rx-svg-subsystem">
                  <path
                    d="M 686 330 L 686 384 Q 686 394 676 394 L 348 394 Q 338 394 338 384 L 338 346"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeLinecap="round" />
                  <polygon points="326,350 338,334 350,350" fill="#fbbf24" />
                  <text
                    x="512"
                    y="380"
                    textAnchor="middle"
                    fill="#fde68a"
                    fontSize="12"
                    fontWeight="800"
                    letterSpacing="1.2">
                    REUSE
                  </text>
                  <circle r="5.5" fill="#fde68a" stroke="#d97706" strokeWidth="1.5">
                    <animateMotion
                      dur="3.2s"
                      repeatCount="indefinite"
                      path="M 686 340 L 686 394 L 338 394 L 338 344" />
                  </circle>
                  <circle r="4.5" fill="#c5b0f6" stroke="#4a3570" strokeWidth="1.5">
                    <animateMotion
                      dur="3.2s"
                      begin="1.6s"
                      repeatCount="indefinite"
                      path="M 686 340 L 686 394 L 338 394 L 338 344" />
                  </circle>
                </g>
                <g id="svg-group-conduit2" className="rx-svg-subsystem">
                  <path
                    d="M 738 236 L 814 236 L 814 224 L 838 255 L 814 286 L 814 274 L 738 274 Z"
                    fill="url(#co2PipeGrad)"
                    stroke="#c5b0f6"
                    strokeWidth="1.4" />
                  <text x="794" y="260" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="800">
                    CO₂
                  </text>
                  <circle r="4.5" fill="#ece8f7" opacity="0.9">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path="M 746 248 L 772 248" />
                  </circle>
                  <circle r="3.5" fill="#c5b0f6" opacity="0.85">
                    <animateMotion
                      dur="1.8s"
                      begin="0.9s"
                      repeatCount="indefinite"
                      path="M 746 263 L 772 263" />
                  </circle>
                </g>
                <g
                  id="svg-group-compression"
                  className="rx-svg-subsystem"
                  style={{ cursor: "pointer" }}
                  data-svg-step="4">
                  <rect
                    x="826"
                    y="76"
                    width="206"
                    height="46"
                    rx="12"
                    fill="url(#tealHeaderGrad)"
                    stroke="#a7f3d0"
                    strokeWidth="1.5" />
                  <text
                    x="929"
                    y="96"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    CO₂ COLLECTION +
                  </text>
                  <text
                    x="929"
                    y="113"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    COMPRESSION
                  </text>
                  <g>
                    <rect
                      x="842"
                      y="330"
                      width="88"
                      height="10"
                      rx="3"
                      fill="#4a3570"
                      stroke="#c5b0f6"
                      strokeWidth="1.2" />
                    <rect
                      x="846"
                      y="276"
                      width="54"
                      height="54"
                      rx="6"
                      fill="url(#steelGrad)"
                      stroke="#c5b0f6"
                      strokeWidth="1.6" />
                    <line x1="854" y1="288" x2="892" y2="288" stroke="#c5b0f6" strokeWidth="2" />
                    <line x1="854" y1="298" x2="892" y2="298" stroke="#c5b0f6" strokeWidth="2" />
                    <line x1="854" y1="308" x2="892" y2="308" stroke="#c5b0f6" strokeWidth="2" />
                    <line x1="854" y1="318" x2="892" y2="318" stroke="#c5b0f6" strokeWidth="2" />
                    <rect
                      x="900"
                      y="268"
                      width="26"
                      height="62"
                      rx="8"
                      fill="#56437e"
                      stroke="#c5b0f6"
                      strokeWidth="1.6" />
                    <path
                      d="M 913 268 L 913 216 L 946 216"
                      fill="none"
                      stroke="#8e74c4"
                      strokeWidth="8"
                      strokeLinejoin="round" />
                  </g>
                  <g>
                    <rect
                      x="952"
                      y="328"
                      width="12"
                      height="22"
                      rx="2"
                      fill="#3b2c5a"
                      stroke="#c5b0f6"
                      strokeWidth="1.2" />
                    <rect
                      x="998"
                      y="328"
                      width="12"
                      height="22"
                      rx="2"
                      fill="#3b2c5a"
                      stroke="#c5b0f6"
                      strokeWidth="1.2" />
                    <rect
                      x="973"
                      y="148"
                      width="16"
                      height="12"
                      rx="3"
                      fill="#675394"
                      stroke="#c5b0f6"
                      strokeWidth="1.4" />
                    <rect
                      x="944"
                      y="160"
                      width="74"
                      height="172"
                      rx="28"
                      fill="url(#tankGrad)"
                      stroke="#c5b0f6"
                      strokeWidth="2" />
                    <circle cx="981" cy="200" r="13" fill="#ffffff" stroke="#4a3570" strokeWidth="2.5" />
                    <line
                      x1="981"
                      y1="200"
                      x2="988"
                      y2="193"
                      stroke="#dc2627"
                      strokeWidth="2"
                      strokeLinecap="round" />
                    <circle cx="981" cy="200" r="2" fill="#170e29" />
                    <rect
                      x="955"
                      y="236"
                      width="52"
                      height="28"
                      rx="6"
                      fill="#4a3570"
                      stroke="#a6e3d8"
                      strokeWidth="1.5" />
                    <text x="981" y="255" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="800">
                      CO₂
                    </text>
                  </g>
                </g>
                <g id="svg-badge-1" className="rx-svg-spotlight rx-is-visible">
                  <rect
                    x="252"
                    y="356"
                    width="172"
                    height="26"
                    rx="13"
                    fill="#4a3570"
                    stroke="#c5b0f6"
                    strokeWidth="1.8"
                    filter="url(#glowPurple)" />
                  <text
                    x="338"
                    y="373"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    ★ STEP 1: CO₂ CAPTURE
                  </text>
                </g>
                <g id="svg-badge-2" className="rx-svg-spotlight">
                  <rect
                    x="234"
                    y="356"
                    width="208"
                    height="26"
                    rx="13"
                    fill="#92400e"
                    stroke="#fde68a"
                    strokeWidth="1.8"
                    filter="url(#glowAmber)" />
                  <text
                    x="338"
                    y="373"
                    textAnchor="middle"
                    fill="#fef3c7"
                    fontSize="10.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    ★ STEP 2: SENSOR TRIGGERED
                  </text>
                </g>
                <g id="svg-badge-3" className="rx-svg-spotlight">
                  <rect
                    x="484"
                    y="338"
                    width="208"
                    height="26"
                    rx="13"
                    fill="#4a3570"
                    stroke="#fde68a"
                    strokeWidth="1.8"
                    filter="url(#glowAmber)" />
                  <text
                    x="588"
                    y="355"
                    textAnchor="middle"
                    fill="#fde68a"
                    fontSize="10.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    ★ STEP 3: CARTRIDGE SWAP
                  </text>
                </g>
                <g id="svg-badge-4" className="rx-svg-spotlight">
                  <rect
                    x="640"
                    y="138"
                    width="228"
                    height="26"
                    rx="13"
                    fill="#92400e"
                    stroke="#fde68a"
                    strokeWidth="1.8"
                    filter="url(#glowAmber)" />
                  <text
                    x="754"
                    y="155"
                    textAnchor="middle"
                    fill="#fef3c7"
                    fontSize="10.5"
                    fontWeight="800"
                    letterSpacing="0.6">
                    ★ STEP 4: THERMAL REGEN &amp; REUSE
                  </text>
                </g>
              </svg>
            </div>
          </div>
          <div className="rx-grid-4" style={{ marginTop: "2rem", maxWidth: "70rem", marginInline: "auto" }}>
            <button
              type="button"
              className="rx-interactive-step-card rx-is-active"
              data-step="1"
              data-step-desc="Step 1 Active: Selective CO₂ media filter captures CO₂ as landfill gas flows through while allowing purified CH₄ to pass to recovery.">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="rx-step-badge">
                  1
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary)" }}>
                  Selective CO₂ media filter
                </h3>
              </div>
              <p
                style={{ marginTop: "0.875rem", fontSize: "0.9rem", lineHeight: "1.55", color: "var(--muted-foreground)" }}>
                Captures CO₂ as landfill gas flows through
              </p>
            </button>
            {" "}
            <button
              type="button"
              className="rx-interactive-step-card"
              data-step="2"
              data-step-desc="Step 2 Active: Optical sensing window detects the colorimetric shift (purple to gold) when the cartridge reaches CO₂ saturation.">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="rx-step-badge">
                  2
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary)" }}>
                  Optical sensing
                </h3>
              </div>
              <p
                style={{ marginTop: "0.875rem", fontSize: "0.9rem", lineHeight: "1.55", color: "var(--muted-foreground)" }}>
                Detects when the cartridge is saturated
              </p>
            </button>
            {" "}
            <button
              type="button"
              className="rx-interactive-step-card"
              data-step="3"
              data-step-desc="Step 3 Active: Automated vertical shuttle swaps the saturated cartridge with a fresh reserve cartridge without interrupting gas flow.">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="rx-step-badge">
                  3
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary)" }}>
                  Automated cartridge exchange
                </h3>
              </div>
              <p
                style={{ marginTop: "0.875rem", fontSize: "0.9rem", lineHeight: "1.55", color: "var(--muted-foreground)" }}>
                Swaps cartridges without stopping flow
              </p>
            </button>
            {" "}
            <button
              type="button"
              className="rx-interactive-step-card"
              data-step="4"
              data-step-desc="Step 4 Active: Low-energy thermal regeneration chamber releases pure CO₂ for compression and restores the cartridge media for reuse.">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="rx-step-badge">
                  4
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary)" }}>
                  Low-energy regeneration
                </h3>
              </div>
              <p
                style={{ marginTop: "0.875rem", fontSize: "0.9rem", lineHeight: "1.55", color: "var(--muted-foreground)" }}>
                Releases CO₂ for collection; media is reused
              </p>
            </button>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="rx-section rx-section--white" aria-labelledby="how-title">
        <div className="rx-container-page">
          <div className="rx-section-header">
            <p className="rx-eyebrow">
              How It Works
            </p>
            <h2 id="how-title" className="rx-section-heading" style={{ marginTop: "0.5rem" }}>
              Our platform captures, senses and regenerates
            </h2>
            <p className="rx-section-subtitle">
              Demonstrated cartridge architecture and reversible colorimetric optical sensor response across the CO₂ capture and thermal regeneration cycle.
            </p>
          </div>
          <div className="rx-split-layout rx-split-layout--stretch">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="rx-media-frame rx-media-frame--overlay-caption">
                <div className="rx-cartridge-panels">
                  <figure className="rx-cartridge-panel rx-is-active" data-panel="A">
                    <img
                      src="/images/environment/panel-a.webp"
                      alt="Panel A: KorganoTech prototype cartridge with CO2 capture media integrated with a MERV 13 pleated particulate layer."
                      width="1024"
                      height="1024"
                      loading="lazy"
                      decoding="async" />
                    <span className="rx-cartridge-panel__tag">
                      A
                    </span>
                  </figure>
                  <figure className="rx-cartridge-panel" data-panel="B">
                    <img
                      src="/images/environment/panel-b.webp"
                      alt="Panel B: cartridge with gas-entry and gas-exit architecture."
                      width="1024"
                      height="1024"
                      loading="lazy"
                      decoding="async" />
                    <span className="rx-cartridge-panel__tag">
                      B
                    </span>
                  </figure>
                  <figure className="rx-cartridge-panel" data-panel="C">
                    <img
                      src="/images/environment/panel-c.webp"
                      alt="Panel C: central optical sensor window showing the visible sensor response after CO2 absorption."
                      width="1024"
                      height="1024"
                      loading="lazy"
                      decoding="async" />
                    <span className="rx-cartridge-panel__tag">
                      C
                    </span>
                  </figure>
                  <figure className="rx-cartridge-panel" data-panel="D">
                    <img
                      src="/images/environment/panel-d.webp"
                      alt="Panel D: optical sensor window restored after heat-assisted CO2 removal."
                      width="1024"
                      height="1024"
                      loading="lazy"
                      decoding="async" />
                    <span className="rx-cartridge-panel__tag">
                      D
                    </span>
                  </figure>
                </div>
                <div className="rx-media-frame__caption rx-media-frame__caption--overlay rx-media-frame__caption--static">
                  <span id="cartridge-inspector-text">
                    <strong style={{ color: "var(--lilac-highlight)" }}>
                      Active Selection:
                    </strong>
                    {" "}Panel A: CO₂ capture media integrated with a MERV 13 particulate layer
                  </span>
                  {" "}
                  <span
                    className="rx-eyebrow rx-eyebrow--teal"
                    style={{ fontSize: "0.6875rem", flexShrink: "0" }}>
                    Panels A–D
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.5rem" }}>
              <div className="rx-grid-2" style={{ gap: "0.875rem" }}>
                <button
                  type="button"
                  className="rx-cartridge-callout-btn rx-is-active"
                  data-panel="A"
                  data-panel-text="Panel A: CO₂ capture media integrated with a MERV 13 particulate layer">
                  <span className="rx-step-badge">
                    A
                  </span>
                  {" "}
                  <span
                    style={{ fontSize: "0.9rem", fontWeight: "600", lineHeight: "1.45", color: "var(--foreground)" }}>
                    CO₂ capture media integrated with a MERV 13 particulate layer
                  </span>
                </button>
                {" "}
                <button
                  type="button"
                  className="rx-cartridge-callout-btn"
                  data-panel="B"
                  data-panel-text="Panel B: Gas-entry and gas-exit cartridge architecture">
                  <span className="rx-step-badge">
                    B
                  </span>
                  {" "}
                  <span
                    style={{ fontSize: "0.9rem", fontWeight: "600", lineHeight: "1.45", color: "var(--foreground)" }}>
                    Gas-entry and gas-exit cartridge architecture
                  </span>
                </button>
                {" "}
                <button
                  type="button"
                  className="rx-cartridge-callout-btn"
                  data-panel="C"
                  data-panel-text="Panel C: Visible sensor response after CO₂ absorption (color shift signals saturation)">
                  <span className="rx-step-badge">
                    C
                  </span>
                  {" "}
                  <span
                    style={{ fontSize: "0.9rem", fontWeight: "600", lineHeight: "1.45", color: "var(--foreground)" }}>
                    Visible sensor response after CO₂ absorption
                  </span>
                </button>
                {" "}
                <button
                  type="button"
                  className="rx-cartridge-callout-btn"
                  data-panel="D"
                  data-panel-text="Panel D: Sensor restored after heat-assisted CO₂ removal (ready for next capture cycle)">
                  <span className="rx-step-badge">
                    D
                  </span>
                  {" "}
                  <span
                    style={{ fontSize: "0.9rem", fontWeight: "600", lineHeight: "1.45", color: "var(--foreground)" }}>
                    Sensor restored after heat-assisted CO₂ removal
                  </span>
                </button>
              </div>
              <div className="rx-capsule-simulator">
                <div
                  style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.875rem" }}>
                  <div
                    style={{ width: "100%", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <p className="rx-eyebrow">
                      Interactive Colorimetric Sorbent Explorer
                    </p>
                    <span
                      id="capsule-sim-badge"
                      className="rx-pill-badge"
                      style={{ background: "#f3e8ff", borderColor: "#d8b4fe", color: "#6b21a8" }}>
                      <span className="rx-pill-badge__dot" style={{ background: "#8b2d8c" }} />
                      {" "}Optical Sensor: Ready
                    </span>
                  </div>
                  <h3
                    id="capsule-sim-title"
                    style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary)", lineHeight: "1.35" }}>
                    State (a): No CO₂ — Ready for Capture (Purple)
                  </h3>
                </div>
                <div className="rx-capsule-simulator__stage">
                  <div>
                    <img
                      src="/images/environment/image5.webp"
                      alt="Microscopy images a, b, and c showing purple microcapsules with no CO2, yellow/gold microcapsules after CO2 is absorbed, and purple microcapsules after regeneration."
                      style={{ width: "100%", borderRadius: "0.625rem" }}
                      width="636"
                      height="147"
                      loading="lazy"
                      decoding="async" />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0.5rem" }}>
                    <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">
                      <circle
                        cx="55"
                        cy="55"
                        r="46"
                        fill="none"
                        stroke="#7d67ae"
                        strokeWidth="4"
                        strokeDasharray="6 3" />
                      <circle
                        id="sim-capsule-core"
                        cx="55"
                        cy="55"
                        r="38"
                        fill="#8b2d8c"
                        style={{ transition: "fill 0.45s ease" }} />
                      <circle cx="42" cy="40" r="10" fill="rgba(255,255,255,0.22)" />
                      <text
                        id="sim-capsule-label"
                        x="55"
                        y="59"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="800">
                        CO₃²⁻
                      </text>
                    </svg>
                    {" "}
                    <span id="sim-capsule-sub" className="rx-capsule-simulator__sublabel">
                      High pH · Unloaded carbonate core
                    </span>
                  </div>
                </div>
                <div
                  className="rx-capsule-stage-btns"
                  role="group"
                  aria-label="Select microcapsule cycle state">
                  <button type="button" className="rx-capsule-stage-btn rx-is-active" data-cap-state="a">
                    <span className="rx-progression-steps__dot" style={{ backgroundColor: "#8b2d8c" }} />
                    {" "}(a) No CO₂
                  </button>
                  {" "}
                  <button type="button" className="rx-capsule-stage-btn" data-cap-state="b">
                    <span className="rx-progression-steps__dot" style={{ backgroundColor: "#d49b27" }} />
                    {" "}(b) CO₂ absorbed
                  </button>
                  {" "}
                  <button type="button" className="rx-capsule-stage-btn" data-cap-state="c">
                    <span className="rx-progression-steps__dot" style={{ backgroundColor: "#8b2d8c" }} />
                    {" "}(c) Regenerated
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="llnl-science" className="rx-section rx-section--tint" aria-labelledby="llnl-title">
        <div className="rx-container-page">
          <div className="rx-section-header">
            <p className="rx-eyebrow">
              Laboratory Validation
            </p>
            <h2 id="llnl-title" className="rx-section-heading" style={{ marginTop: "0.5rem" }}>
              Built on proven LLNL capture science
            </h2>
            <p className="rx-section-subtitle">
              Encapsulating liquid carbonate sorbent inside high-permeability microcapsules dramatically increases surface area and CO₂ uptake speed while retaining cycle durability.
            </p>
          </div>
          <div className="rx-split-layout">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="rx-llnl-stats-grid">
                <article className="rx-surface-card rx-surface-card--glow rx-stat-card">
                  <p className="rx-stat-card__value">
                    ~10×
                  </p>
                  <p className="rx-stat-card__label">
                    faster CO₂ absorption than the same liquid sorbent un-encapsulated
                  </p>
                </article>
                <article className="rx-surface-card rx-surface-card--glow rx-stat-card">
                  <p className="rx-stat-card__value">
                    ≥90%
                  </p>
                  <p className="rx-stat-card__label">
                    of absorption rate retained after 10 full capture–release cycles
                  </p>
                </article>
                <article className="rx-surface-card rx-surface-card--glow rx-stat-card">
                  <p className="rx-stat-card__value">
                    80
                  </p>
                  <p className="rx-stat-card__label">
                    cycles run with no observed material degradation
                  </p>
                </article>
              </div>
              <div className="rx-callout-box">
                <p style={{ fontSize: "1rem", fontWeight: "800", color: "var(--primary)" }}>
                  Sorbent capacity of 7.1 wt% CO₂ — on par with MEA (6.9 wt%), today&apos;s commercial benchmark.
                </p>
                <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
                  <div>
                    <div
                      className="rx-benchmark-bar__header"
                      style={{ fontWeight: "700", color: "var(--primary)" }}>
                      <span>
                        Encapsulated Carbonate Microcapsules (LLNL)
                      </span>
                      {" "}
                      <span className="rx-benchmark-bar__val">
                        7.1 wt% CO₂
                      </span>
                    </div>
                    <div className="rx-chart-row__track" style={{ height: "0.75rem" }}>
                      <div className="rx-chart-row__fill rx-chart-row__fill--caps" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div>
                    <div
                      className="rx-benchmark-bar__header"
                      style={{ fontWeight: "600", color: "var(--muted-foreground)" }}>
                      <span>
                        Commercial Benchmark: Monoethanolamine (MEA)
                      </span>
                      {" "}
                      <span className="rx-benchmark-bar__val" style={{ color: "var(--primary)" }}>
                        6.9 wt% CO₂
                      </span>
                    </div>
                    <div className="rx-chart-row__track" style={{ height: "0.75rem" }}>
                      <div className="rx-chart-row__fill rx-chart-row__fill--neat" style={{ width: "89%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <p className="rx-source-note" style={{ marginTop: "0.25rem" }}>
                Source: Vericella, J.J. et al.,{" "}
                <em>
                  Nature Communications
                </em>
                {" "}6:6124 (2015), LLNL. Gram-scale lab data; values approximate (Fig. 3i). Pilot and commercial-scale testing required.
              </p>
            </div>
            <div
              className="rx-surface-card rx-chart-card"
              role="region"
              aria-label="Bar chart comparing CO2 absorption rate of encapsulated microcapsules versus neat liquid sorbent">
              <div
                style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <h3 className="rx-chart-title">
                  CO₂ absorption rate: capsules vs. neat liquid sorbent
                </h3>
                <div
                  style={{ display: "inline-flex", gap: "0.25rem", background: "var(--muted)", padding: "0.25rem", borderRadius: "99px" }}>
                  <button
                    type="button"
                    className="rx-catalyst-filter-btn rx-view-tabs__btn rx-is-active"
                    style={{ padding: "0.25rem 0.65rem", fontSize: "0.7rem" }}
                    data-cat="all">
                    All
                  </button>
                  {" "}
                  <button
                    type="button"
                    className="rx-catalyst-filter-btn rx-view-tabs__btn"
                    style={{ padding: "0.25rem 0.65rem", fontSize: "0.7rem" }}
                    data-cat="0">
                    0 mM
                  </button>
                  {" "}
                  <button
                    type="button"
                    className="rx-catalyst-filter-btn rx-view-tabs__btn"
                    style={{ padding: "0.25rem 0.65rem", fontSize: "0.7rem" }}
                    data-cat="25">
                    25 mM
                  </button>
                  {" "}
                  <button
                    type="button"
                    className="rx-catalyst-filter-btn rx-view-tabs__btn"
                    style={{ padding: "0.25rem 0.65rem", fontSize: "0.7rem" }}
                    data-cat="50">
                    50 mM
                  </button>
                </div>
              </div>
              <div className="rx-chart-legend">
                <span className="rx-chart-legend__item">
                  <span
                    className="rx-chart-legend__swatch"
                    style={{ backgroundImage: "var(--gradient-brand)" }} />
                  {" "}Encapsulated microcapsules
                </span>
                {" "}
                <span className="rx-chart-legend__item">
                  <span className="rx-chart-legend__swatch" style={{ backgroundColor: "#9589b0" }} />
                  {" "}Neat liquid sorbent
                </span>
              </div>
              <div className="rx-chart-groups">
                <div className="rx-chart-group" data-cat-group="0">
                  <div className="rx-chart-group__label">
                    <span>
                      0 mM catalyst
                    </span>
                    {" "}
                    <span className="rx-pill-badge" style={{ padding: "0.15rem 0.6rem", fontSize: "0.7rem" }}>
                      ~9.9× faster uptake
                    </span>
                  </div>
                  <div className="rx-chart-row">
                    <span className="rx-chart-row__series">
                      Encapsulated microcapsules
                    </span>
                    <div className="rx-chart-row__track">
                      <div className="rx-chart-row__fill rx-chart-row__fill--caps" style={{ width: "82.3%" }} />
                    </div>
                    <span className="rx-chart-row__val">
                      790
                    </span>
                  </div>
                  <div className="rx-chart-row">
                    <span className="rx-chart-row__series">
                      Neat liquid sorbent
                    </span>
                    <div className="rx-chart-row__track">
                      <div className="rx-chart-row__fill rx-chart-row__fill--neat" style={{ width: "8.3%" }} />
                    </div>
                    <span className="rx-chart-row__val">
                      80
                    </span>
                  </div>
                </div>
                <div className="rx-chart-group" data-cat-group="25">
                  <div className="rx-chart-group__label">
                    <span>
                      25 mM catalyst
                    </span>
                    {" "}
                    <span className="rx-pill-badge" style={{ padding: "0.15rem 0.6rem", fontSize: "0.7rem" }}>
                      ~9.5× faster uptake
                    </span>
                  </div>
                  <div className="rx-chart-row">
                    <span className="rx-chart-row__series">
                      Encapsulated microcapsules
                    </span>
                    <div className="rx-chart-row__track">
                      <div
                        className="rx-chart-row__fill rx-chart-row__fill--caps"
                        style={{ width: "93.75%" }} />
                    </div>
                    <span className="rx-chart-row__val">
                      900
                    </span>
                  </div>
                  <div className="rx-chart-row">
                    <span className="rx-chart-row__series">
                      Neat liquid sorbent
                    </span>
                    <div className="rx-chart-row__track">
                      <div className="rx-chart-row__fill rx-chart-row__fill--neat" style={{ width: "9.9%" }} />
                    </div>
                    <span className="rx-chart-row__val">
                      95
                    </span>
                  </div>
                </div>
                <div className="rx-chart-group" data-cat-group="50">
                  <div className="rx-chart-group__label">
                    <span>
                      50 mM catalyst
                    </span>
                    {" "}
                    <span className="rx-pill-badge" style={{ padding: "0.15rem 0.6rem", fontSize: "0.7rem" }}>
                      ~9.1× faster uptake
                    </span>
                  </div>
                  <div className="rx-chart-row">
                    <span className="rx-chart-row__series">
                      Encapsulated microcapsules
                    </span>
                    <div className="rx-chart-row__track">
                      <div className="rx-chart-row__fill rx-chart-row__fill--caps" style={{ width: "100%" }} />
                    </div>
                    <span className="rx-chart-row__val">
                      960
                    </span>
                  </div>
                  <div className="rx-chart-row">
                    <span className="rx-chart-row__series">
                      Neat liquid sorbent
                    </span>
                    <div className="rx-chart-row__track">
                      <div className="rx-chart-row__fill rx-chart-row__fill--neat" style={{ width: "10.9%" }} />
                    </div>
                    <span className="rx-chart-row__val">
                      105
                    </span>
                  </div>
                </div>
              </div>
              <p className="rx-source-note" style={{ marginTop: "1.25rem", fontSize: "0.75rem" }}>
                Values from Vericella et al. (2015) Fig. 3i (approximate gram-scale laboratory absorption rate).
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="case-study" className="rx-section rx-section--white" aria-labelledby="case-study-title">
        <div className="rx-container-page">
          <div className="rx-section-header">
            <p className="rx-eyebrow">
              CASE STUDY · ORANGE COUNTY LANDFILL GAS
            </p>
            <h2 id="case-study-title" className="rx-section-heading" style={{ marginTop: "0.5rem" }}>
              What one county&apos;s landfill gas could become
            </h2>
            <p className="rx-section-subtitle">
              Combined landfill-gas flow modeled at ~15,000 CFM — about 7.88 billion standard cubic feet a year.
            </p>
          </div>
          <div className="rx-pipeline-grid" style={{ maxWidth: "72rem", marginInline: "auto" }}>
            <article
              className="rx-surface-card rx-surface-card--interactive"
              style={{ padding: "2.25rem 1.75rem", textAlign: "center", background: "var(--night)", color: "#ffffff", borderColor: "var(--night)" }}>
              <span className="rx-eyebrow rx-eyebrow--light" style={{ fontSize: "0.6875rem" }}>
                Countywide Input (~15,000 CFM)
              </span>
              <div
                style={{ width: "4.25rem", height: "4.25rem", margin: "1rem auto 0", display: "grid", placeItems: "center", borderRadius: "1.125rem", backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <img
                  src="/images/program/environmental/image6.png"
                  alt="Raw landfill gas cloud icon"
                  style={{ width: "2.5rem", height: "2.5rem", objectFit: "contain" }}
                  width="256"
                  height="256"
                  loading="lazy"
                  decoding="async" />
              </div>
              <p className="rx-stat-card__value" style={{ marginTop: "1.125rem", color: "#ffffff" }}>
                7.88B
              </p>
              <p className="rx-stat-card__unit" style={{ color: "var(--lilac-highlight)" }}>
                scf / yr
              </p>
              <p
                style={{ marginTop: "0.75rem", fontSize: "1rem", fontWeight: "700", color: "rgba(255,255,255,0.92)" }}>
                Raw landfill gas — the county problem
              </p>
            </article>
            <div className="rx-pipeline-arrow" aria-hidden="true" title="Separated by KorganoTech Platform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <article
              className="rx-surface-card rx-surface-card--interactive rx-surface-card--glow"
              style={{ padding: "2.25rem 1.75rem", textAlign: "center", borderWidth: "2px", borderColor: "var(--brand)" }}>
              <span className="rx-eyebrow" style={{ fontSize: "0.6875rem" }}>
                Valuable Output #1 · Clean Energy
              </span>
              <div
                style={{ width: "4.25rem", height: "4.25rem", margin: "1rem auto 0", display: "grid", placeItems: "center", borderRadius: "1.125rem", backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
                <img
                  src="/images/program/environmental/image7.png"
                  alt="Renewable methane flame icon"
                  style={{ width: "2.5rem", height: "2.5rem", objectFit: "contain" }}
                  width="256"
                  height="256"
                  loading="lazy"
                  decoding="async" />
              </div>
              <p className="rx-stat-card__value" style={{ marginTop: "1.125rem" }}>
                3.745B
              </p>
              <p className="rx-stat-card__unit">
                scf / yr
              </p>
              <p
                style={{ marginTop: "0.75rem", fontSize: "1rem", fontWeight: "700", color: "var(--foreground)" }}>
                Renewable methane recovered as energy
              </p>
            </article>
            <article
              className="rx-surface-card rx-surface-card--interactive rx-surface-card--glow"
              style={{ padding: "2.25rem 1.75rem", textAlign: "center", borderWidth: "2px", borderColor: "#a7f3d0" }}>
              <span className="rx-eyebrow" style={{ fontSize: "0.6875rem", color: "var(--success)" }}>
                Valuable Output #2 · Carbon Capture
              </span>
              <div
                style={{ width: "4.25rem", height: "4.25rem", margin: "1rem auto 0", display: "grid", placeItems: "center", borderRadius: "1.125rem", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                <img
                  src="/images/program/environmental/image8.png"
                  alt="Captured CO2 leaf icon"
                  style={{ width: "2.5rem", height: "2.5rem", objectFit: "contain" }}
                  width="256"
                  height="256"
                  loading="lazy"
                  decoding="async" />
              </div>
              <p className="rx-stat-card__value" style={{ marginTop: "1.125rem" }}>
                186,614
              </p>
              <p className="rx-stat-card__unit" style={{ color: "var(--success)" }}>
                metric tons / yr
              </p>
              <p
                style={{ marginTop: "0.75rem", fontSize: "1rem", fontWeight: "700", color: "var(--foreground)" }}>
                CO₂ captured instead of released
              </p>
            </article>
          </div>
          <div
            className="rx-impact-calculator"
            style={{ maxWidth: "72rem", marginInline: "auto" }}
            role="region"
            aria-label="Interactive Landfill Flow Rate Impact Calculator">
            <div
              style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <span className="rx-eyebrow rx-eyebrow--teal">
                  Interactive Facility Estimator
                </span>
                <h3
                  style={{ fontSize: "1.35rem", fontWeight: "800", color: "#ffffff", marginTop: "0.25rem" }}>
                  Model Your Landfill’s Annual Methane &amp; CO₂ Potential
                </h3>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                <button type="button" className="rx-cfm-preset-btn" data-cfm="2500">
                  2,500 CFM (Municipal)
                </button>
                {" "}
                <button type="button" className="rx-cfm-preset-btn" data-cfm="7500">
                  7,500 CFM (Regional)
                </button>
                {" "}
                <button type="button" className="rx-cfm-preset-btn rx-is-active" data-cfm="15000">
                  15,000 CFM (Orange County)
                </button>
                {" "}
                <button type="button" className="rx-cfm-preset-btn" data-cfm="25000">
                  25,000 CFM (Mega-Site)
                </button>
              </div>
            </div>
            <div
              style={{ marginTop: "1.25rem", background: "rgba(255,255,255,0.06)", padding: "1.15rem 1.25rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div
                style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.25rem 1rem" }}>
                <label
                  htmlFor="cfm-range"
                  style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--lilac-highlight)" }}>
                  Facility Landfill-Gas Flow Rate:
                </label>
                {" "}
                <span
                  id="calc-cfm-display"
                  style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--teal-highlight)", fontVariantNumeric: "tabular-nums" }}>
                  15,000 CFM
                </span>
              </div>
              <input
                id="cfm-range"
                type="range"
                min="1000"
                max="25000"
                step="500"
                defaultValue="15000"
                className="rx-cfm-slider" />
              <div
                style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.25rem 0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", fontWeight: "600" }}>
                <span>
                  1,000 CFM
                </span>
                {" "}
                <span>
                  7,500 CFM
                </span>
                {" "}
                <span>
                  15,000 CFM (OC Benchmark)
                </span>
                {" "}
                <span>
                  25,000 CFM
                </span>
              </div>
            </div>
            <div className="rx-grid-3" style={{ marginTop: "1.25rem", gap: "1rem" }}>
              <div className="rx-hero-glass-card" style={{ padding: "1.25rem" }}>
                <span className="rx-eyebrow rx-eyebrow--light" style={{ fontSize: "0.6875rem" }}>
                  Modeled Raw Gas Input
                </span>
                <p
                  id="calc-raw-scf"
                  style={{ fontSize: "1.85rem", fontWeight: "800", color: "#ffffff", marginTop: "0.35rem", fontVariantNumeric: "tabular-nums" }}>
                  7.88B
                </p>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "rgba(255,255,255,0.7)" }}>
                  scf / yr total landfill gas
                </span>
              </div>
              <div
                className="rx-hero-glass-card"
                style={{ padding: "1.25rem", borderColor: "rgba(251, 191, 36, 0.35)" }}>
                <span className="rx-eyebrow" style={{ fontSize: "0.6875rem", color: "#fde68a" }}>
                  Recoverable Renewable Methane
                </span>
                <p
                  id="calc-ch4-scf"
                  style={{ fontSize: "1.85rem", fontWeight: "800", color: "#fde68a", marginTop: "0.35rem", fontVariantNumeric: "tabular-nums" }}>
                  3.745B
                </p>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "rgba(255,255,255,0.78)" }}>
                  scf / yr renewable energy stream
                </span>
              </div>
              <div
                className="rx-hero-glass-card"
                style={{ padding: "1.25rem", borderColor: "rgba(52, 211, 153, 0.4)" }}>
                <span className="rx-eyebrow rx-eyebrow--teal" style={{ fontSize: "0.6875rem" }}>
                  Captured Carbon Dioxide
                </span>
                <p
                  id="calc-co2-tons"
                  style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--teal-highlight)", marginTop: "0.35rem", fontVariantNumeric: "tabular-nums" }}>
                  186,614
                </p>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "rgba(255,255,255,0.78)" }}>
                  metric tons CO₂ / yr captured
                </span>
              </div>
            </div>
          </div>
          <p
            className="rx-source-note"
            style={{ textAlign: "center", maxWidth: "48rem", marginInline: "auto", marginTop: "1.75rem" }}>
            Countywide screening-model estimates after successful validation and scale-up — not expected output from the initial demonstration.
          </p>
        </div>
      </section>
      <section
        id="contact"
        className="rx-container-page"
        style={{ paddingTop: "1rem", paddingBottom: "2rem" }}
        aria-labelledby="contact-title">
        <div className="rx-cta-banner">
          <div className="rx-cta-banner__grid">
            <div>
              <span className="rx-pill-badge rx-pill-badge--dark">
                <span className="rx-pill-badge__dot" />
                {" "}Interested?
              </span>
              <h2
                id="contact-title"
                style={{ marginTop: "1rem", fontSize: "clamp(1.85rem, 3.2vw, 2.75rem)", fontWeight: "800", lineHeight: "1.1" }}>
                KorganoTech Environmental Air Filters
              </h2>
              <p
                style={{ marginTop: "1rem", fontSize: "1.125rem", lineHeight: "1.6", color: "rgba(255, 255, 255, 0.85)", maxWidth: "36rem" }}>
                <strong>
                  Landfill Operators:
                </strong>
                {" "}Let&apos;s talk about turning your gas into renewable methane and captured carbon.
              </p>
              <div style={{ marginTop: "1.75rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <a href="mailto:CO2@KorganoTech.com" className="rx-btn rx-btn--white">
                  Email CO2@KorganoTech.com{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
                {" "}
                <a href="tel:925-989-8726" className="rx-btn rx-btn--outline-light">
                  Call 925-989-8726
                </a>
              </div>
            </div>
            <div className="rx-contact-card">
              <h3
                style={{ fontSize: "1.125rem", fontWeight: "800", marginBottom: "1.25rem", color: "#ffffff" }}>
                Contact us
              </h3>
              <ul className="rx-contact-list">
                <li className="rx-contact-list__item">
                  <span className="rx-contact-list__icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true">
                      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                    </svg>
                  </span>
                  <div>
                    <span
                      style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)" }}>
                      Email
                    </span>
                    {" "}
                    <a href="mailto:CO2@KorganoTech.com" className="rx-contact-list__link">
                      CO2@KorganoTech.com
                    </a>
                  </div>
                </li>
                <li className="rx-contact-list__item">
                  <span className="rx-contact-list__icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true">
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <div>
                    <span
                      style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)" }}>
                      Phone
                    </span>
                    {" "}
                    <a href="tel:925-989-8726" className="rx-contact-list__link">
                      925-989-8726
                    </a>
                  </div>
                </li>
                <li className="rx-contact-list__item">
                  <span className="rx-contact-list__icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true">
                      <path
                        d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div>
                    <span
                      style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)" }}>
                      Headquarters
                    </span>
                    {" "}
                    <span>
                      69 E Airway Blvd, Livermore, CA 94551
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="rx-tagline-pill">
            <span>
              Clean air is where we started
            </span>
            {" "}
            <span aria-hidden="true">
              ·
            </span>
            {" "}
            <span style={{ color: "#ffffff" }}>
              Climate is where we&apos;re going
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

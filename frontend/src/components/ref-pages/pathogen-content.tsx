/* eslint-disable @next/next/no-img-element */
// Static markup ported from the client's approved preview. Interactions live in ref-root.tsx.
import Link from "next/link";

export function PathogenContent() {
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
              Pathogen Air Filters
            </span>
          </nav>
          <div className="rx-hero-showcase">
            <div className="rx-hero-grid">
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.625rem" }}>
                  <span className="rx-pill-badge rx-pill-badge--dark">
                    <span className="rx-pill-badge__dot" />
                    {" "}Technology Under Development*
                  </span>
                  {" "}
                  <span className="rx-pill-badge rx-pill-badge--amber-dark">
                    <span className="rx-pill-badge__dot" />
                    {" "}Information Only · Not for Sale
                  </span>
                </div>
                <h1 id="hero-title" className="rx-hero-title">
                  KorganoTech{" "}
                  <span className="rx-text-gradient-lilac">
                    Pathogen Air Filter
                  </span>
                </h1>
                <p className="rx-hero-lead">
                  KorganoTech is developing a nanotechnology-based air filter designed to effectively capture and neutralize airborne pathogens, ensuring cleaner and safer indoor environments.
                </p>
                <div className="rx-hero-actions">
                  <a href="#contact" className="rx-btn rx-btn--white">
                    Development partnership inquiries{" "}
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
                  <a href="#nanotechnology" className="rx-btn rx-btn--outline-light">
                    Explore nanotechnology &amp; BMPs
                  </a>
                </div>
                <div className="rx-hero-glass-card" style={{ marginTop: "1.75rem", padding: "1rem 1.25rem" }}>
                  <p style={{ fontSize: "0.8rem", lineHeight: "1.55", color: "rgba(255, 255, 255, 0.82)" }}>
                    <strong style={{ color: "var(--lilac-highlight)" }}>
                      *Disclaimer:
                    </strong>
                    {" "}The KorganoTech Pathogen Air Filter is currently in the research and development phase and is not yet commercially available. Information presented on KorganoTech Pathogen Air Filters is intended for investor and informational purposes only and should not be construed as an endorsement, claim, or guarantee of performance until validated through regulatory approvals.
                  </p>
                </div>
              </div>
              <div>
                <div className="rx-hero-glass-card" style={{ padding: "1rem" }}>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span className="rx-eyebrow rx-eyebrow--teal" style={{ fontSize: "0.6875rem" }}>
                      Side-by-Side Filtration Concept
                    </span>
                    <div
                      style={{ display: "inline-flex", gap: "0.25rem", background: "rgba(0,0,0,0.35)", padding: "0.2rem", borderRadius: "99px" }}>
                      <button
                        type="button"
                        className="rx-hero-vis-btn rx-view-tabs__btn rx-is-active"
                        style={{ padding: "0.25rem 0.65rem", fontSize: "0.7rem", color: "#fff" }}
                        data-hero-vis="gif">
                        Animated Concept
                      </button>
                      {" "}
                      <button
                        type="button"
                        className="rx-hero-vis-btn rx-view-tabs__btn"
                        style={{ padding: "0.25rem 0.65rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.75)" }}
                        data-hero-vis="svg">
                        Nanowire Diagram
                      </button>
                    </div>
                  </div>
                  <div
                    id="hero-vis-gif"
                    style={{ borderRadius: "1rem", overflow: "hidden", background: "#000", border: "1px solid rgba(197, 176, 246, 0.25)" }}>
                    <img
                      src="/images/program/pathogen/image1.gif"
                      alt="Side-by-side comparison of Traditional Filters versus Korgano Pathogen Filters, illustrating pathogen and particle free pure air flow."
                      style={{ width: "100%", height: "auto" }}
                      width="1500"
                      height="634" />
                  </div>
                  <div
                    id="hero-vis-svg"
                    style={{ display: "none", borderRadius: "1rem", overflow: "hidden", background: "#140b24", border: "1px solid rgba(197, 176, 246, 0.25)", padding: "1rem" }}>
                    <svg
                      viewBox="0 0 540 310"
                      width="100%"
                      height="auto"
                      aria-label="Diagram comparing Traditional Filter where pathogens survive versus Korgano Pathogen Filter with Porous Nanowire and BMPs"
                      style={{ fontFamily: "var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif" }}>
                      <rect
                        x="10"
                        y="10"
                        width="520"
                        height="136"
                        rx="12"
                        fill="#231224"
                        stroke="rgba(248, 113, 113, 0.4)"
                        strokeWidth="1.5" />
                      <text x="26" y="34" fill="#fca5a5" fontSize="11" fontWeight="800" letterSpacing="0.8">
                        TRADITIONAL AIR FILTERS
                      </text>
                      <text x="26" y="52" fill="rgba(255,255,255,0.78)" fontSize="10.5">
                        Captures dust, but pathogens can survive on fibers or pass into airflow
                      </text>
                      <line
                        x1="36"
                        y1="88"
                        x2="340"
                        y2="88"
                        stroke="rgba(248,113,113,0.22)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4" />
                      <line
                        x1="36"
                        y1="114"
                        x2="340"
                        y2="114"
                        stroke="rgba(248,113,113,0.22)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4" />
                      <circle r="4.5" fill="#ef4444">
                        <animateMotion dur="2.4s" repeatCount="indefinite" path="M 36 88 L 335 88" />
                      </circle>
                      <circle r="4.5" fill="#f97316">
                        <animateMotion
                          dur="2.6s"
                          begin="0.8s"
                          repeatCount="indefinite"
                          path="M 36 114 L 335 114" />
                      </circle>
                      <rect
                        x="176"
                        y="68"
                        width="28"
                        height="62"
                        rx="5"
                        fill="#334155"
                        stroke="#94a3b8"
                        strokeWidth="1.5" />
                      <circle cx="190" cy="99" r="5" fill="#ef4444">
                        <animate attributeName="r" values="4;6.5;4" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <rect
                        x="352"
                        y="80"
                        width="160"
                        height="42"
                        rx="9"
                        fill="rgba(220, 38, 38, 0.18)"
                        stroke="rgba(248, 113, 113, 0.45)" />
                      <text x="432" y="99" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="800">
                        ⚠ Virulent Pathogens
                      </text>
                      <text
                        x="432"
                        y="113"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="600">
                        Survive &amp; Re-Release
                      </text>
                      <rect
                        x="10"
                        y="162"
                        width="520"
                        height="138"
                        rx="12"
                        fill="#132a2e"
                        stroke="#34d399"
                        strokeWidth="1.5" />
                      <text x="26" y="186" fill="#a6e3d8" fontSize="11" fontWeight="800" letterSpacing="0.8">
                        KORGANO PATHOGEN FILTER (R&amp;D)
                      </text>
                      <text x="26" y="204" fill="rgba(255,255,255,0.85)" fontSize="10.5">
                        100–500 nm porous nanowire web + Bioactive Metal Particles (BMPs)
                      </text>
                      <line
                        x1="36"
                        y1="240"
                        x2="172"
                        y2="240"
                        stroke="rgba(248,113,113,0.25)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4" />
                      <line
                        x1="208"
                        y1="240"
                        x2="340"
                        y2="240"
                        stroke="rgba(52,211,153,0.3)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4" />
                      <line
                        x1="208"
                        y1="264"
                        x2="340"
                        y2="264"
                        stroke="rgba(52,211,153,0.3)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4" />
                      <circle r="4.5" fill="#ef4444">
                        <animateMotion dur="1.7s" repeatCount="indefinite" path="M 36 240 L 172 240" />
                      </circle>
                      <circle r="4.5" fill="#34d399">
                        <animateMotion dur="1.9s" repeatCount="indefinite" path="M 208 240 L 335 240" />
                      </circle>
                      <circle r="4.5" fill="#a6e3d8">
                        <animateMotion
                          dur="1.9s"
                          begin="0.95s"
                          repeatCount="indefinite"
                          path="M 208 264 L 335 264" />
                      </circle>
                      <rect
                        x="172"
                        y="218"
                        width="36"
                        height="66"
                        rx="6"
                        fill="#4a3570"
                        stroke="#c5b0f6"
                        strokeWidth="2" />
                      <circle cx="190" cy="234" r="3.5" fill="#fbbf24" />
                      <circle cx="190" cy="251" r="3.5" fill="#34d399" />
                      <circle cx="190" cy="268" r="3.5" fill="#fbbf24" />
                      <rect
                        x="352"
                        y="230"
                        width="160"
                        height="44"
                        rx="9"
                        fill="rgba(16, 185, 129, 0.2)"
                        stroke="#34d399" />
                      <text x="432" y="249" textAnchor="middle" fill="#a6e3d8" fontSize="10" fontWeight="800">
                        ✓ Pathogen &amp; Particle
                      </text>
                      <text
                        x="432"
                        y="264"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="600">
                        Free Pure Air Flow
                      </text>
                    </svg>
                  </div>
                  <div className="rx-grid-2" style={{ gap: "0.625rem", marginTop: "0.75rem" }}>
                    <div
                      style={{ padding: "0.625rem 0.875rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", fontSize: "0.75rem" }}>
                      <span style={{ display: "block", fontWeight: "800", color: "#fca5a5" }}>
                        Traditional Filters
                      </span>
                      {" "}
                      <span style={{ color: "rgba(255,255,255,0.75)" }}>
                        Passive capture only; trapped microbes can remain viable
                      </span>
                    </div>
                    <div
                      style={{ padding: "0.625rem 0.875rem", borderRadius: "0.75rem", background: "rgba(166, 227, 216, 0.12)", border: "1px solid rgba(166, 227, 216, 0.35)", fontSize: "0.75rem" }}>
                      <span style={{ display: "block", fontWeight: "800", color: "var(--teal-highlight)" }}>
                        Korgano Pathogen Filter
                      </span>
                      {" "}
                      <span style={{ color: "rgba(255,255,255,0.88)" }}>
                        Nanowire web + BMP ions damage pathogen proteins &amp; DNA
                      </span>
                    </div>
                  </div>
                </div>
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
          <a href="#why-developing" className="rx-page-subnav__link">
            Why We Are Developing
          </a>
          {" "}
          <a href="#inadequacy" className="rx-page-subnav__link">
            Conventional Filter Limits
          </a>
          {" "}
          <a href="#nanotechnology" className="rx-page-subnav__link">
            Nanotechnology &amp; BMPs
          </a>
          {" "}
          <a href="#motivation" className="rx-page-subnav__link">
            Our Motivation
          </a>
          {" "}
          <a href="#regulatory-notice" className="rx-page-subnav__link">
            Regulatory Notice
          </a>
          {" "}
          <a href="#contact" className="rx-page-subnav__link">
            Contact Us
          </a>
        </div>
      </nav>
      <section id="why-developing" className="rx-section rx-section--white" aria-labelledby="why-title">
        <div className="rx-container-page">
          <div className="rx-section-header">
            <p className="rx-eyebrow">
              The Challenge
            </p>
            <h2 id="why-title" className="rx-section-heading" style={{ marginTop: "0.5rem" }}>
              Why we are developing Pathogen Air Filters
            </h2>
            <p className="rx-section-subtitle">
              Environmental shifts and the limitations of conventional filtration create an urgent need for next-generation indoor air safety.
            </p>
          </div>
          <div className="rx-grid-2" style={{ maxWidth: "68rem", marginInline: "auto" }}>
            <article
              className="rx-surface-card rx-surface-card--interactive rx-surface-card--glow rx-card-pad-lg"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.5rem" }}>
              <div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <span className="rx-icon-box rx-icon-box--brand">
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
                        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                      </svg>
                    </span>
                    <div>
                      <span className="rx-eyebrow">
                        Climate &amp; Pathogen Zones
                      </span>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--primary)" }}>
                        Expanding outbreak zones
                      </h3>
                    </div>
                  </div>
                  <span className="rx-pill-badge">
                    WHO · 2025
                  </span>
                </div>
                <p
                  style={{ marginTop: "1.25rem", fontSize: "1.025rem", lineHeight: "1.68", color: "var(--foreground)" }}>
                  Rising temperatures are{" "}
                  <strong style={{ color: "var(--primary)" }}>
                    expanding the geographic zones where viruses and bacteria thrive
                  </strong>
                  , increasing the frequency and severity of airborne disease outbreaks—particularly in enclosed environments.
                </p>
              </div>
              <div className="rx-callout-box" style={{ backgroundColor: "var(--muted)" }}>
                <p
                  style={{ fontSize: "0.9625rem", fontWeight: "700", lineHeight: "1.55", color: "var(--primary)" }}>
                  “Indoor air pollution is a major contributor to respiratory illness and infection transmission”
                </p>
                <p
                  style={{ marginTop: "0.375rem", fontSize: "0.8125rem", fontWeight: "700", color: "var(--muted-foreground)" }}>
                  — World Health Organization, 2025
                </p>
              </div>
            </article>
            <article
              className="rx-surface-card rx-surface-card--interactive rx-surface-card--glow rx-card-pad-lg"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.5rem" }}>
              <div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <span
                      className="rx-icon-box"
                      style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
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
                        <circle cx="12" cy="12" r="10" />
                        <path d="m4.9 4.9 14.2 14.2" />
                      </svg>
                    </span>
                    <div>
                      <span className="rx-eyebrow">
                        Systemic Limitation
                      </span>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--primary)" }}>
                        Legacy HVAC design limits
                      </h3>
                    </div>
                  </div>
                  <span className="rx-pill-badge rx-pill-badge--amber">
                    Virulence Risk
                  </span>
                </div>
                <p
                  style={{ marginTop: "1.25rem", fontSize: "1.025rem", lineHeight: "1.68", color: "var(--foreground)" }}>
                  Current air filtration systems were{" "}
                  <strong style={{ color: "var(--primary)" }}>
                    not designed for a warming, pathogen-prone world
                  </strong>
                  .
                </p>
              </div>
              <div className="rx-callout-box rx-callout-box--night">
                <p style={{ fontSize: "0.9625rem", lineHeight: "1.6", color: "rgba(255, 255, 255, 0.92)" }}>
                  Published research shows that{" "}
                  <strong style={{ color: "var(--lilac-highlight)" }}>
                    pathogens can remain virulent
                  </strong>
                  {" "}on traditional air filters for extended periods, enabling their spread through HVAC systems.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section id="inadequacy" className="rx-section rx-section--soft" aria-labelledby="inadequacy-title">
        <div className="rx-container-page">
          <div className="rx-section-header">
            <p className="rx-eyebrow">
              Real-World Evidence
            </p>
            <h2 id="inadequacy-title" className="rx-section-heading" style={{ marginTop: "0.5rem" }}>
              COVID has highlighted the inadequacy of conventional air filters
            </h2>
            <p className="rx-section-subtitle">
              High-occupancy and sensitive indoor environments face acute health and economic risks from airborne pathogens.
            </p>
          </div>
          <div className="rx-grid-3">
            <article
              className="rx-surface-card rx-surface-card--interactive"
              style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="rx-evidence-photo-wrap">
                <img
                  src="/images/program/pathogen/AdobeStock_507420448.jpeg"
                  alt="Residents and care staff in an assisted living facility"
                  width="1600"
                  height="1066"
                  loading="lazy"
                  decoding="async" />
                {" "}
                <span className="rx-evidence-kpi-badge">
                  &gt;200,000 Lives Lost
                </span>
              </div>
              <div
                style={{ padding: "1.5rem", flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span className="rx-eyebrow">
                    Assisted Living
                  </span>
                  <p
                    style={{ marginTop: "0.625rem", fontSize: "1.05rem", fontWeight: "700", lineHeight: "1.45", color: "var(--primary)" }}>
                    COVID-19 claims the lives of &gt;200,000 residents and staff in assisted living
                  </p>
                </div>
                <p
                  style={{ marginTop: "1rem", fontSize: "0.8125rem", fontWeight: "700", color: "var(--muted-foreground)" }}>
                  — Brown University
                </p>
              </div>
            </article>
            <article
              className="rx-surface-card rx-surface-card--interactive"
              style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="rx-evidence-photo-wrap">
                <img
                  src="/images/program/pathogen/AdobeStock_410479691.jpeg"
                  alt="Hospital ward and clinical care beds"
                  width="1600"
                  height="1066"
                  loading="lazy"
                  decoding="async" />
                {" "}
                <span className="rx-evidence-kpi-badge">
                  +5% TB Increase (2022)
                </span>
              </div>
              <div
                style={{ padding: "1.5rem", flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span className="rx-eyebrow">
                    Youth &amp; Student Population
                  </span>
                  <p
                    style={{ marginTop: "0.625rem", fontSize: "1.05rem", fontWeight: "700", lineHeight: "1.45", color: "var(--primary)" }}>
                    5% increase in tuberculosis (2022), mostly affecting the younger and student population
                  </p>
                </div>
                <p
                  style={{ marginTop: "1rem", fontSize: "0.8125rem", fontWeight: "700", color: "var(--muted-foreground)" }}>
                  — Washington Post
                </p>
              </div>
            </article>
            <article
              className="rx-surface-card rx-surface-card--interactive"
              style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="rx-evidence-photo-wrap">
                <img
                  src="/images/program/pathogen/AdobeStock_170767323.jpeg"
                  alt="Veterinary specialist in protective gear examining poultry"
                  width="1600"
                  height="1066"
                  loading="lazy"
                  decoding="async" />
                {" "}
                <span className="rx-evidence-kpi-badge">
                  +65% Egg Price Spike
                </span>
              </div>
              <div
                style={{ padding: "1.5rem", flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span className="rx-eyebrow">
                    Agriculture &amp; Food Supply
                  </span>
                  <p
                    style={{ marginTop: "0.625rem", fontSize: "1.05rem", fontWeight: "700", lineHeight: "1.45", color: "var(--primary)" }}>
                    “The most severe avian flu outbreak in US history is affecting poultry, egg prices increased by 65% in past year”
                  </p>
                </div>
                <p
                  style={{ marginTop: "1rem", fontSize: "0.8125rem", fontWeight: "700", color: "var(--muted-foreground)" }}>
                  — WSJ
                </p>
              </div>
            </article>
          </div>
          <div
            className="rx-surface-card rx-card-pad-lg"
            style={{ marginTop: "2.5rem", backgroundColor: "var(--surface)", borderWidth: "2px", borderColor: "var(--lavender)" }}>
            <div className="rx-split-layout">
              <div>
                <span className="rx-pill-badge">
                  <span className="rx-pill-badge__dot" />
                  {" "}Published Peer-Reviewed Literature
                </span>
                <h3
                  style={{ marginTop: "1rem", fontSize: "clamp(1.6rem, 2.6vw, 2.25rem)", fontWeight: "800", color: "var(--primary)" }}>
                  A Chilling Truth
                </h3>
                <blockquote
                  className="rx-callout-box"
                  style={{ marginTop: "1rem", fontSize: "1.075rem", fontWeight: "700", lineHeight: "1.55", color: "var(--foreground)", backgroundColor: "var(--muted)" }}>
                  “Published research shows that pathogens can remain{" "}
                  <span className="rx-text-brand">
                    virulent
                  </span>
                  {" "}on traditional air filters for extended periods, facilitating their spread”
                </blockquote>
                <p
                  style={{ marginTop: "1rem", fontSize: "0.9375rem", lineHeight: "1.65", color: "var(--muted-foreground)" }}>
                  In{" "}
                  <em>
                    Survival of Microorganisms on HEPA Filters
                  </em>
                  {" "}(Mittal et al., Health Protection Agency, UK), researchers demonstrated that captured microorganisms—including spore formers, moulds, and bacteriophages—survived on HEPA filter material under normal operating airflow conditions with no significant loss of viability, creating potential for exposure or re-aerosolization.
                </p>
              </div>
              <div className="rx-media-frame">
                <img
                  className="rx-zoomable-media"
                  src="/images/program/pathogen/image5.png"
                  alt="Excerpt from published study 'Survival of Microorganisms on HEPA Filters' by Himanshu Mittal, Simon R. Parks, Thomas Pottage, James T. Walker, and Allan M. Bennett"
                  style={{ width: "100%", height: "auto" }}
                  width="707"
                  height="555"
                  loading="lazy"
                  decoding="async" />
                <div className="rx-media-frame__caption">
                  <span>
                    Mittal et al.,{" "}
                    <em>
                      Survival of Microorganisms on HEPA Filters
                    </em>
                    {" "}(Health Protection Agency, UK) · Click to enlarge
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="nanotechnology" className="rx-section rx-section--white" aria-labelledby="nano-title">
        <div className="rx-container-page">
          <div className="rx-section-header">
            <p className="rx-eyebrow">
              Core Science
            </p>
            <h2 id="nano-title" className="rx-section-heading" style={{ marginTop: "0.5rem" }}>
              Nanotechnology at the Forefront
            </h2>
            <p
              className="rx-section-subtitle"
              style={{ maxWidth: "54rem", marginInline: "auto", color: "var(--foreground)" }}>
              KorganoTech is a nanotechnology-based air filter that uses known antimicrobial bioactive metal particles (BMPs), such as silver, copper, and metal oxides, embedded in an ultra-high surface area, porous nanowire web to capture pathogens of all sizes. When BMPs interact with the captured pathogens to form metal ions (created via dissolution of BMPs) that damage the pathogens&apos; proteins and DNA, preventing them from growing and reproducing.
            </p>
          </div>
          <div className="rx-grid-3" style={{ marginBottom: "2rem" }}>
            <button
              type="button"
              className="rx-interactive-step-card rx-nano-stage-btn rx-is-active"
              data-nano-stage="1">
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="rx-step-badge">
                    01
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>
                    Porous Nanowire Capture
                  </h3>
                </div>
                <span className="rx-eyebrow" style={{ fontSize: "0.6875rem" }}>
                  100–500 nm
                </span>
              </div>
              <p
                style={{ marginTop: "0.875rem", fontSize: "0.9rem", lineHeight: "1.55", color: "var(--muted-foreground)" }}>
                Multi-layer Pathogen Filter + Pre-Filter with an ultra-high surface area nanowire web (~1/1000 of a human hair) physically traps pathogens of all sizes.
              </p>
            </button>
            {" "}
            <button type="button" className="rx-interactive-step-card rx-nano-stage-btn" data-nano-stage="2">
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="rx-step-badge">
                    02
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>
                    BMP Ion Dissolution
                  </h3>
                </div>
                <span className="rx-eyebrow" style={{ fontSize: "0.6875rem" }}>
                  Ag⁺ · Cu²⁺ · Zn²⁺
                </span>
              </div>
              <p
                style={{ marginTop: "0.875rem", fontSize: "0.9rem", lineHeight: "1.55", color: "var(--muted-foreground)" }}>
                Embedded bioactive metal particles (silver, copper, metal oxides) interact with captured microbes to release active metal ions via dissolution.
              </p>
            </button>
            {" "}
            <button type="button" className="rx-interactive-step-card rx-nano-stage-btn" data-nano-stage="3">
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="rx-step-badge">
                    03
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>
                    Protein &amp; DNA Neutralization
                  </h3>
                </div>
                <span className="rx-eyebrow" style={{ fontSize: "0.6875rem" }}>
                  Inactivation
                </span>
              </div>
              <p
                style={{ marginTop: "0.875rem", fontSize: "0.9rem", lineHeight: "1.55", color: "var(--muted-foreground)" }}>
                Metal ions trigger membrane damage, reactive oxygen species (ROS), and protein/DNA disruption—preventing pathogens from growing or reproducing.
              </p>
            </button>
          </div>
          <div className="rx-grid-2" style={{ alignItems: "stretch" }}>
            <div
              id="nano-card-left"
              className="rx-media-frame"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderWidth: "2px", borderColor: "var(--brand)" }}>
              <div
                style={{ padding: "1.5rem", flex: "1", display: "grid", placeItems: "center", backgroundColor: "#ffffff" }}>
                <img
                  className="rx-zoomable-media"
                  src="/images/program/pathogen/image6.png"
                  alt="Multi-layer Pathogen Filter and Pre-Filter with SEM magnification showing 100-500 nm (1/1000 of human hair) porous nanowire surface"
                  style={{ maxHeight: "26rem", width: "auto", marginInline: "auto" }}
                  width="550"
                  height="550" />
              </div>
              <div className="rx-media-frame__caption">
                <span>
                  <strong>
                    Ultra-High Surface Area Architecture:
                  </strong>
                  {" "}Multi-layer Pathogen Filter + Pre-Filter (100–500 nm porous nanowire web, ~1/1000 of a human hair) · Click to zoom
                </span>
              </div>
            </div>
            <div
              id="nano-card-right"
              className="rx-media-frame"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderWidth: "2px" }}>
              <div
                style={{ padding: "1.5rem", flex: "1", display: "grid", placeItems: "center", backgroundColor: "#ffffff" }}>
                <img
                  className="rx-zoomable-media"
                  src="/images/program/pathogen/image7.jpeg"
                  alt="Diagram showing Bioactive Metal Particles (BMPs) and metal ions (Zn2+, Ag+, Fe3+, Mg2+, Cu2+) causing Membrane Damage, Formation of ROS, DNA Damage, and Protein Damage leading to Cell Death"
                  style={{ maxHeight: "26rem", width: "auto", marginInline: "auto" }}
                  width="535"
                  height="535" />
              </div>
              <div className="rx-media-frame__caption">
                <span>
                  <strong>
                    Bioactive Metal Particles (BMPs):
                  </strong>
                  {" "}Metal ions (Ag⁺, Cu²⁺, Zn²⁺, Fe³⁺, Mg²⁺) induce membrane, protein, and DNA damage · Click to zoom
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="motivation" className="rx-section rx-section--tint" aria-labelledby="motivation-title">
        <div className="rx-container-page">
          <div className="rx-split-layout">
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="rx-icon-box rx-icon-box--brand">
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
                      d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                  </svg>
                </span>
                {" "}
                <span className="rx-eyebrow">
                  Mission &amp; Origin
                </span>
              </div>
              <h2 id="motivation-title" className="rx-section-heading" style={{ marginTop: "1rem" }}>
                Our motivation to pursue pathogen air filters
              </h2>
              <div
                style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", fontSize: "1.025rem", lineHeight: "1.7", color: "var(--muted-foreground)" }}>
                <p>
                  At the onset of the COVID-19 pandemic, many of us relied on traditional air filters to keep us safe by providing clean air. However, published research shows that these filters are largely ineffective against airborne pathogens such as viruses, bacteria, and other microorganisms. While they may capture particles, traditional filters do not have the ability to deactivate or destroy pathogens—unless paired with additional technologies like UV purification or heat sterilization.
                </p>
                <p>
                  Over time, trapped pathogens can accumulate and potentially be re-released into the air, contaminating homes, buildings, and vehicles. This critical gap in air safety inspired us to develop KorganoTech Pathogen Air Filters, with the mission to protect lives, reduce costs, and improve public health.
                </p>
                <div className="rx-callout-box" style={{ marginTop: "0.25rem" }}>
                  <p
                    style={{ fontWeight: "700", color: "var(--primary)", fontSize: "1rem", lineHeight: "1.6" }}>
                    Today, clean air matters more than ever because airborne diseases and viral outbreaks have had devastating effects on both public health and the global economy. We believe that investing in advanced air purification is no longer a luxury—it’s a necessity.
                  </p>
                </div>
              </div>
            </div>
            <div className="rx-media-frame" style={{ backgroundColor: "#ffffff" }}>
              <div style={{ padding: "1.25rem" }}>
                <img
                  src="/images/program/pathogen/image8.jpg"
                  alt="KorganoTech Air Filter product line display showing pleated filters"
                  style={{ width: "100%", height: "auto", borderRadius: "0.75rem" }}
                  width="1800"
                  height="1350"
                  loading="lazy"
                  decoding="async" />
              </div>
              <div className="rx-media-frame__caption">
                <span>
                  KorganoTech Air Filtration Family — Livermore, California
                </span>
                {" "}
                <Link href="/hvac-air-filters" style={{ fontWeight: "700", color: "var(--brand)" }}>
                  View available Conventional HVAC Air Filters →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="regulatory-notice"
        className="rx-section rx-section--white"
        aria-labelledby="regulatory-title">
        <div className="rx-container-page">
          <div className="rx-regulatory-card" style={{ maxWidth: "60rem", marginInline: "auto" }}>
            <div
              style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", borderBottom: "1px solid var(--lavender)", paddingBottom: "1.25rem" }}>
              <div>
                <span className="rx-eyebrow">
                  Compliance &amp; Status
                </span>
                <h2
                  id="regulatory-title"
                  style={{ marginTop: "0.25rem", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: "800", color: "var(--primary)" }}>
                  REGULATORY NOTICE
                </h2>
              </div>
              <span
                className="rx-pill-badge rx-pill-badge--amber"
                style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem" }}>
                <span className="rx-pill-badge__dot" />
                {" "}Information only. Not for sale
              </span>
            </div>
            <ul className="rx-regulatory-list">
              <li className="rx-regulatory-list__item">
                <span
                  className="rx-step-badge"
                  style={{ width: "1.75rem", height: "1.75rem", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                  1
                </span>
                {" "}
                <span>
                  The filter media technology described here is under research and development.
                </span>
              </li>
              <li className="rx-regulatory-list__item">
                <span
                  className="rx-step-badge"
                  style={{ width: "1.75rem", height: "1.75rem", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                  2
                </span>
                {" "}
                <span>
                  It is not registered with the U.S. Environmental Protection Agency (EPA) under FIFRA. KorganoTech has not yet applied for EPA registration.
                </span>
              </li>
              <li className="rx-regulatory-list__item">
                <span
                  className="rx-step-badge"
                  style={{ width: "1.75rem", height: "1.75rem", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                  3
                </span>
                {" "}
                <span>
                  The product is not offered for sale or distribution. KorganoTech is not taking orders, reservations or pre-orders for it.
                </span>
              </li>
              <li className="rx-regulatory-list__item">
                <span
                  className="rx-step-badge"
                  style={{ width: "1.75rem", height: "1.75rem", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                  4
                </span>
                {" "}
                <span>
                  No statement in this presentation is a claim that any product prevents, treats or protects against disease or infection.
                </span>
              </li>
              <li className="rx-regulatory-list__item">
                <span
                  className="rx-step-badge"
                  style={{ width: "1.75rem", height: "1.75rem", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                  5
                </span>
                {" "}
                <span>
                  KorganoTech&apos;s conventional MERV-rated air filters are separate products and are not covered by this presentation.
                </span>
              </li>
            </ul>
          </div>
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
                {" "}Development Partnership Inquiries
              </span>
              <h2
                id="contact-title"
                style={{ marginTop: "1rem", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: "800", lineHeight: "1.12" }}>
                Interested in Pathogen Air Filter Technology: Contact Us
              </h2>
              <p
                style={{ marginTop: "1rem", fontSize: "1.0625rem", lineHeight: "1.65", color: "rgba(255, 255, 255, 0.85)", maxWidth: "38rem" }}>
                We welcome conversations with researchers, testing laboratories, facility operators and potential development partners.{" "}
                <strong>
                  We cannot accept orders for this product.
                </strong>
              </p>
              <div style={{ marginTop: "1.75rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <a href="mailto:Support@KorganoTech.com" className="rx-btn rx-btn--white">
                  Email Support@KorganoTech.com{" "}
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
                KorganoTech Contact Information
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
                    <a href="mailto:Support@KorganoTech.com" className="rx-contact-list__link">
                      Support@KorganoTech.com
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
                      Address
                    </span>
                    {" "}
                    <span>
                      69 E Airway Blvd, Livermore, CA 94551
                    </span>
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
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                      <path d="M2 12h20" />
                    </svg>
                  </span>
                  <div>
                    <span
                      style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)" }}>
                      Website
                    </span>
                    {" "}
                    <a href="https://www.KorganoTech.com" className="rx-contact-list__link">
                      www.KorganoTech.com
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Interactions for the Environmental and Pathogen pages, ported from the approved preview.
// They toggle classes/attributes on the server-rendered markup, scoped to the page root.

const C = "rx-";

const all = <T extends Element>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll<T>(sel));
const byId = <T extends Element>(root: ParentNode, id: string) => root.querySelector<T>(`#${id}`);

export function initEnvironmental(root: HTMLElement, signal: AbortSignal): () => void {
  // 1. Technology section: step cards + SVG subsystem highlighting + auto-cycle
  const stepCards = all<HTMLElement>(root, `.${C}interactive-step-card`);
  const liveStepStatus = byId<HTMLElement>(root, "live-step-status");
  const microcapsules = all<SVGElement>(root, `.${C}capture-microcapsule`);
  const defaultCapsuleColors = ["#8e74c4", "#7d67ae", "#9f86d6", "#7d67ae", "#9f86d6", "#8e74c4", "#8e74c4"];

  const groupIds = {
    inlet: "svg-group-inlet",
    capture: "svg-stage-capture",
    sensor: "svg-stage-sensor",
    conduit1: "svg-group-conduit1",
    regen: "svg-stage-regen",
    exchange: "svg-stage-exchange",
    oven: "svg-stage-oven",
    reuse: "svg-group-reuse",
    conduit2: "svg-group-conduit2",
    compression: "svg-group-compression",
  } as const;
  const groups = Object.fromEntries(
    Object.entries(groupIds).map(([key, id]) => [key, byId<SVGElement>(root, id)]),
  ) as Record<keyof typeof groupIds, SVGElement | null>;

  const activeGroupsByStep: Record<string, (keyof typeof groupIds)[]> = {
    "1": ["inlet", "capture", "sensor"],
    "2": ["capture", "sensor"],
    "3": ["conduit1", "regen", "exchange"],
    "4": ["regen", "oven", "reuse", "conduit2", "compression"],
  };

  const svgBoxes: Record<string, { el: SVGElement | null; filter: string; stroke: string; width: string }> = {
    "1": { el: byId(root, "svg-box-capture"), filter: "url(#glowPurple)", stroke: "#c5b0f6", width: "3.2" },
    "2": { el: byId(root, "svg-box-sensor"), filter: "url(#glowAmber)", stroke: "#fde68a", width: "3" },
    "3": { el: byId(root, "svg-box-exchange"), filter: "url(#glowAmber)", stroke: "#fde68a", width: "3.5" },
    "4": { el: byId(root, "svg-box-oven"), filter: "url(#glowAmber)", stroke: "#fde68a", width: "3.2" },
  };

  const stepOrder = ["1", "2", "3", "4"];
  let currentStepIndex = 0;
  let stepTimer: ReturnType<typeof setInterval> | null = null;

  const activateStep = (stepId: string) => {
    currentStepIndex = Math.max(0, stepOrder.indexOf(stepId));

    stepCards.forEach((card) => {
      const match = card.dataset.step === stepId;
      card.classList.remove(`${C}is-active`);
      if (match) {
        void card.offsetWidth; // reflow restarts the CSS progress bar
        card.classList.add(`${C}is-active`);
        const desc = card.dataset.stepDesc;
        if (liveStepStatus && desc) liveStepStatus.textContent = desc;
      }
    });

    stepOrder.forEach((id) => {
      byId(root, `svg-spotlight-${id}`)?.classList.toggle(`${C}is-visible`, id === stepId);
      byId(root, `svg-badge-${id}`)?.classList.toggle(`${C}is-visible`, id === stepId);
    });

    const active = activeGroupsByStep[stepId] ?? [];
    (Object.keys(groups) as (keyof typeof groupIds)[]).forEach((key) => {
      const g = groups[key];
      if (!g) return;
      const on = active.includes(key);
      g.classList.toggle(`${C}is-dimmed`, !on);
      g.classList.toggle(`${C}is-highlighted`, on);
    });

    Object.entries(svgBoxes).forEach(([key, item]) => {
      if (!item.el) return;
      if (key === stepId) {
        item.el.setAttribute("filter", item.filter);
        item.el.setAttribute("stroke", item.stroke);
        item.el.setAttribute("stroke-width", item.width);
      } else {
        item.el.removeAttribute("filter");
        item.el.setAttribute("stroke-width", key === "1" ? "2.2" : key === "3" ? "2.5" : "1.6");
      }
    });

    // Step 2 (optical sensing): microcapsules shift to saturated gold
    microcapsules.forEach((cap, idx) => {
      if (stepId === "2") {
        cap.setAttribute("fill", "#fbbf24");
        cap.setAttribute("stroke", "#fef3c7");
      } else {
        cap.setAttribute("fill", defaultCapsuleColors[idx % defaultCapsuleColors.length]);
        cap.setAttribute("stroke", "#ece8f7");
      }
    });
  };

  const startStepTimer = () => {
    if (stepTimer) clearInterval(stepTimer);
    stepTimer = setInterval(() => activateStep(stepOrder[(currentStepIndex + 1) % stepOrder.length]), 4500);
  };

  stepCards.forEach((card) =>
    card.addEventListener(
      "click",
      () => {
        activateStep(card.dataset.step ?? "1");
        startStepTimer();
      },
      { signal },
    ),
  );
  all<SVGElement>(root, "[data-svg-step]").forEach((g) =>
    g.addEventListener(
      "click",
      (e) => {
        e.stopPropagation();
        activateStep(g.getAttribute("data-svg-step") ?? "1");
        startStepTimer();
      },
      { signal },
    ),
  );
  activateStep("1");
  startStepTimer();

  // 2. Cartridge A-D callouts
  const calloutBtns = all<HTMLElement>(root, `.${C}cartridge-callout-btn`);
  const inspectorText = byId<HTMLElement>(root, "cartridge-inspector-text");
  const panels = all<HTMLElement>(root, `.${C}cartridge-panel`);
  panels.forEach((panel) =>
    panel.addEventListener(
      "click",
      () => calloutBtns.find((b) => b.dataset.panel === panel.dataset.panel)?.click(),
      { signal },
    ),
  );
  calloutBtns.forEach((btn) =>
    btn.addEventListener(
      "click",
      () => {
        calloutBtns.forEach((b) => b.classList.remove(`${C}is-active`));
        btn.classList.add(`${C}is-active`);
        panels.forEach((p) => p.classList.toggle(`${C}is-active`, p.dataset.panel === btn.dataset.panel));
        if (inspectorText) {
          const label = document.createElement("strong");
          label.style.color = "var(--lilac-highlight)";
          label.textContent = "Active Selection:";
          inspectorText.replaceChildren(label, document.createTextNode(` ${btn.dataset.panelText ?? ""}`));
        }
      },
      { signal },
    ),
  );

  // 3. Colorimetric microcapsule simulator (a -> b -> c)
  const capBtns = all<HTMLElement>(root, "[data-cap-state]");
  const simCore = byId<SVGElement>(root, "sim-capsule-core");
  const simLabel = byId<HTMLElement | SVGElement>(root, "sim-capsule-label");
  const simSub = byId<HTMLElement>(root, "sim-capsule-sub");
  const simTitle = byId<HTMLElement>(root, "capsule-sim-title");
  const simBadge = byId<HTMLElement>(root, "capsule-sim-badge");
  const capStates: Record<string, { color: string; label: string; sub: string; title: string; badgeText: string; badgeBg: string; badgeColor: string }> = {
    a: {
      color: "#8b2d8c",
      label: "CO₃²⁻",
      sub: "High pH · Unloaded carbonate core",
      title: "State (a): No CO₂ — Ready for Capture (Purple)",
      badgeText: "Optical Sensor: Ready",
      badgeBg: "#f3e8ff",
      badgeColor: "#6b21a8",
    },
    b: {
      color: "#d49b27",
      label: "HCO₃⁻",
      sub: "pH drops as CO₂ converts to bicarbonate",
      title: "State (b): CO₂ Absorbed — Saturated (Yellow/Gold)",
      badgeText: "Optical Sensor: Saturated (Swap Triggered)",
      badgeBg: "#fef3c7",
      badgeColor: "#92400e",
    },
    c: {
      color: "#8b2d8c",
      label: "CO₃²⁻",
      sub: "CO₂ released via heat · Sorbent restored",
      title: "State (c): Regenerated — Ready for Reuse (Purple)",
      badgeText: "Optical Sensor: Restored",
      badgeBg: "#ecfdf5",
      badgeColor: "#065f46",
    },
  };
  capBtns.forEach((btn) =>
    btn.addEventListener(
      "click",
      () => {
        const st = capStates[btn.dataset.capState ?? ""];
        if (!st) return;
        capBtns.forEach((b) => b.classList.remove(`${C}is-active`));
        btn.classList.add(`${C}is-active`);
        simCore?.setAttribute("fill", st.color);
        if (simLabel) simLabel.textContent = st.label;
        if (simSub) simSub.textContent = st.sub;
        if (simTitle) simTitle.textContent = st.title;
        if (simBadge) {
          simBadge.style.background = st.badgeBg;
          simBadge.style.color = st.badgeColor;
          const dot = document.createElement("span");
          dot.className = `${C}pill-badge__dot`;
          dot.style.background = st.color;
          simBadge.replaceChildren(dot, document.createTextNode(` ${st.badgeText}`));
        }
      },
      { signal },
    ),
  );

  // 4. Catalyst concentration filter
  const catBtns = all<HTMLElement>(root, `.${C}catalyst-filter-btn`);
  const catGroups = all<HTMLElement>(root, "[data-cat-group]");
  catBtns.forEach((btn) =>
    btn.addEventListener(
      "click",
      () => {
        const val = btn.dataset.cat;
        catBtns.forEach((b) => b.classList.remove(`${C}is-active`));
        btn.classList.add(`${C}is-active`);
        catGroups.forEach((grp) => {
          const match = val === "all" || grp.dataset.catGroup === val;
          grp.style.display = match ? "block" : "none";
          grp.classList.toggle(`${C}is-highlighted`, val !== "all" && match);
        });
      },
      { signal },
    ),
  );

  // 5. Landfill gas CFM impact calculator
  const cfmRange = byId<HTMLInputElement>(root, "cfm-range");
  const cfmDisplay = byId<HTMLElement>(root, "calc-cfm-display");
  const rawScfEl = byId<HTMLElement>(root, "calc-raw-scf");
  const ch4ScfEl = byId<HTMLElement>(root, "calc-ch4-scf");
  const co2TonsEl = byId<HTMLElement>(root, "calc-co2-tons");
  const presetBtns = all<HTMLElement>(root, `.${C}cfm-preset-btn`);
  const updateCfmCalc = (cfm: number) => {
    const ratio = cfm / 15000;
    if (cfmDisplay) cfmDisplay.textContent = `${cfm.toLocaleString("en-US")} CFM`;
    if (rawScfEl) rawScfEl.textContent = `${(7.88 * ratio).toFixed(2)}B`;
    if (ch4ScfEl) ch4ScfEl.textContent = `${(3.745 * ratio).toFixed(3)}B`;
    if (co2TonsEl) co2TonsEl.textContent = Math.round(186614 * ratio).toLocaleString("en-US");
    presetBtns.forEach((b) => b.classList.toggle(`${C}is-active`, Number(b.dataset.cfm) === cfm));
  };
  cfmRange?.addEventListener("input", (e) => updateCfmCalc(Number((e.target as HTMLInputElement).value)), { signal });
  presetBtns.forEach((btn) =>
    btn.addEventListener(
      "click",
      () => {
        const val = Number(btn.dataset.cfm);
        if (cfmRange) cfmRange.value = String(val);
        updateCfmCalc(val);
      },
      { signal },
    ),
  );

  return () => {
    if (stepTimer) clearInterval(stepTimer);
  };
}

export function initPathogen(root: HTMLElement, signal: AbortSignal): () => void {
  // 1. Hero visual toggle (animated GIF vs. nanowire diagram)
  const heroBtns = all<HTMLElement>(root, "[data-hero-vis]");
  const visGif = byId<HTMLElement>(root, "hero-vis-gif");
  const visSvg = byId<HTMLElement>(root, "hero-vis-svg");
  heroBtns.forEach((btn) =>
    btn.addEventListener(
      "click",
      () => {
        const mode = btn.dataset.heroVis;
        heroBtns.forEach((b) => b.classList.remove(`${C}is-active`));
        btn.classList.add(`${C}is-active`);
        if (visGif) visGif.style.display = mode === "gif" ? "block" : "none";
        if (visSvg) visSvg.style.display = mode === "svg" ? "block" : "none";
      },
      { signal },
    ),
  );

  // 2. Three-stage nanotechnology mechanism selector
  const stageBtns = all<HTMLElement>(root, `.${C}nano-stage-btn`);
  const leftCard = byId<HTMLElement>(root, "nano-card-left");
  const rightCard = byId<HTMLElement>(root, "nano-card-right");
  stageBtns.forEach((btn) =>
    btn.addEventListener(
      "click",
      () => {
        const st = btn.dataset.nanoStage;
        stageBtns.forEach((b) => b.classList.remove(`${C}is-active`));
        btn.classList.add(`${C}is-active`);
        if (leftCard && rightCard) {
          leftCard.style.borderColor = st === "1" ? "var(--brand)" : "var(--lavender)";
          rightCard.style.borderColor = st === "2" || st === "3" ? "var(--brand)" : "var(--lavender)";
        }
      },
      { signal },
    ),
  );

  return () => {};
}

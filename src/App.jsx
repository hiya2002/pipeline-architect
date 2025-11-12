import React, { useState, useMemo } from "react";

/** ------------------------------------------------------
 *  Stage metadata
 * -----------------------------------------------------*/
const STAGES = [
  { id: "ingestion",  label: "Stage 1 - Data ingestion" },
  { id: "validation", label: "Stage 2 - Data validation" },
  { id: "model",      label: "Stage 3 - Prediction model" },
  { id: "deployment", label: "Stage 4 - Deployment" },
  { id: "monitoring", label: "Stage 5 - Monitoring and adaptation" },
];

// brief helper text for each step (shown under the stage title)
const STAGE_DESCRIPTIONS = {
  ingestion:
    "Pick how the system senses traffic. This sets data fidelity, privacy, and power draw.",
  validation:
    "Choose how incoming signals are checked and cleaned. More checks cost compute but raise trust.",
  model:
    "Select a prediction approach. Heavy models lift accuracy at the expense of energy and cost.",
  deployment:
    "Choose where the model runs. Cloud is simple. Edge gives speed and resilience.",
  monitoring:
    "Define how the system observes itself and adapts to drift or energy limits.",
};

/** ------------------------------------------------------
 *  Concrete sustainability metrics shown on the right
 * -----------------------------------------------------*/
const METRICS = [
  { id: "modelPerf",     label: "Model accuracy",                 theme: "tech"  },
  { id: "systemPerf",    label: "System response time",           theme: "tech"  },
  { id: "energy",        label: "Energy consumption",             theme: "env"   },
  { id: "operationalCost", label: "Operational cost",            theme: "econ"  },
  { id: "socialImpact",  label: "Social impact & equity",         theme: "social"},
];

// keep the map readable: at most N strongest links per function
const MAX_LINKS_PER_FUNCTION = 3;

/** ------------------------------------------------------
 *  Cards (kept as you provided, plus functionLabel)
 * -----------------------------------------------------*/
const CARD_DATA = {
  ingestion: [
    {
      id: "ing-loop",
      title: "Magnetic-loop sensors",
      functionLabel: "Count vehicles with simple road sensors",
      description: "Buries simple loops in the road to count vehicles as they pass.",
      tech: -2, econ: 3, env: 2, social: -1,
      techReason: "Very low fidelity data.",
      econReason: "Extremely cheap and durable.",
      envReason: "Very low power use.",
      socialReason: "Predictions are basic and limited in benefit.",
    },
    {
      id: "ing-video",
      title: "HD video cameras",
      functionLabel: "Capture high-resolution video footage",
      description: "Streams 24x7 video from intersections for AI object detection.",
      tech: 2, econ: -2, env: -2, social: -1,
      techReason: "Rich data for many use cases.",
      econReason: "High hardware and streaming costs.",
      envReason: "Continuous power use.",
      socialReason: "Feels like surveillance and harms trust.",
    },
    {
      id: "ing-lidar",
      title: "LiDAR and radar sensors",
      functionLabel: "Sense precise 3D positions of road users",
      description: "Advanced sensors for precise 3D tracking of all road users.",
      tech: 3, econ: -3, env: -1, social: 2,
      techReason: "Highest accuracy in all weather.",
      econReason: "Very expensive hardware.",
      envReason: "Higher energy per sensor.",
      socialReason: "High quality data with built in anonymity.",
    },
    {
      id: "ing-crowd",
      title: "Crowdsourced app data",
      functionLabel: "Collect volunteer phone traces",
      description: "Uses location data from citizens using a city mobility app.",
      tech: 0, econ: 2, env: 1, social: -2,
      techReason: "Noisy and sparse, depends on adoption.",
      econReason: "Cheap because phones already exist.",
      envReason: "No extra infrastructure.",
      socialReason: "Biased toward smartphone users.",
    },
    {
      id: "ing-audio",
      title: "Acoustic sensors",
      functionLabel: "Listen for traffic sounds and incidents",
      description: "Microphones detect traffic flow and incident sounds such as crashes.",
      tech: 1, econ: 1, env: 1, social: -2,
      techReason: "Good for incident detection.",
      econReason: "Moderately cheap hardware.",
      envReason: "Low power consumption.",
      socialReason: "Can capture conversations and private sounds.",
    },
  ],

  validation: [
    {
      id: "val-none",
      title: "No validation (raw feed)",
      functionLabel: "Trust whatever data arrives",
      description: "Feeds raw sensor data directly into the model.",
      tech: -3, econ: 2, env: 1, social: -2,
      techReason: "High risk of failure due to bad data.",
      econReason: "No validation cost.",
      envReason: "No extra compute.",
      socialReason: "Faulty predictions can harm community mobility.",
    },
    {
      id: "val-simple",
      title: "Simple anomaly check",
      functionLabel: "Filter impossible or clearly broken values",
      description: "Drops impossible values such as negative counts or absurd peaks.",
      tech: 1, econ: 1, env: 1, social: 0,
      techReason: "Prevents trivial data problems.",
      econReason: "Very cheap rules.",
      envReason: "Minor extra compute.",
      socialReason: "Basic reliability only.",
    },
    {
      id: "val-twin",
      title: "Full digital twin sync",
      functionLabel: "Validate data against a digital twin",
      description: "Validates data by comparing against a real-time digital twin of the city.",
      tech: 3, econ: -3, env: -3, social: 2,
      techReason: "Very robust and physically grounded.",
      econReason: "Expensive to build and maintain.",
      envReason: "High compute load.",
      socialReason: "More trustworthy predictions for citizens.",
    },
    {
      id: "val-peer",
      title: "Peer sensor cross-check",
      functionLabel: "Cross-check sensors with their neighbours",
      description: "Sensors compare values with neighbors to spot inconsistent readings.",
      tech: 2, econ: -1, env: -1, social: 1,
      techReason: "Decentralized sanity checks.",
      econReason: "Higher engineering complexity.",
      envReason: "More processing at the edge.",
      socialReason: "Improves reliability without central surveillance.",
    },
    {
      id: "val-human",
      title: "Human in the loop",
      functionLabel: "Escalate anomalies to human operators",
      description: "Operators review flagged anomalies in a control center.",
      tech: 0, econ: -2, env: 0, social: 2,
      techReason: "Human judgment catches nuanced problems.",
      econReason: "Requires ongoing staff time.",
      envReason: "Negligible extra compute.",
      socialReason: "Creates jobs and oversight.",
    },
  ],

  model: [
    {
      id: "mod-stat",
      title: "Lightweight statistical model",
      functionLabel: "Predict using simple historical trends",
      description: "Simple time series model based on historical averages.",
      tech: -1, econ: 3, env: 3, social: -2,
      techReason: "Struggles with unusual situations.",
      econReason: "Very low development cost.",
      envReason: "Very low energy usage.",
      socialReason: "Limited quality of service.",
    },
    {
      id: "mod-gnn",
      title: "Deep graph model",
      functionLabel: "Predict using a heavy deep-learning model",
      description: "Graph neural network that models full road network dynamics.",
      tech: 3, econ: -2, env: -3, social: 3,
      techReason: "High accuracy in complex traffic patterns.",
      econReason: "Expensive training and tuning.",
      envReason: "Heavy GPU training.",
      socialReason: "Better travel times for many citizens.",
    },
    {
      id: "mod-versioned",
      title: "Versioned main plus light models",
      functionLabel: "Switch between heavy and light models",
      description: "Keeps both heavy and light models and can switch between them.",
      tech: 2, econ: -1, env: 1, social: 1,
      techReason: "Flexible across operating conditions.",
      econReason: "Extra engineering and maintenance.",
      envReason: "Can use light model to save energy.",
      socialReason: "Generally good service with some variation.",
    },
    {
      id: "mod-foundation",
      title: "Pre-trained smart-city model",
      functionLabel: "Fine-tune a vendor smart-city model",
      description: "Fine tunes a large vendor model trained for generic city data.",
      tech: 2, econ: -3, env: -2, social: -1,
      techReason: "Good accuracy and fast rollout.",
      econReason: "High licensing and inference cost.",
      envReason: "Heavy inference compute.",
      socialReason: "Creates long term dependency on vendor.",
    },
    {
      id: "mod-federated",
      title: "Federated learning model",
      functionLabel: "Train models locally on edge devices",
      description: "Training happens at intersections, data never leaves sensors.",
      tech: -1, econ: 0, env: 0, social: 3,
      techReason: "Very complex to coordinate.",
      econReason: "Saves on central data transfer.",
      envReason: "Energy is shifted to many small nodes.",
      socialReason: "Strong privacy for neighborhoods.",
    },
  ],

  deployment: [
    {
      id: "dep-cloud",
      title: "Central cloud server",
      functionLabel: "Serve predictions from a central cloud",
      description: "Single central cluster serves predictions for the whole city.",
      tech: 2, econ: -2, env: -1, social: 0,
      techReason: "Simple updates and rollbacks.",
      econReason: "Recurring cloud and traffic cost.",
      envReason: "Large central energy footprint.",
      socialReason: "Standard availability.",
    },
    {
      id: "dep-edge",
      title: "Edge deployment",
      functionLabel: "Run models on edge devices at intersections",
      description: "Models run on compute units at each major intersection.",
      tech: -2, econ: 2, env: 2, social: 2,
      techReason: "Complex fleet management and updates.",
      econReason: "Saves central server cost.",
      envReason: "Less data movement.",
      socialReason: "Fast reaction times even during outages.",
    },
    {
      id: "dep-vendor",
      title: "Proprietary vendor platform",
      functionLabel: "Outsource operation to a closed platform",
      description: "Smart city platform from a vendor where internals are hidden.",
      tech: -2, econ: -2, env: 0, social: -2,
      techReason: "Limited customisation and debugging.",
      econReason: "Fees and lock in.",
      envReason: "Unknown energy profile.",
      socialReason: "Future generations inherit the lock in.",
    },
    {
      id: "dep-hybrid",
      title: "Hybrid cloud plus edge",
      functionLabel: "Mix cloud overview with edge decisions",
      description: "Combine central intelligence with small edge decision logic.",
      tech: -1, econ: -1, env: 0, social: 3,
      techReason: "Most complex architecture to run.",
      econReason: "Costs on both sides.",
      envReason: "Balanced impact.",
      socialReason: "High resilience and continuity.",
    },
    {
      id: "dep-onprem",
      title: "City data center",
      functionLabel: "Run the system in a city-owned data center",
      description: "Runs on servers owned and operated by the city.",
      tech: 0, econ: -1, env: -2, social: 3,
      techReason: "Requires strong internal team.",
      econReason: "Capex and maintenance burden.",
      envReason: "Often less efficient than modern cloud.",
      socialReason: "City keeps control over infrastructure.",
    },
  ],

  monitoring: [
    {
      id: "mon-none",
      title: "Deploy and Pray",
      functionLabel: "Deploy once and never monitor",
      description: "No monitoring. Failures are found when citizens complain.",
      tech: -3, econ: 2, env: 1, social: -4,
      techReason: "Model drift and bugs go undetected.",
      econReason: "Zero monitoring cost.",
      envReason: "No monitoring compute.",
      socialReason: "Breaks trust and harms daily life.",
    },
    {
      id: "mon-manual",
      title: "Basic monitoring and manual retrain",
      functionLabel: "Inspect dashboards and retrain manually",
      description: "Drift and errors are logged and engineers retrain when needed.",
      tech: 1,  econ: 1, env: 0, social: -1,
      techReason: "Failures are eventually fixed.",
      econReason: "Low engineering overhead.",
      envReason: "Neutral energy impact.",
      socialReason: "Service degrades for periods before fixes.",
    },
    {
      id: "mon-self",
      title: "Full self-adaptive loop",
      functionLabel: "Self-adapt using monitoring signals",
      description: "System reacts to drift and energy and can switch models or retrain.",
      tech: 3, econ: -3, env: -2, social: 2,
      techReason: "Resilient and self healing.",
      econReason: "High complexity and cost.",
      envReason: "Retraining spikes energy use.",
      socialReason: "Reliability is high most of the time.",
    },
    {
      id: "mon-energy",
      title: "Energy-aware adaptation",
      functionLabel: "Switch to low-power mode during grid stress",
      description: "During grid stress, system switches to light model to reduce load.",
      tech: 0, econ: 1, env: 3, social: -1,
      techReason: "Optimises for energy, not quality.",
      econReason: "Lowers energy bills.",
      envReason: "Supports the electrical grid.",
      socialReason: "Accuracy drops when saving energy.",
    },
    {
      id: "mon-community",
      title: "Community feedback loop",
      functionLabel: "Ask citizens to rate predictions",
      description: "Citizens rate usefulness of predictions in a mobile app.",
      tech: -1, econ: 0, env: 0, social: 2,
      techReason: "Subjective and noisy signal.",
      econReason: "Cheap to run.",
      envReason: "Negligible impact.",
      socialReason: "Residents are directly involved and heard.",
    },
  ],
};

/** ------------------------------------------------------
 *  Helpers
 * -----------------------------------------------------*/
function computeTotals(selectedByStage) {
  const totals = { tech: 0, econ: 0, env: 0, social: 0 };
  for (const card of Object.values(selectedByStage)) {
    if (!card) continue;
    totals.tech   += card.tech   || 0;
    totals.econ   += card.econ   || 0;
    totals.env    += card.env    || 0;
    totals.social += card.social || 0;
  }
  return totals;
}

function verdict(totals) {
  const { tech, econ, env, social } = totals;
  const parts = [];
  if (tech   >= 4) parts.push("strong technical behavior");
  else if (tech   <= -3) parts.push("fragile technical behavior");
  if (econ   >= 4) parts.push("low operating cost");
  else if (econ   <= -3) parts.push("high economic burden");
  if (env    >= 4) parts.push("low environmental footprint");
  else if (env    <= -3) parts.push("heavy environmental impact");
  if (social >= 4) parts.push("high social benefit and equity");
  else if (social <= -3) parts.push("risk of social harm or exclusion");
  if (!parts.length) return "This pipeline is fairly balanced but not outstanding in any single dimension.";
  return "This pipeline leans toward " + parts.join(", ") + ".";
}

/** ------------------------------------------------------
 *  UI pieces
 * -----------------------------------------------------*/
function Card({ card, selected, onSelect }) {
  return (
    <button
      type="button"
      className={"card" + (selected ? " card-selected" : "")}
      onClick={onSelect}
    >
      <div className="card-title">{card.title}</div>
      <div className="card-function">Function: <span>{card.functionLabel}</span></div>
      <div className="card-desc">{card.description}</div>
      <div className="card-scores">
        <div className="score-row"><span className="score-label">Tech</span><span className="score-value">{card.tech}</span></div>
        <div className="score-row"><span className="score-label">Econ</span><span className="score-value">{card.econ}</span></div>
        <div className="score-row"><span className="score-label">Env</span><span className="score-value">{card.env}</span></div>
        <div className="score-row"><span className="score-label">Social</span><span className="score-value">{card.social}</span></div>
      </div>
    </button>
  );
}

function ProgressBar({ currentStageIndex }) {
  const percent = ((currentStageIndex + 1) / STAGES.length) * 100;
  return (
    <div className="progress">
      <div className="progress-label">Stage {currentStageIndex + 1} of {STAGES.length}</div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

function PreviewPanel({ selectedByStage }) {
  const totals = useMemo(() => computeTotals(selectedByStage), [selectedByStage]);
  return (
    <div className="preview-panel">
      <h3 className="panel-heading">Current sustainability scores</h3>
      <div className="score-table">
        <div className="score-row"><span className="score-label">Technical</span><span className="score-value">{totals.tech}</span></div>
        <div className="score-row"><span className="score-label">Economic</span><span className="score-value">{totals.econ}</span></div>
        <div className="score-row"><span className="score-label">Environmental</span><span className="score-value">{totals.env}</span></div>
        <div className="score-row"><span className="score-label">Social</span><span className="score-value">{totals.social}</span></div>
      </div>

      <h3 className="panel-heading panel-heading-secondary">Locked pipeline</h3>
      <ul className="pipeline-list">
        {STAGES.map(stage => {
          const card = selectedByStage[stage.id];
          return (
            <li key={stage.id} className="pipeline-item">
              <span className="pipeline-stage">{stage.label}</span>
              <span className="pipeline-card">{card ? card.functionLabel : "Not chosen yet"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** ------------------------------------------------------
 *  Build a readable decision map from selections
 *  Functions in the middle (functionLabel)
 *  Metrics on the right (METRICS)
 * -----------------------------------------------------*/
function buildDecisionMapGraph(selectedByStage) {
  const decisions = [];
  const links = [];

  STAGES.forEach((stage, index) => {
    const card = selectedByStage[stage.id];
    if (!card) return;

    const decisionId = stage.id;
    decisions.push({ id: decisionId, label: card.functionLabel || card.title, index });

    // derive metric effects from the 4 scores and stage type
    const effects = [];

    if (card.tech) {
      effects.push({ to: "modelPerf",  v: card.tech });
      if (stage.id === "model" || stage.id === "deployment" || stage.id === "monitoring") {
        effects.push({ to: "systemPerf", v: Math.sign(card.tech) });
      }
    }
    if (card.env)  effects.push({ to: "energy",          v: card.env });
    if (card.econ) effects.push({ to: "operationalCost", v: card.econ });
    if (card.social) effects.push({ to: "socialImpact",  v: card.social });

    // keep the strongest few by absolute value to avoid spaghetti
    effects
      .filter(e => e.v !== 0)
      .sort((a, b) => Math.abs(b.v) - Math.abs(a.v))
      .slice(0, MAX_LINKS_PER_FUNCTION)
      .forEach(e => {
        links.push({
          from: decisionId,
          to: e.to,
          value: e.v,
          sign: e.v > 0 ? "positive" : "negative",
        });
      });
  });

  return { decisions, metrics: METRICS, links };
}

/** ------------------------------------------------------
 *  Decision map visual
 *  compact = smaller version shown during stages
 * -----------------------------------------------------*/
function DecisionMap({ selectedByStage, compact = false }) {
  const { decisions, metrics, links } = buildDecisionMapGraph(selectedByStage);
  const [activeDecision, setActiveDecision] = React.useState(null);
  const [activeMetric, setActiveMetric] = React.useState(null);

  const width = 920;
  const height = Math.max(260, 80 + 46 * Math.max(decisions.length, metrics.length));

  const systemX = 80;
  const systemY = height / 2;

  const decisionX = 280;
  const decisionStartY = 80;
  const decisionGapY = 46;

  const metricX = 680;
  const metricStartY = 70;
  const metricGapY = 40;

  return (
    <div className={"decision-map" + (compact ? " decision-map-compact" : "")}>
      {!compact ? (
        <>
          <h3 className="panel-heading">Decision map</h3>
          <p className="map-subheading">
            Functions in the middle, metrics on the right. Green arrows are positive effects, orange are negative.
          </p>
        </>
      ) : (
        <h3 className="panel-heading">Decision map so far</h3>
      )}

      <div className="dm-svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img">
          <defs>
            <marker id="arrow-pos" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#16a34a" />
            </marker>
            <marker id="arrow-neg" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#f97316" />
            </marker>
            <marker id="arrow-req" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#9ca3af" />
            </marker>
          </defs>

          {/* System bubble */}
          <g>
            <circle cx={systemX} cy={systemY} r={30} fill="#fff" stroke="#94a3b8" strokeWidth={1.1} />
            <text x={systemX} y={systemY - 4} textAnchor="middle" fontSize="9">Traffic flow</text>
            <text x={systemX} y={systemY + 10} textAnchor="middle" fontSize="9">pipeline</text>
          </g>

          {/* Dotted requirement hints from system to functions */}
          {decisions.map((d, i) => {
            const y = decisionStartY + i * decisionGapY;
            return (
              <line key={`rq-${d.id}`}
                x1={systemX + 30} y1={systemY}
                x2={decisionX - 72} y2={y}
                stroke="#9ca3af" strokeWidth="0.9" strokeDasharray="4 4"
                markerEnd="url(#arrow-req)" />
            );
          })}

          {/* Impact links */}
          {links.map((lnk, i) => {
            const di = decisions.find((d) => d.id === lnk.from)?.index ?? 0;
            const mi = metrics.findIndex((m) => m.id === lnk.to);
            const y1 = decisionStartY + di * decisionGapY;
            const y2 = metricStartY + mi * metricGapY;
            const color = lnk.sign === "positive" ? "#16a34a" : "#f97316";
            const dimmed =
              (activeDecision && lnk.from !== activeDecision) ||
              (activeMetric && lnk.to !== activeMetric);

            return (
              <line
                key={`ln-${i}`}
                x1={decisionX + 95}
                y1={y1}
                x2={metricX - 95}
                y2={y2}
                stroke={color}
                strokeWidth={0.8 + 0.4 * Math.min(3, Math.abs(lnk.value))}
                strokeOpacity={dimmed ? 0.25 : 0.95}
                markerEnd={`url(#${lnk.sign === "positive" ? "arrow-pos" : "arrow-neg"})`}
              />
            );
          })}

          {/* Function ovals */}
          {decisions.map((d, i) => {
            const y = decisionStartY + i * decisionGapY;
            const on = !activeMetric && (activeDecision === null || activeDecision === d.id);
            return (
              <g key={d.id}
                 onMouseEnter={() => setActiveDecision(d.id)}
                 onMouseLeave={() => setActiveDecision(null)}
                 style={{ opacity: on ? 1 : 0.5, cursor: "pointer" }}>
                <ellipse cx={decisionX} cy={y} rx="120" ry="14" fill="#e5f0ff" stroke="#64748b" strokeWidth="0.9"/>
                <text x={decisionX} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10">{d.label}</text>
              </g>
            );
          })}

          {/* Metric chips */}
          {metrics.map((m, i) => {
            const y = metricStartY + i * metricGapY - 13;
            const on = !activeDecision && (activeMetric === null || activeMetric === m.id);
            const fill =
              m.theme === "tech"  ? "#e7f0ff" :
              m.theme === "env"   ? "#dcfce7" :
              m.theme === "econ"  ? "#ffe4e6" :
                                    "#fff7cc";
            return (
              <g key={m.id}
                 onMouseEnter={() => setActiveMetric(m.id)}
                 onMouseLeave={() => setActiveMetric(null)}
                 style={{ opacity: on ? 1 : 0.55, cursor: "pointer" }}>
                <rect x={metricX-90} y={y} width="180" height="26" rx="13" fill={fill} stroke="#cbd5f5" strokeWidth="0.8"/>
                <text x={metricX} y={y+14} textAnchor="middle" fontSize="10">{m.label}</text>
              </g>
            );
          })}
        </svg>

        {!compact && (
          <div className="dm-legend">
            <span className="dm-legend-title">Legend</span>
            <span className="dm-legend-item"><span className="dm-legend-line dm-positive" /> positive impact</span>
            <span className="dm-legend-item"><span className="dm-legend-line dm-negative" /> negative impact</span>
            <span className="dm-legend-item"><span className="dm-legend-line dm-requirement" /> requirement link</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** ------------------------------------------------------
 *  Main app
 * -----------------------------------------------------*/
export default function App() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedByStage, setSelectedByStage] = useState({
    ingestion: null, validation: null, model: null, deployment: null, monitoring: null,
  });
  const [showSummary, setShowSummary] = useState(false);

  const currentStage    = STAGES[currentStageIndex];
  const cardsForStage   = CARD_DATA[currentStage.id];
  const currentSelection= selectedByStage[currentStage.id];

  const totals = useMemo(() => computeTotals(selectedByStage), [selectedByStage]);

  function handleSelectCard(card) {
    setSelectedByStage(prev => ({ ...prev, [currentStage.id]: card }));
  }

  function handleNext() {
    if (!currentSelection) return;
    if (currentStageIndex === STAGES.length - 1) setShowSummary(true);
    else setCurrentStageIndex(i => i + 1);
  }

  function handleRestart() {
    setSelectedByStage({ ingestion: null, validation: null, model: null, deployment: null, monitoring: null });
    setCurrentStageIndex(0);
    setShowSummary(false);
  }

  if (showSummary) {
    return (
      <div className="app-root">
        <header className="app-header">
          <h1>Pipeline Architects - TrafficFlow</h1>
          <p className="app-subtitle">Final sustainability report for your traffic prediction pipeline.</p>
        </header>

        <main className="app-main app-main-summary">
          <section className="summary-left">
            <h2 className="summary-heading">Sustainability snapshot</h2>

            <div className="summary-grid">
              <div className="summary-dimension dim-tech"><div className="summary-dim-label">Technical</div><div className="summary-dim-score">{totals.tech}</div></div>
              <div className="summary-dimension dim-econ"><div className="summary-dim-label">Economic</div><div className="summary-dim-score">{totals.econ}</div></div>
              <div className="summary-dimension dim-env"><div className="summary-dim-label">Environmental</div><div className="summary-dim-score">{totals.env}</div></div>
              <div className="summary-dimension dim-social"><div className="summary-dim-label">Social</div><div className="summary-dim-score">{totals.social}</div></div>
            </div>

            <div className="verdict-box">
              <h3>Verdict</h3>
              <p>{verdict(totals)}</p>
            </div>

            <button className="btn btn-primary restart-btn" onClick={handleRestart}>Build a new pipeline</button>
          </section>

          <section className="summary-right">
            <DecisionMap selectedByStage={selectedByStage} />
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Pipeline Architects - TrafficFlow</h1>
        <p className="app-subtitle">Build a traffic flow prediction pipeline and explore its sustainability trade-offs.</p>
      </header>

      <ProgressBar currentStageIndex={currentStageIndex} />

      <main className="app-main">
        <section className="stage-section">
          <h2 className="stage-title">{currentStage.label}</h2>
          <p className="stage-help">{STAGE_DESCRIPTIONS[currentStage.id]}</p>

          <div className="card-grid">
            {cardsForStage.map(card => (
              <Card
                key={card.id}
                card={card}
                selected={currentSelection && currentSelection.id === card.id}
                onSelect={() => handleSelectCard(card)}
              />
            ))}
          </div>

          <div className="nav-row nav-right">
            <button className="btn btn-primary" onClick={handleNext} disabled={!currentSelection}>
              {currentStageIndex === STAGES.length - 1 ? "Finish and see report" : "Lock choice and continue"}
            </button>
          </div>

          {/* Live map while playing (compact) */}
          <div className="stage-decision-map">
            <DecisionMap selectedByStage={selectedByStage} compact />
          </div>
        </section>

        <aside className="aside-section">
          <PreviewPanel selectedByStage={selectedByStage} />
        </aside>
      </main>
    </div>
  );
}

import React, { useState, useMemo } from "react";

/**
 * Game data
 */

const STAGES = [
  { id: "ingestion", label: "Stage 1 - Data ingestion" },
  { id: "validation", label: "Stage 2 - Data validation" },
  { id: "model", label: "Stage 3 - Prediction model" },
  { id: "deployment", label: "Stage 4 - Deployment" },
  { id: "monitoring", label: "Stage 5 - Monitoring and adaptation" },
];

// Concrete sustainability metrics shown on the right of the decision map
const METRICS = [
  { id: "modelPerf", label: "Model performance", theme: "tech" },
  {
    id: "systemPerf",
    label: "System performance (response time)",
    theme: "tech",
  },
  { id: "energy", label: "Energy consumption", theme: "env" },
  { id: "operationalCost", label: "Operational cost", theme: "econ" },
  { id: "socialImpact", label: "Social impact and equity", theme: "social" },
];



const CARD_DATA = {
  ingestion: [
    {
      id: "ing-loop",
      title: "Magnetic-loop sensors",
      // NEW: what the function actually does
      functionLabel: "Count vehicles with simple road sensors",
      description:
        "Buries simple loops in the road to count vehicles as they pass.",
      tech: -2,
      econ: 3,
      env: 2,
      social: -1,
      techReason: "Very low fidelity data.",
      econReason: "Extremely cheap and durable.",
      envReason: "Very low power use.",
      socialReason: "Predictions are basic and limited in benefit.",
    },
    {
      id: "ing-video",
      title: "HD video cameras",
      functionLabel: "Capture high-resolution video footage",
      description:
        "Streams 24x7 video from intersections for AI object detection.",
      tech: 2,
      econ: -2,
      env: -2,
      social: -1,
      techReason: "Rich data for many use cases.",
      econReason: "High hardware and streaming costs.",
      envReason: "Continuous power use.",
      socialReason: "Feels like surveillance and harms trust.",
    },
    {
      id: "ing-lidar",
      title: "LiDAR and radar sensors",
      functionLabel: "Sense precise 3D positions of road users",
      description:
        "Advanced sensors for precise 3D tracking of all road users.",
      tech: 3,
      econ: -3,
      env: -1,
      social: 2,
      techReason: "Highest accuracy in all weather.",
      econReason: "Very expensive hardware.",
      envReason: "Higher energy per sensor.",
      socialReason: "High quality data with built in anonymity.",
    },
    {
      id: "ing-crowd",
      title: "Crowdsourced app data",
      functionLabel: "Collect volunteer phone traces",
      description:
        "Uses location data from citizens using a city mobility app.",
      tech: 0,
      econ: 2,
      env: 1,
      social: -2,
      techReason: "Noisy and sparse, depends on adoption.",
      econReason: "Cheap because phones already exist.",
      envReason: "No extra infrastructure.",
      socialReason: "Biased toward smartphone users.",
    },
    {
      id: "ing-audio",
      title: "Acoustic sensors",
      functionLabel: "Listen for traffic sounds and incidents",
      description:
        "Microphones detect traffic flow and incident sounds such as crashes.",
      tech: 1,
      econ: 1,
      env: 1,
      social: -3,
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
      tech: -3,
      econ: 2,
      env: 1,
      social: -3,
      techReason: "High risk of failure due to bad data.",
      econReason: "No validation cost.",
      envReason: "No extra compute.",
      socialReason: "Faulty predictions can harm community mobility.",
    },
    {
      id: "val-simple",
      title: "Simple anomaly check",
      functionLabel: "Filter impossible or clearly broken values",
      description:
        "Drops impossible values such as negative counts or absurd peaks.",
      tech: 1,
      econ: 1,
      env: 1,
      social: 0,
      techReason: "Prevents trivial data problems.",
      econReason: "Very cheap rules.",
      envReason: "Minor extra compute.",
      socialReason: "Basic reliability only.",
    },
    {
      id: "val-twin",
      title: "Full digital twin sync",
      functionLabel: "Validate data against a digital twin",
      description:
        "Validates data by comparing against a real-time digital twin of the city.",
      tech: 3,
      econ: -3,
      env: -3,
      social: 2,
      techReason: "Very robust and physically grounded.",
      econReason: "Expensive to build and maintain.",
      envReason: "High compute load.",
      socialReason: "More trustworthy predictions for citizens.",
    },
    {
      id: "val-peer",
      title: "Peer sensor cross-check",
      functionLabel: "Cross-check sensors with their neighbours",
      description:
        "Sensors compare values with neighbors to spot inconsistent readings.",
      tech: 2,
      econ: -1,
      env: -1,
      social: 1,
      techReason: "Decentralized sanity checks.",
      econReason: "Higher engineering complexity.",
      envReason: "More processing at the edge.",
      socialReason: "Improves reliability without central surveillance.",
    },
    {
      id: "val-human",
      title: "Human in the loop",
      functionLabel: "Escalate anomalies to human operators",
      description:
        "Operators review flagged anomalies in a control center.",
      tech: 0,
      econ: -2,
      env: 0,
      social: 2,
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
      description:
        "Simple time series model based on historical averages.",
      tech: -1,
      econ: 3,
      env: 3,
      social: -2,
      techReason: "Struggles with unusual situations.",
      econReason: "Very low development cost.",
      envReason: "Very low energy usage.",
      socialReason: "Limited quality of service.",
    },
    {
      id: "mod-gnn",
      title: "Deep graph model",
      functionLabel: "Predict using a heavy deep-learning model",
      description:
        "Graph neural network that models full road network dynamics.",
      tech: 3,
      econ: -2,
      env: -3,
      social: 3,
      techReason: "High accuracy in complex traffic patterns.",
      econReason: "Expensive training and tuning.",
      envReason: "Heavy GPU training.",
      socialReason: "Better travel times for many citizens.",
    },
    {
      id: "mod-versioned",
      title: "Versioned main plus light models",
      functionLabel: "Switch between heavy and light models",
      description:
        "Keeps both heavy and light models and can switch between them.",
      tech: 2,
      econ: -1,
      env: 1,
      social: 1,
      techReason: "Flexible across operating conditions.",
      econReason: "Extra engineering and maintenance.",
      envReason: "Can use light model to save energy.",
      socialReason: "Generally good service with some variation.",
    },
    {
      id: "mod-foundation",
      title: "Pre-trained smart-city model",
      functionLabel: "Fine-tune a vendor smart-city model",
      description:
        "Fine tunes a large vendor model trained for generic city data.",
      tech: 2,
      econ: -3,
      env: -2,
      social: -1,
      techReason: "Good accuracy and fast rollout.",
      econReason: "High licensing and inference cost.",
      envReason: "Heavy inference compute.",
      socialReason: "Creates long term dependency on vendor.",
    },
    {
      id: "mod-federated",
      title: "Federated learning model",
      functionLabel: "Train models locally on edge devices",
      description:
        "Training happens at intersections, data never leaves sensors.",
      tech: -1,
      econ: 0,
      env: 0,
      social: 3,
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
      description:
        "Single central cluster serves predictions for the whole city.",
      tech: 2,
      econ: -2,
      env: -1,
      social: 0,
      techReason: "Simple updates and rollbacks.",
      econReason: "Recurring cloud and traffic cost.",
      envReason: "Large central energy footprint.",
      socialReason: "Standard availability.",
    },
    {
      id: "dep-edge",
      title: "Edge deployment",
      functionLabel: "Run models on edge devices at intersections",
      description:
        "Models run on compute units at each major intersection.",
      tech: -2,
      econ: 2,
      env: 2,
      social: 2,
      techReason: "Complex fleet management and updates.",
      econReason: "Saves central server cost.",
      envReason: "Less data movement.",
      socialReason: "Fast reaction times even during outages.",
    },
    {
      id: "dep-vendor",
      title: "Proprietary vendor platform",
      functionLabel: "Outsource operation to a closed platform",
      description:
        "Smart city platform from a vendor where internals are hidden.",
      tech: -2,
      econ: -2,
      env: 0,
      social: -3,
      techReason: "Limited customisation and debugging.",
      econReason: "Fees and lock in.",
      envReason: "Unknown energy profile.",
      socialReason: "Future generations inherit the lock in.",
    },
    {
      id: "dep-hybrid",
      title: "Hybrid cloud plus edge",
      functionLabel: "Mix cloud overview with edge decisions",
      description:
        "Combine central intelligence with small edge decision logic.",
      tech: -1,
      econ: -1,
      env: 0,
      social: 3,
      techReason: "Most complex architecture to run.",
      econReason: "Costs on both sides.",
      envReason: "Balanced impact.",
      socialReason: "High resilience and continuity.",
    },
    {
      id: "dep-onprem",
      title: "City data center",
      functionLabel: "Run the system in a city-owned data center",
      description:
        "Runs on servers owned and operated by the city.",
      tech: 0,
      econ: -1,
      env: -2,
      social: 3,
      techReason: "Requires strong internal team.",
      econReason: "Capex and maintenance burden.",
      envReason: "Often less efficient than modern cloud.",
      socialReason: "City keeps control over infrastructure.",
    },
  ],

  monitoring: [
    {
      id: "mon-none",
      title: "Deploy and ignore",
      functionLabel: "Deploy once and never monitor",
      description:
        "No monitoring. Failures are found when citizens complain.",
      tech: -3,
      econ: 2,
      env: 1,
      social: -4,
      techReason: "Model drift and bugs go undetected.",
      econReason: "Zero monitoring cost.",
      envReason: "No monitoring compute.",
      socialReason: "Breaks trust and harms daily life.",
    },
    {
      id: "mon-manual",
      title: "Basic monitoring and manual retrain",
      functionLabel: "Inspect dashboards and retrain manually",
      description:
        "Drift and errors are logged and engineers retrain when needed.",
      tech: 1,
      econ: 1,
      env: 0,
      social: -1,
      techReason: "Failures are eventually fixed.",
      econReason: "Low engineering overhead.",
      envReason: "Neutral energy impact.",
      socialReason: "Service degrades for periods before fixes.",
    },
    {
      id: "mon-self",
      title: "Full self-adaptive loop",
      functionLabel: "Self-adapt using monitoring signals",
      description:
        "System reacts to drift and energy and can switch models or retrain.",
      tech: 3,
      econ: -3,
      env: -2,
      social: 2,
      techReason: "Resilient and self healing.",
      econReason: "High complexity and cost.",
      envReason: "Retraining spikes energy use.",
      socialReason: "Reliability is high most of the time.",
    },
    {
      id: "mon-energy",
      title: "Energy-aware adaptation",
      functionLabel: "Switch to low-power mode during grid stress",
      description:
        "During grid stress, system switches to light model to reduce load.",
      tech: 0,
      econ: 1,
      env: 3,
      social: -1,
      techReason: "Optimises for energy, not quality.",
      econReason: "Lowers energy bills.",
      envReason: "Supports the electrical grid.",
      socialReason: "Accuracy drops when saving energy.",
    },
    {
      id: "mon-community",
      title: "Community feedback loop",
      functionLabel: "Ask citizens to rate predictions",
      description:
        "Citizens rate usefulness of predictions in a mobile app.",
      tech: -1,
      econ: 0,
      env: 0,
      social: 2,
      techReason: "Subjective and noisy signal.",
      econReason: "Cheap to run.",
      envReason: "Negligible impact.",
      socialReason: "Residents are directly involved and heard.",
    },
  ],
};

/**
 * Helpers
 */

function computeTotals(selectedByStage) {
  let totals = { tech: 0, econ: 0, env: 0, social: 0 };
  for (const card of Object.values(selectedByStage)) {
    if (!card) continue;
    totals.tech += card.tech;
    totals.econ += card.econ;
    totals.env += card.env;
    totals.social += card.social;
  }
  return totals;
}

function verdict(totals) {
  const { tech, econ, env, social } = totals;
  const parts = [];

  if (tech >= 4) parts.push("strong technical behavior");
  else if (tech <= -3) parts.push("fragile technical behavior");

  if (econ >= 4) parts.push("low operating cost");
  else if (econ <= -3) parts.push("high economic burden");

  if (env >= 4) parts.push("low environmental footprint");
  else if (env <= -3) parts.push("heavy environmental impact");

  if (social >= 4) parts.push("high social benefit and equity");
  else if (social <= -3) parts.push("risk of social harm or exclusion");

  if (parts.length === 0) {
    return "This pipeline is fairly balanced but not outstanding in any single dimension.";
  }

  return "This pipeline leans toward " + parts.join(", ") + ".";
}

/**
 * UI pieces
 */

function Card({ card, selected, onSelect }) {
  return (
    <button
      type="button"
      className={"card" + (selected ? " card-selected" : "")}
      onClick={onSelect}
    >
      <div className="card-title">{card.title}</div>
      <div className="card-function">
        Function: <span>{card.functionLabel}</span>
      </div>
      <div className="card-desc">{card.description}</div>
      <div className="card-scores">
        <div className="score-row">
          <span className="score-label">Tech</span>
          <span className="score-value">{card.tech}</span>
        </div>
        <div className="score-row">
          <span className="score-label">Econ</span>
          <span className="score-value">{card.econ}</span>
        </div>
        <div className="score-row">
          <span className="score-label">Env</span>
          <span className="score-value">{card.env}</span>
        </div>
        <div className="score-row">
          <span className="score-label">Social</span>
          <span className="score-value">{card.social}</span>
        </div>
      </div>
    </button>
  );
}

function ProgressBar({ currentStageIndex }) {
  const percent = ((currentStageIndex + 1) / STAGES.length) * 100;
  return (
    <div className="progress">
      <div className="progress-label">
        Stage {currentStageIndex + 1} of {STAGES.length}
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function PreviewPanel({ selectedByStage }) {
  const totals = useMemo(
    () => computeTotals(selectedByStage),
    [selectedByStage]
  );

  return (
    <div className="preview-panel">
      <h3 className="panel-heading">Current sustainability scores</h3>
      <div className="score-table">
        <div className="score-row">
          <span className="score-label">Technical</span>
          <span className="score-value">{totals.tech}</span>
        </div>
        <div className="score-row">
          <span className="score-label">Economic</span>
          <span className="score-value">{totals.econ}</span>
        </div>
        <div className="score-row">
          <span className="score-label">Environmental</span>
          <span className="score-value">{totals.env}</span>
        </div>
        <div className="score-row">
          <span className="score-label">Social</span>
          <span className="score-value">{totals.social}</span>
        </div>
      </div>

      <h3 className="panel-heading panel-heading-secondary">Locked pipeline</h3>
      <ul className="pipeline-list">
        {STAGES.map((stage) => {
          const card = selectedByStage[stage.id];
          return (
            <li key={stage.id} className="pipeline-item">
              <span className="pipeline-stage">{stage.label}</span>
              <span className="pipeline-card">
                {card ? card.functionLabel : "Not chosen yet"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Decision map data from selections
 * Middle nodes = functions (functionLabel)
 * Right nodes  = the four sustainability concerns
 */

function buildDecisionMapGraph(selectedByStage) {
  const decisions = [];
  const metrics = METRICS;
  const links = [];

  function addMetricLink(decisionId, metricId, rawValue) {
    if (!rawValue) return;
    links.push({
      from: decisionId,
      to: metricId,
      value: rawValue,
      sign: rawValue > 0 ? "positive" : "negative",
    });
  }

  STAGES.forEach((stage, index) => {
    const card = selectedByStage[stage.id];
    if (!card) return;

    // Middle node text - use function style phrasing
    const decisionId = stage.id;
    decisions.push({
      id: decisionId,
      label: card.functionLabel || card.title,
      index,
    });

    const { tech, econ, env, social } = card;

    // Technical -> model performance (and sometimes response time)
    if (tech) {
      addMetricLink(decisionId, "modelPerf", tech);

      // only model / deployment / monitoring influence response time directly
      if (
        stage.id === "model" ||
        stage.id === "deployment" ||
        stage.id === "monitoring"
      ) {
        addMetricLink(decisionId, "systemPerf", tech);
      }
    }

    // Environmental -> energy consumption
    if (env) {
      addMetricLink(decisionId, "energy", env);
    }

    // Economic -> operational cost
    if (econ) {
      addMetricLink(decisionId, "operationalCost", econ);
    }

    // Social -> social impact and equity
    if (social) {
      addMetricLink(decisionId, "socialImpact", social);
    }
  });

  return { decisions, metrics, links };
}



/**
 * Decision map visual
 * `compact` = smaller version shown during the stages
 */

function DecisionMap({ selectedByStage, compact = false }) {
  const { decisions, metrics, links } = buildDecisionMapGraph(selectedByStage);
  const [activeDecision, setActiveDecision] = React.useState(null);
  const [activeMetric, setActiveMetric] = React.useState(null);

  const width = 920;
  const height = compact ? 260 : 360;

  const systemX = 80;
  const systemY = height / 2;

  const decisionX = 280;
  const decisionStartY = 80;
  const decisionGapY = 45;

  const metricX = 680;
  const metricStartY = 70;
  const metricGapY = 50;

  if (decisions.length === 0) {
    return (
      <div className={"decision-map" + (compact ? " decision-map-compact" : "")}>
        <h3 className="panel-heading">
          {compact ? "Decision map so far" : "Decision map"}
        </h3>
        <p className="map-subheading">
          Your functions will appear here as you lock each stage.
        </p>
      </div>
    );
  }

  return (
    <div className={"decision-map" + (compact ? " decision-map-compact" : "")}>
      {!compact ? (
        <>
          <h3 className="panel-heading">Decision map</h3>
          <p className="map-subheading">
            Functions are in the middle, metrics on the right
            (performance, energy, cost, social impact). Green arrows are
            positive effects, orange are negative.
          </p>
        </>
      ) : (
        <h3 className="panel-heading">Decision map so far</h3>
      )}

      <div className="dm-svg-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          role="img"
        >
          <defs>
            <marker
              id="arrow-pos"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
            </marker>
            <marker
              id="arrow-neg"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
            </marker>
            <marker
              id="arrow-req"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
            </marker>
          </defs>

          {/* System circle */}
          <g>
            <circle
              cx={systemX}
              cy={systemY}
              r={32}
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth={1.2}
            />
            <text
              x={systemX}
              y={systemY - 5}
              textAnchor="middle"
              fontSize="9"
              fill="#0f172a"
            >
              Traffic flow
            </text>
            <text
              x={systemX}
              y={systemY + 9}
              textAnchor="middle"
              fontSize="9"
              fill="#0f172a"
            >
              pipeline
            </text>
          </g>

          {/* Dotted requirement arrows */}
          {decisions.map((dec, i) => {
            const y = decisionStartY + i * decisionGapY;
            return (
              <line
                key={`req-${dec.id}`}
                x1={systemX + 32}
                y1={systemY}
                x2={decisionX - 70}
                y2={y}
                stroke="#9ca3af"
                strokeWidth={0.8}
                strokeDasharray="4 4"
                markerEnd="url(#arrow-req)"
              />
            );
          })}

          {/* Effect links */}
          {links.map((link, idx) => {
            const decIndex =
              decisions.find((d) => d.id === link.from)?.index ?? 0;
            const metIndex = metrics.findIndex((m) => m.id === link.to);

            const y1 = decisionStartY + decIndex * decisionGapY;
            const y2 = metricStartY + metIndex * metricGapY;

            const color = link.sign === "positive" ? "#16a34a" : "#f97316";
            const marker =
              link.sign === "positive" ? "url(#arrow-pos)" : "url(#arrow-neg)";

            const thickness = 0.6 + 0.5 * Math.min(3, Math.abs(link.value));
            const dimmed =
              (activeDecision && link.from !== activeDecision) ||
              (activeMetric && link.to !== activeMetric);

            return (
              <line
                key={`link-${idx}`}
                x1={decisionX + 80}
                y1={y1}
                x2={metricX - 80}
                y2={y2}
                stroke={color}
                strokeWidth={thickness}
                strokeOpacity={dimmed ? 0.25 : 0.95}
                markerEnd={marker}
              />
            );
          })}

          {/* Function ovals */}
          {decisions.map((dec, i) => {
            const y = decisionStartY + i * decisionGapY;
            const highlight =
              !activeMetric &&
              (activeDecision === null || activeDecision === dec.id);

            return (
              <g
                key={dec.id}
                onMouseEnter={() => setActiveDecision(dec.id)}
                onMouseLeave={() => setActiveDecision(null)}
                style={{
                  opacity: highlight ? 1 : 0.45,
                  cursor: "pointer",
                }}
              >
                <ellipse
                  cx={decisionX}
                  cy={y}
                  rx={130}
                  ry={14}
                  fill="#e5f0ff"
                  stroke="#64748b"
                  strokeWidth={0.9}
                />
                <text
                  x={decisionX}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fill="#0f172a"
                >
                  {dec.label}
                </text>
              </g>
            );
          })}

          {/* Metric boxes */}
          {metrics.map((met, i) => {
            const y = metricStartY + i * metricGapY - 14;
            const highlight =
              !activeDecision &&
              (activeMetric === null || activeMetric === met.id);

            const fill =
              met.theme === "tech"
                ? "#e0edff"
                : met.theme === "econ"
                ? "#ffe4e6"
                : met.theme === "env"
                ? "#dcfce7"
                : "#fef9c3";

            return (
              <g
                key={met.id}
                onMouseEnter={() => setActiveMetric(met.id)}
                onMouseLeave={() => setActiveMetric(null)}
                style={{
                  opacity: highlight ? 1 : 0.5,
                  cursor: "pointer",
                }}
              >
                <rect
                  x={metricX - 90}
                  y={y}
                  width={180}
                  height={26}
                  rx={13}
                  fill={fill}
                  stroke="#cbd5f5"
                  strokeWidth={0.8}
                />
                <text
                  x={metricX}
                  y={y + 17}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#0f172a"
                >
                  {met.label}
                </text>
              </g>
            );
          })}
        </svg>

        {!compact && (
          <div className="dm-legend">
            <span className="dm-legend-title">Legend</span>
            <span className="dm-legend-item">
              <span className="dm-legend-line dm-positive" /> positive impact
            </span>
            <span className="dm-legend-item">
              <span className="dm-legend-line dm-negative" /> negative impact
            </span>
            <span className="dm-legend-item">
              <span className="dm-legend-line dm-requirement" /> requirement
              relation
            </span>
          </div>
        )}
      </div>
    </div>
  );
}


/**
 * Main app
 */

export default function App() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedByStage, setSelectedByStage] = useState({
    ingestion: null,
    validation: null,
    model: null,
    deployment: null,
    monitoring: null,
  });
  const [showSummary, setShowSummary] = useState(false);

  const currentStage = STAGES[currentStageIndex];
  const cardsForStage = CARD_DATA[currentStage.id];
  const currentSelection = selectedByStage[currentStage.id];

  const totals = useMemo(
    () => computeTotals(selectedByStage),
    [selectedByStage]
  );

  function handleSelectCard(card) {
    setSelectedByStage((prev) => ({
      ...prev,
      [currentStage.id]: card,
    }));
  }

  function handleNext() {
    if (!currentSelection) return;
    if (currentStageIndex === STAGES.length - 1) {
      setShowSummary(true);
    } else {
      setCurrentStageIndex((idx) => idx + 1);
    }
  }

  function handleRestart() {
    setSelectedByStage({
      ingestion: null,
      validation: null,
      model: null,
      deployment: null,
      monitoring: null,
    });
    setCurrentStageIndex(0);
    setShowSummary(false);
  }

  if (showSummary) {
    return (
      <div className="app-root">
        <header className="app-header">
          <h1>Pipeline Architects - TrafficFlow</h1>
          <p className="app-subtitle">
            Final sustainability report for your traffic prediction pipeline.
          </p>
        </header>

        <main className="app-main app-main-summary">
          <section className="summary-left">
            <h2 className="summary-heading">Sustainability snapshot</h2>

            <div className="summary-grid">
              <div className="summary-dimension dim-tech">
                <div className="summary-dim-label">Technical</div>
                <div className="summary-dim-score">{totals.tech}</div>
              </div>
              <div className="summary-dimension dim-econ">
                <div className="summary-dim-label">Economic</div>
                <div className="summary-dim-score">{totals.econ}</div>
              </div>
              <div className="summary-dimension dim-env">
                <div className="summary-dim-label">Environmental</div>
                <div className="summary-dim-score">{totals.env}</div>
              </div>
              <div className="summary-dimension dim-social">
                <div className="summary-dim-label">Social</div>
                <div className="summary-dim-score">{totals.social}</div>
              </div>
            </div>

            <div className="verdict-box">
              <h3>Verdict</h3>
              <p>{verdict(totals)}</p>
            </div>

            <button
              className="btn btn-primary restart-btn"
              onClick={handleRestart}
            >
              Build a new pipeline
            </button>
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
        <p className="app-subtitle">
          Build a traffic flow prediction pipeline and explore its
          sustainability trade-offs.
        </p>
      </header>

      <ProgressBar currentStageIndex={currentStageIndex} />

      <main className="app-main">
        <section className="stage-section">
          <h2 className="stage-title">{currentStage.label}</h2>
          <p className="stage-description">
            Choose one option and lock this stage. Once you continue you cannot
            change earlier choices.
          </p>

          <div className="card-grid">
            {cardsForStage.map((card) => (
              <Card
                key={card.id}
                card={card}
                selected={currentSelection && currentSelection.id === card.id}
                onSelect={() => handleSelectCard(card)}
              />
            ))}
          </div>

          <div className="nav-row nav-right">
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!currentSelection}
            >
              {currentStageIndex === STAGES.length - 1
                ? "Finish and see report"
                : "Lock choice and continue"}
            </button>
          </div>

          {/* NEW: live decision map while playing */}
          <div className="stage-decision-map">
            <DecisionMap selectedByStage={selectedByStage}  />
          </div>
        </section>

        <aside className="aside-section">
          <PreviewPanel selectedByStage={selectedByStage} />
        </aside>
      </main>
    </div>
  );
}

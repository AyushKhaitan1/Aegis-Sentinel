// Aegis Sentinel - Compound Risk Engine & Knowledge Base

export interface SensorData {
  ch4: number; // % LEL (Lower Explosive Limit) - threshold 10%
  h2s: number; // ppm - threshold 10 ppm
  co: number;  // ppm - threshold 35 ppm
  temperature: number; // °C
  ventilation: boolean; // active/inactive
  windSpeed: number; // km/h
}

export interface WorkPermit {
  id: string;
  type: 'Hot Work' | 'Confined Space Entry' | 'Height Work' | 'Electrical Isolation';
  status: 'Active' | 'Pending' | 'Expired';
  location: 'Coke Oven Battery' | 'Gas Manifold' | 'Storage Tank B' | 'Compressor Station';
  assignedWorkers: string[];
  issuedAt: string;
  expiresAt: string;
  permitNumber: string;
}

export interface Worker {
  id: string;
  name: string;
  role: 'Technician' | 'Welder' | 'Fitter' | 'Safety Supervisor';
  x: number; // percentage coordinate on map (0-100)
  y: number; // percentage coordinate on map (0-100)
  activeZone: string;
  ppeCompliant: boolean;
  heartRate: number; // bpm
}

export interface RiskAnalysis {
  score: number; // 0-100
  level: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  color: string; // hex code
  primaryThreats: string[];
  recommendations: string[];
  citedClauses: string[];
  activeScenarioId: string | null;
}

export interface AgentMessage {
  id: string;
  timestamp: string;
  agentName: 'Sentinel Core' | 'Telemetry Agent' | 'Permit Coordinator' | 'Compliance Officer' | 'Emergency Director';
  avatarColor: string;
  message: string;
  role: 'system' | 'telemetry' | 'permit' | 'compliance' | 'emergency';
}

// Regulatory Corpus for local RAG Simulation
export interface RagDoc {
  id: string;
  source: string;
  section: string;
  content: string;
  keywords: string[];
}

export const REGULATORY_CORPUS: RagDoc[] = [
  {
    id: "REG-001",
    source: "The Factories Act, 1948",
    section: "Section 36 - Precautions against dangerous fumes, gases, etc.",
    content: "No person shall be required or allowed to enter any chamber, tank, vat, pit, pipe, flue or other confined space in any factory in which any gas, fume, vapour or dust is likely to be present to such an extent as to involve risk to persons being overcome thereby, unless it is provided with a manhole of adequate size or other effective means of egress, and unless a certificate in writing has been given by a competent person based on a test carried out by himself that the space is free from dangerous gas and fit for entry.",
    keywords: ["confined space", "fumes", "gas", "manhole", "factories act", "certificate", "entry"]
  },
  {
    id: "REG-002",
    source: "OISD Standard 105",
    section: "Clause 5.2 - Hot Work Permit System",
    content: "Hot work permit shall be issued only after ensuring that the area is safe for carrying out welding, cutting, grinding or any other spark-producing activity. The area within 15 meters of the hot work location must be free of all combustible materials. Gas tests for flammable gas concentration must be conducted prior to starting hot work and at regular intervals during the work. Flammable gas concentration must be 0% of the Lower Explosive Limit (LEL) before hot work is authorized, and must never exceed 10% LEL at any time during operations.",
    keywords: ["hot work", "welding", "permit", "gas test", "flammable", "lel", "oisd 105", "combustible"]
  },
  {
    id: "REG-003",
    source: "OISD Standard 206",
    section: "Clause 8.4 - Safety Practices in Gas Processing Plants",
    content: "Continuous gas monitoring systems must be deployed in areas handling hydrocarbons, toxic gases like Hydrogen Sulphide (H2S), and Carbon Monoxide (CO). For H2S, the Permissible Exposure Limit (PEL) is 10 ppm for an 8-hour Time Weighted Average (TWA), and the Short Term Exposure Limit (STEL) is 15 ppm. If H2S concentrations exceed 10 ppm, workers must immediately wear positive-pressure breathing apparatus or evacuate the area. Alarms must sound at both local and central control panels.",
    keywords: ["h2s", "toxic gas", "monitoring", "co", "hydrocarbon", "pel", "evacuate", "oisd 206", "alarm"]
  },
  {
    id: "REG-004",
    source: "DGMS (Tech) Circular 12",
    section: "Section 2 - Threshold Limits for Toxic Gases in Heavy Mining and Industrial Settings",
    content: "Carbon Monoxide (CO) concentration shall not exceed 50 ppm in active working environments for short durations, and the 8-hour exposure limit is set at 35 ppm. Areas showing CO levels exceeding 100 ppm must be isolated immediately, ventilation systems switched to high exhaust mode, and all combustion sources shut down to prevent carbon monoxide poisoning and potential explosive mixtures.",
    keywords: ["carbon monoxide", "co", "toxic limit", "ventilation", "exhaust", "dgms", "poisoning"]
  },
  {
    id: "REG-005",
    source: "OISD Standard 105",
    section: "Clause 6.1 - Confined Space Work Permit Requirements",
    content: "Before authorizing entry into a confined space, the isolation of all feed lines (blinding/blanking) must be physically verified. The vessel must be purged with steam, water, or nitrogen, and thoroughly ventilated. Oxygen levels inside the vessel must be between 19.5% and 23.5% by volume. Continuous standby personnel must be positioned outside the manhole with ready retrieval harnesses, communication devices, and resuscitators.",
    keywords: ["confined space", "oxygen", "isolation", "standby", "harness", "purging", "ventilated", "permit"]
  },
  {
    id: "REG-006",
    source: "The Factories Act, 1948",
    section: "Section 36A - Safety at heights and protection against falls",
    content: "In every factory, where work is performed at a height exceeding 2 meters from the ground or floor level, secure scaffolding, working platforms, and safety harnesses must be provided. Harnesses must be anchored to structural members capable of sustaining static loads. Safety nets must be deployed where anchoring is not fully feasible, and PPE compliance must be audited at every shift change.",
    keywords: ["height", "fall protection", "scaffolding", "harness", "ppe", "factories act", "safety net"]
  }
];

// Helper to calculate compound risk score and detail threats
export function analyzeRisk(sensors: SensorData, permits: WorkPermit[], workers: Worker[]): RiskAnalysis {
  let score = 5; // Base normal operating risk
  const threats: string[] = [];
  const recs: string[] = [];
  const clauses: string[] = [];
  let activeScenarioId: string | null = null;

  const hotWorkActive = permits.some(p => p.type === 'Hot Work' && p.status === 'Active');
  const confinedSpaceActive = permits.some(p => p.type === 'Confined Space Entry' && p.status === 'Active');
  const heightWorkActive = permits.some(p => p.type === 'Height Work' && p.status === 'Active');

  const hotWorkLocation = permits.find(p => p.type === 'Hot Work' && p.status === 'Active')?.location || null;

  // 1. Gas Concentration Threats
  if (sensors.ch4 > 0) {
    if (sensors.ch4 >= 10) {
      score += sensors.ch4 * 2.5;
      threats.push(`Flammable Gas (CH4) exceeds safety threshold (Current: ${sensors.ch4}% LEL, Limit: 10% LEL)`);
      recs.push("Immediately suspend all ignition sources and evacuate the gas manifold zone.");
      clauses.push("OISD-105 Clause 5.2");
    } else {
      score += sensors.ch4 * 1.2;
    }
  }

  if (sensors.h2s > 0) {
    if (sensors.h2s >= 10) {
      score += sensors.h2s * 4.0;
      threats.push(`Toxic Gas (H2S) exceeds Permissible Exposure Limit (Current: ${sensors.h2s} ppm, Limit: 10 ppm)`);
      recs.push("Deploy breathing apparatus immediately. Evacuate affected downstream units.");
      clauses.push("OISD-206 Clause 8.4");
    } else if (sensors.h2s >= 5) {
      score += sensors.h2s * 2.0;
      threats.push(`Elevated Toxic Gas (H2S) detected (Current: ${sensors.h2s} ppm)`);
      recs.push("Increase local ventilation and prepare emergency breathing equipment.");
    } else {
      score += sensors.h2s * 1.0;
    }
  }

  if (sensors.co > 0) {
    if (sensors.co >= 35) {
      score += (sensors.co / 35) * 15;
      threats.push(`Carbon Monoxide (CO) exceeds TWA safety limit (Current: ${sensors.co} ppm, Limit: 35 ppm)`);
      recs.push("Inspect combustion systems. Switch exhaust fans to max capacity.");
      clauses.push("DGMS Circular 12 Section 2");
    } else {
      score += (sensors.co / 35) * 5;
    }
  }

  // 2. PPE Compliance Threats
  const nonCompliantWorkers = workers.filter(w => !w.ppeCompliant);
  if (nonCompliantWorkers.length > 0) {
    score += nonCompliantWorkers.length * 8;
    threats.push(`CCTV Analytics: ${nonCompliantWorkers.length} worker(s) flagged for PPE Non-Compliance (No Helmet/Safety Harness)`);
    recs.push("Safety supervisor must immediately intercept non-compliant field technicians.");
    clauses.push("Factories Act Section 36A");
  }

  // 3. Environmental Modifiers
  if (sensors.temperature > 40) {
    score += (sensors.temperature - 40) * 1.5;
    if (sensors.temperature > 42 && heightWorkActive) {
      score += 15;
      threats.push("Extreme Heat + Height Work: High risk of thermal fatigue or heat stroke for elevated workers.");
      recs.push("Mandate 15-minute hydration breaks every hour. Deploy standby supervisor.");
    }
  }

  if (!sensors.ventilation) {
    score += 15;
    if (confinedSpaceActive) {
      score += 25;
      threats.push("Critical Ventilation Failure: Forced ventilation is OFF during an active Confined Space Entry permit.");
      recs.push("ORDER IMMEDIATELY: Revoke Confined Space Entry. Evacuate vessel immediately.");
      clauses.push("Factories Act Section 36, OISD-105 Clause 6.1");
    }
  }

  // 4. Compound Scenario Identification & Scoring Boosts
  
  // Scenario A: Confined Space Gas Trap
  if (confinedSpaceActive && sensors.h2s >= 5 && !sensors.ventilation) {
    activeScenarioId = "SCENARIO_CONFINED_TRAP";
    score = Math.max(score, 95); // Force Critical
    threats.push("COMPOUND THREAT: Confined space entry active under toxic gas accumulation (H2S) with ventilation system deactivated.");
    recs.push("CRITICAL ACTION REQUIRED: Halt all entry. Activate emergency retrieval team. Trigger area evacuation alarm.");
    clauses.push("Factories Act 1948 Sec 36", "OISD-105 Clause 6.1", "OISD-206 Clause 8.4");
  }
  // Scenario B: Hot Work Ignition Threat
  else if (hotWorkActive && sensors.ch4 >= 8 && sensors.windSpeed > 15) {
    activeScenarioId = "SCENARIO_IGNITION_THREAT";
    score = Math.max(score, 90); // Force High/Critical
    threats.push(`COMPOUND THREAT: Active Hot Work permit (#HW-${hotWorkLocation?.replace(' ', '-')}) in proximity to hydrocarbon leak (${sensors.ch4}% LEL CH4) coupled with high wind dispersion.`);
    recs.push("CRITICAL ACTION REQUIRED: Terminate hot work permit immediately. Dampen ignition sources. Flood area with fire retardant foam.");
    clauses.push("OISD-105 Clause 5.2");
  }
  // Scenario C: Unsupervised Shift Handoff
  else if (hotWorkActive && nonCompliantWorkers.length > 0 && sensors.h2s > 3) {
    activeScenarioId = "SCENARIO_UNSUPERVISED_TRANSITION";
    score = Math.max(score, 75); // Force High
    threats.push("COMPOUND THREAT: Active hot work with PPE violations during toxic gas seepage - indicators of poor operational supervision.");
    recs.push("ACTION REQUIRED: Revoke current work permit. Conduct safety briefing. Audit supervisor logs.");
    clauses.push("OISD-105 Clause 5.2", "Factories Act Sec 36A");
  }
  // Scenario D: Extreme Weather / Wind dispersion
  else if (sensors.ch4 > 5 && sensors.windSpeed > 25) {
    activeScenarioId = "SCENARIO_WIND_DISPERSION";
    score = Math.max(score, 65);
    threats.push("COMPOUND THREAT: Hydrocarbon gas drift due to high wind speeds (> 25 km/h) expanding the hazard zone.");
    recs.push("ACTION REQUIRED: Expand the gas monitoring perimeter. Alert adjacent work crews.");
  }

  // Cap score
  score = Math.min(Math.round(score), 100);

  // Determine Level
  let level: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'NORMAL';
  let color = '#10B981'; // Green

  if (score >= 80) {
    level = 'CRITICAL';
    color = '#EF4444'; // Red
  } else if (score >= 55) {
    level = 'HIGH';
    color = '#F59E0B'; // Amber
  } else if (score >= 25) {
    level = 'ELEVATED';
    color = '#3B82F6'; // Blue
  }

  return {
    score,
    level,
    color,
    primaryThreats: threats.length > 0 ? threats : ["All operations within standard safety margins."],
    recommendations: recs.length > 0 ? recs : ["Continue routine continuous telemetry monitoring."],
    citedClauses: clauses,
    activeScenarioId
  };
}

// Generate real-time Agent Dialogues based on current parameters and risk level
export function generateAgentDialogue(analysis: RiskAnalysis, sensors: SensorData, permits: WorkPermit[], _workers: Worker[]): AgentMessage[] {
  const timestamp = new Date().toLocaleTimeString();
  const messages: AgentMessage[] = [];

  const addMsg = (
    agentName: 'Sentinel Core' | 'Telemetry Agent' | 'Permit Coordinator' | 'Compliance Officer' | 'Emergency Director',
    avatarColor: string,
    message: string,
    role: 'system' | 'telemetry' | 'permit' | 'compliance' | 'emergency'
  ) => {
    messages.push({
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      agentName,
      avatarColor,
      message,
      role
    });
  };

  // Base messages that are always generated to start the round
  addMsg('Telemetry Agent', '#3B82F6', `Processing live telemetry from 14 sensor nodes. H2S: ${sensors.h2s} ppm, CH4: ${sensors.ch4}% LEL, CO: ${sensors.co} ppm. Ventilation status: ${sensors.ventilation ? 'ACTIVE' : 'INACTIVE'}. Temp: ${sensors.temperature}°C.`, 'telemetry');
  
  const activeTypes = permits.filter(p => p.status === 'Active').map(p => p.type);
  addMsg('Permit Coordinator', '#8B5CF6', `Checking Permit Registry. Active Permits: ${activeTypes.length > 0 ? activeTypes.join(', ') : 'None'}. Checked location correlations.`, 'permit');

  if (analysis.level === 'NORMAL') {
    addMsg('Compliance Officer', '#10B981', "Cross-referencing telemetry with statutory standards. All parameters compliant with OISD and Factories Act guidelines. Operations certified safe.", 'compliance');
    addMsg('Sentinel Core', '#00E5FF', "Aegis Sentinel core analysis complete. Composite Risk Index at 5%. No anomalies detected. Continuous tracking operational.", 'system');
  } 
  
  else if (analysis.level === 'ELEVATED') {
    addMsg('Compliance Officer', '#3B82F6', `Deviation detected. Minor telemetry fluctuation or minor permit conflict. Parameters remain below STEL/PEL exposure limits. Monitoring closely.`, 'compliance');
    
    if (sensors.ch4 > 0 && sensors.ch4 < 10) {
      addMsg('Telemetry Agent', '#3B82F6', `Alert: Trace levels of methane (${sensors.ch4}% LEL) detected near the gas manifold. Not yet exceeding threshold limit.`, 'telemetry');
    }
    if (sensors.h2s > 0 && sensors.h2s < 10) {
      addMsg('Telemetry Agent', '#3B82F6', `Alert: Hydrogen Sulphide is bubbling at ${sensors.h2s} ppm. Recommended action: verify exhaust flow.`, 'telemetry');
    }
    
    addMsg('Sentinel Core', '#00E5FF', `Composite Risk Index elevated to ${analysis.score}%. Core recommendation: Verify local containment. Safety team alerted.`, 'system');
  } 
  
  else if (analysis.level === 'HIGH') {
    addMsg('Telemetry Agent', '#F59E0B', `WARNING: Critical sensor threshold breached! H2S at ${sensors.h2s} ppm or CH4 at ${sensors.ch4}% LEL. Wind speed: ${sensors.windSpeed} km/h accelerating gas plume.`, 'telemetry');
    
    if (analysis.activeScenarioId === 'SCENARIO_UNSUPERVISED_TRANSITION') {
      addMsg('Permit Coordinator', '#8B5CF6', `PERMIT CONFLICT: Active Hot Work permit being executed while CCTV reports PPE violations. Workers not wearing appropriate helmets/safety harnesses at height.`, 'permit');
      addMsg('Compliance Officer', '#F59E0B', `REGULATORY DEV: Violation of Factories Act Sec 36A (PPE compliance) and OISD 105 Clause 5.2. Immediate inspection advised.`, 'compliance');
      addMsg('Sentinel Core', '#00E5FF', `HIGH RISK ALERT (Index: ${analysis.score}%): Compound risk identified. Methane/H2S presence combined with PPE negligence. Issuing warning to safety superintendent.`, 'system');
    } else if (analysis.activeScenarioId === 'SCENARIO_WIND_DISPERSION') {
      addMsg('Telemetry Agent', '#3B82F6', `Atmospheric dispersion model indicates gas drift direction aligned with prevailing wind. Prevailing wind: ${sensors.windSpeed} km/h.`, 'telemetry');
      addMsg('Compliance Officer', '#F59E0B', `OISD 206 recommendation: Expand the gas monitoring perimeter and suspend spark-producing operations downwind.`, 'compliance');
      addMsg('Sentinel Core', '#00E5FF', `HIGH RISK ALERT (Index: ${analysis.score}%): Wind-blown gas cloud risk. Recommending perimeter boundary extension.`, 'system');
    } else {
      addMsg('Compliance Officer', '#F59E0B', `Statutory warning. Parameters approaching exposure thresholds. Action items issued to shift foreman.`, 'compliance');
      addMsg('Sentinel Core', '#00E5FF', `HIGH RISK ALERT (Index: ${analysis.score}%): Telemetry values require mitigation. Reviewing local isolation valves.`, 'system');
    }
  } 
  
  else if (analysis.level === 'CRITICAL') {
    addMsg('Telemetry Agent', '#EF4444', `DANGER: Telemetry shows toxic concentration or explosive potential! CH4: ${sensors.ch4}% LEL, H2S: ${sensors.h2s} ppm, Ventilation: ${sensors.ventilation ? 'ON' : 'DEACTIVATED'}.`, 'telemetry');

    if (analysis.activeScenarioId === 'SCENARIO_CONFINED_TRAP') {
      addMsg('Permit Coordinator', '#8B5CF6', `ALERT: Confined Space Entry Permit is ACTIVE for Storage Tank B. Workers are currently inside. Forced air ventilation has tripped OFF.`, 'permit');
      addMsg('Compliance Officer', '#EF4444', `SEVERE BREACH: Direct violation of The Factories Act, 1948 Section 36. High hazard of immediate worker asphyxiation or H2S poisoning. Immediate rescue protocol must be deployed.`, 'compliance');
      addMsg('Emergency Director', '#EF4444', `EMERGENCY PROTOCOL ACTIVATED: Triggering evacuation sirens. Deploying retrieval standby team with positive-pressure SCBA. Initiating automatic line isolation.`, 'emergency');
      addMsg('Sentinel Core', '#00E5FF', `CRITICAL SYSTEM RESPONSE: Composite Risk at ${analysis.score}%. Compound Confined Space Trap detected. Activating Emergency Playbook #EP-CONFINED-09.`, 'system');
    } else if (analysis.activeScenarioId === 'SCENARIO_IGNITION_THREAT') {
      addMsg('Permit Coordinator', '#8B5CF6', `ALERT: Hot Work Permit is ACTIVE at Coke Oven Battery, executing welding operations. Telemetry shows Methane gas leak in immediate zone (${sensors.ch4}% LEL).`, 'permit');
      addMsg('Compliance Officer', '#EF4444', `SEVERE BREACH: Direct violation of OISD Standard 105 Clause 5.2. Hot work is forbidden in areas exceeding 10% LEL. Severe flash fire risk.`, 'compliance');
      addMsg('Emergency Director', '#EF4444', `EMERGENCY PROTOCOL ACTIVATED: Revoking permit. Shutting off electrical welding grid power. Dispatching water-fog deluge system and fire marshal team.`, 'emergency');
      addMsg('Sentinel Core', '#00E5FF', `CRITICAL SYSTEM RESPONSE: Composite Risk at ${analysis.score}%. Methane accumulation in active Hot Work zone. Deploying Emergency Playbook #EP-HOTWORK-04.`, 'system');
    } else {
      addMsg('Emergency Director', '#EF4444', `EMERGENCY PROTOCOL ACTIVATED: Risk index exceeds 80%. Sounding general warning. Safety teams deployed.`, 'emergency');
      addMsg('Sentinel Core', '#00E5FF', `CRITICAL ALERT (Index: ${analysis.score}%): Unidentified critical combination. Restricting access to affected zones.`, 'system');
    }
  }

  return messages;
}

// Simple local semantic RAG search implementation
export function searchRAG(query: string): { results: RagDoc[]; scoreMap: { [key: string]: number } } {
  const queryWords = query.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .split(/\s+/);
  
  const scoreMap: { [key: string]: number } = {};
  
  REGULATORY_CORPUS.forEach(doc => {
    let score = 0;
    queryWords.forEach(word => {
      // Direct keyword match gets high weight
      if (doc.keywords.includes(word)) {
        score += 15;
      }
      // Content word match gets lower weight
      const occurrences = (doc.content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      score += occurrences * 3;
      
      // Source match
      if (doc.source.toLowerCase().includes(word) || doc.section.toLowerCase().includes(word)) {
        score += 8;
      }
    });
    
    scoreMap[doc.id] = score;
  });

  const matchedDocs = REGULATORY_CORPUS
    .filter(doc => scoreMap[doc.id] > 0)
    .sort((a, b) => scoreMap[b.id] - scoreMap[a.id]);

  return {
    results: matchedDocs.slice(0, 3), // return top 3
    scoreMap
  };
}

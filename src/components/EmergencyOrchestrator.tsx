import React, { useState, useEffect } from 'react';
import { analyzeRisk } from '../utils/riskEngine';
import type { SensorData, WorkPermit, Worker } from '../utils/riskEngine';
import { AlertOctagon, ShieldAlert, Bell, Wifi, Eye, Shield } from 'lucide-react';

interface EmergencyOrchestratorProps {
  riskLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  sensors: SensorData;
  permits: WorkPermit[];
  workers: Worker[];
  isManualTriggered: boolean;
  onToggleManualTrigger: () => void;
}

export const EmergencyOrchestrator: React.FC<EmergencyOrchestratorProps> = ({
  riskLevel,
  sensors,
  permits,
  workers,
  isManualTriggered,
  onToggleManualTrigger
}) => {
  const [playbookStep, setPlaybookStep] = useState(0);
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  
  const isEmergency = riskLevel === 'CRITICAL' || isManualTriggered;

  // Run playbook step-by-step animation when emergency starts
  useEffect(() => {
    if (isEmergency) {
      setPlaybookStep(0);
      const interval = setInterval(() => {
        setPlaybookStep((prev) => {
          if (prev >= 5) {
            clearInterval(interval);
            return 5;
          }
          return prev + 1;
        });
      }, 700);
      return () => clearInterval(interval);
    } else {
      setPlaybookStep(0);
      setShowIncidentReport(false);
    }
  }, [isEmergency]);

  const generateIncidentReportText = () => {
    const analysis = analyzeRisk(sensors, permits, workers);
    const date = new Date().toLocaleString();
    
    return `======================================================================
OFFICIAL STATUTORY INCIDENT REPORT: FORM XI-A
SUBMITTED TO: PETROLEUM & EXPLOSIVES SAFETY ORGANISATION (PESO) & DGMS
======================================================================
Report Reference : AEGIS-INC-REP-${Date.now().toString().slice(-6)}
Timestamp of Incident : ${date}
Location Coordinate  : Coke Oven Battery-5, Visakhapatnam Plant (Zone CO-05)
Security Level       : Level 4 Critical Emergency

1. PRIMARY INCIDENT SYNOPSIS
----------------------------------------------------------------------
A compound risk event was detected by the Aegis Sentinel intelligence
monitoring system. The event triggered automated safety protocols
due to breaching the statutory safety thresholds under OISD Standard 105
and Section 36 of The Factories Act, 1948.

Compound triggers identified:
${analysis.primaryThreats.map((threat, i) => `  (${i + 1}) ${threat}`).join('\n')}

Composite Risk Index at Trigger: ${analysis.score}/100 [CRITICAL]

2. DETAILED CHRONOLOGY OF AUTONOMOUS ACTIONS
----------------------------------------------------------------------
[T-00:00] Detection of compound threshold breach. Index = ${analysis.score}%.
[T-00:02] AUTOMATED INTRUSION: Evacuation sirens activated on site.
[T-00:04] ALERT ROUTER: Dispatched emergency SMS warnings to response crew.
[T-00:06] VALVE SHUTOFF: Triggered SCADA valve blinders to isolate gas feeds.
[T-00:08] POWER DISCONNECT: Interrupted welding and electrical sparks at CO-05.
[T-00:10] DYNAMIC PATHFINDING: Calculated safest evacuation coordinates.
[T-00:12] INCIDENT DRAFT: Pre-filled PESO Form XI-A incident file.

3. WORKFORCE AFFECTED & TELEMETRY AT TIMELINE
----------------------------------------------------------------------
Technicians in immediate vicinity coordinates:
${workers.map(w => `  * ${w.name} (${w.role}) | Heart Rate: ${w.heartRate} bpm | PPE: ${w.ppeCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`).join('\n')}

4. REGULATORY ACTION COMPLIANCE
----------------------------------------------------------------------
Playbook Compliance: OISD-105 Clause 5.2 & Factories Act Sec 36 verified.
Statutory Code Violations cataloged:
${analysis.citedClauses.map(c => `  - CITED: ${c}`).join('\n')}

Report filed autonomously by Sentinel Core Agent v2.1.
End of report.
======================================================================`;
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-full bg-[#0d0912] position-relative">
      
      {/* HUD Scanner Overlay for emergency */}
      {isEmergency && (
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#ff1744] pointer-events-none z-10"
             style={{ animation: 'scanning-line 2.5s linear infinite' }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center border-b border-white-05 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className={isEmergency ? "text-[#ff1744] animate-pulse" : "text-[#10B981]"} size={18} />
          <h2 className="text-lg font-bold tracking-wide">Emergency Response Orchestrator</h2>
        </div>
        <button 
          onClick={onToggleManualTrigger}
          className={`text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer ${
            isEmergency 
              ? 'bg-[#10B981] text-black hover:bg-[#10B981]/80 font-bold' 
              : 'bg-[#ff1744]/20 text-[#ff1744] hover:bg-[#ff1744]/35 border border-[#ff1744]/40 font-bold animate-pulse'
          }`}
        >
          {isEmergency ? 'Reset Protocol' : '⚠️ Trigger Alarm'}
        </button>
      </div>

      {!isEmergency ? (
        /* Normal State */
        <div className="flex-grow flex flex-col justify-center items-center text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mb-3">
            <Shield className="text-[#10B981]" size={32} />
          </div>
          <h3 className="text-base font-bold text-[#10B981] mb-1">AEGIS RESPONSE STANDARD: NOMINAL</h3>
          <p className="text-xs text-gray-400 max-w-[80%] leading-relaxed">
            All telemetry channels comply with OISD/Factories Act standards. Emergency playbooks are on standby. Safety perimeter secure.
          </p>
          <div className="mt-4 flex gap-4 text-[10px] text-gray-500 font-mono">
            <span className="flex items-center gap-1"><Wifi size={10} /> SCADA valves OPEN</span>
            <span className="flex items-center gap-1"><Bell size={10} /> Sirens OFF</span>
          </div>
        </div>
      ) : (
        /* Emergency Active State */
        <div className="flex-grow flex flex-col justify-between">
          <div className="bg-[#ff1744]/10 border border-[#ff1744]/30 rounded-lg p-3 mb-4 flex gap-3 items-center">
            <ShieldAlert className="text-[#ff1744] animate-bounce shrink-0" size={24} />
            <div>
              <h3 className="text-xs font-bold text-[#ff1744] uppercase tracking-wider">Playbook #EP-INDUSTRIAL-09 Active</h3>
              <p className="text-[10px] text-gray-300">Composite Risk breached critical limits. Running automated containment and evacuation.</p>
            </div>
          </div>

          {!showIncidentReport ? (
            /* Playbook Checklist Steps */
            <div className="flex-grow flex flex-col gap-2 mb-4 justify-center">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Execution Checklist Sequence:</h4>
              
              <div className="flex flex-col gap-2 font-mono text-xs">
                
                {/* Step 1 */}
                <div className={`flex items-center justify-between p-2 rounded ${playbookStep >= 1 ? 'bg-white-02' : 'opacity-40'}`}>
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500">01.</span>
                    <span>Sound Audible Evac Sirens</span>
                  </span>
                  <span className={playbookStep >= 1 ? "text-[#10B981] font-bold" : "text-gray-500"}>
                    {playbookStep >= 1 ? '✓ DONE' : 'WAITING'}
                  </span>
                </div>

                {/* Step 2 */}
                <div className={`flex items-center justify-between p-2 rounded ${playbookStep >= 2 ? 'bg-white-02' : 'opacity-40'}`}>
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500">02.</span>
                    <span>Dispatch Emergency SMS Logs</span>
                  </span>
                  <span className={playbookStep >= 2 ? "text-[#10B981] font-bold" : "text-gray-500"}>
                    {playbookStep >= 2 ? '✓ SENT' : 'WAITING'}
                  </span>
                </div>

                {/* Step 3 */}
                <div className={`flex items-center justify-between p-2 rounded ${playbookStep >= 3 ? 'bg-white-02' : 'opacity-40'}`}>
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500">03.</span>
                    <span>Isolate SCADA Feed Valves</span>
                  </span>
                  <span className={playbookStep >= 3 ? "text-[#10B981] font-bold" : "text-gray-500"}>
                    {playbookStep >= 3 ? '✓ ISOLATED' : 'WAITING'}
                  </span>
                </div>

                {/* Step 4 */}
                <div className={`flex items-center justify-between p-2 rounded ${playbookStep >= 4 ? 'bg-white-02' : 'opacity-40'}`}>
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500">04.</span>
                    <span>Map Evacuation Pathways</span>
                  </span>
                  <span className={playbookStep >= 4 ? "text-[#00e5ff] font-bold animate-pulse" : "text-gray-500"}>
                    {playbookStep >= 4 ? '✓ DRAWN' : 'WAITING'}
                  </span>
                </div>

                {/* Step 5 */}
                <div className={`flex items-center justify-between p-2 rounded ${playbookStep >= 5 ? 'bg-white-02' : 'opacity-40'}`}>
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500">05.</span>
                    <span>Compile Form XI-A Report</span>
                  </span>
                  <span className={playbookStep >= 5 ? "text-[#10B981] font-bold" : "text-gray-500"}>
                    {playbookStep >= 5 ? '✓ READY' : 'WAITING'}
                  </span>
                </div>

              </div>
            </div>
          ) : (
            /* Incident Report Viewer */
            <div className="flex-grow flex flex-col overflow-hidden">
              <div className="flex-grow bg-black rounded border border-white-05 p-3 font-mono text-[9px] overflow-y-auto whitespace-pre leading-normal mb-3" style={{ maxHeight: '210px' }}>
                {generateIncidentReportText()}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {playbookStep >= 5 && (
              <button 
                onClick={() => setShowIncidentReport(!showIncidentReport)}
                className="flex-grow flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded bg-white-05 border border-white-10 hover:bg-white-10 text-white transition-all cursor-pointer"
              >
                {showIncidentReport ? 'View Live Playbook' : 'Inspect Form XI-A Draft'}
                <Eye size={12} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

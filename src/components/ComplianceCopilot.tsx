import React, { useState } from 'react';
import { searchRAG, analyzeRisk } from '../utils/riskEngine';
import type { RagDoc, SensorData, WorkPermit, Worker } from '../utils/riskEngine';
import { BookOpen, Send, FileText } from 'lucide-react';

interface ComplianceCopilotProps {
  sensors: SensorData;
  permits: WorkPermit[];
  workers: Worker[];
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  citations?: RagDoc[];
  confidence?: number;
}

export const ComplianceCopilot: React.FC<ComplianceCopilotProps> = ({
  sensors,
  permits,
  workers
}) => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Aegis Compliance Auditor initialized. Search the integrated OISD, DGMS, and Factories Act databases, or request a Live Safety Audit Report of the facility.',
    }
  ]);
  const [showReport, setShowReport] = useState(false);
  const [auditReport, setAuditReport] = useState<string>('');

  const quickQuestions = [
    { label: 'Confined Space Section 36', query: 'What are the Factories Act requirements for confined space entry?' },
    { label: 'OISD Hot Work LEL', query: 'What is the maximum allowable LEL for hot work under OISD 105?' },
    { label: 'H2S Toxic Limits', query: 'What are the exposure threshold limits for Hydrogen Sulphide?' },
    { label: 'Height Work Fall Safety', query: 'What does the Factories Act say about height safety and safety harnesses?' }
  ];

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add user message
    const updatedHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: searchQuery }];
    setChatHistory(updatedHistory);
    setQuery('');

    // Perform RAG search
    setTimeout(() => {
      const { results, scoreMap } = searchRAG(searchQuery);

      let responseText = '';
      let confidence = 0;

      if (results.length > 0) {
        const topDoc = results[0];
        confidence = Math.min(Math.round(scoreMap[topDoc.id] * 2.5 + 45), 98);

        if (topDoc.id === 'REG-001' || topDoc.id === 'REG-005') {
          responseText = `According to ${topDoc.source} (${topDoc.section}), confined space entry is strictly regulated. You must ensure: \n1. Positive line isolation (blinding/blanking) is verified.\n2. Purging has occurred and oxygen level is verified between 19.5% and 23.5%.\n3. Continuous forced ventilation is running.\n4. Standby rescue personnel are stationed outside the manhole.`;
        } else if (topDoc.id === 'REG-002') {
          responseText = `Under ${topDoc.source} (${topDoc.section}), hot work permits require gas tests prior to starting welding, cutting, or spark activities. Combustibles must be cleared within 15 meters. The gas level must be 0% LEL to authorize work, and must never exceed 10% LEL at any time during operations.`;
        } else if (topDoc.id === 'REG-003') {
          responseText = `${topDoc.source} (${topDoc.section}) states that for toxic gas exposure, Hydrogen Sulphide (H2S) must be continuously monitored. The Permissible Exposure Limit (PEL) is 10 ppm (8-hour TWA) and Short Term Exposure Limit (STEL) is 15 ppm. If H2S exceeds 10 ppm, workers must evacuate or wear positive-pressure SCBA equipment.`;
        } else if (topDoc.id === 'REG-004') {
          responseText = `According to ${topDoc.source} (${topDoc.section}), Carbon Monoxide (CO) concentration must not exceed 35 ppm for standard TWA, and must not exceed 50 ppm for short durations. Any area exceeding 100 ppm requires immediate isolation and high exhaust ventilation.`;
        } else if (topDoc.id === 'REG-006') {
          responseText = `Under ${topDoc.source} (${topDoc.section}), work performed at heights exceeding 2 meters requires secure scaffolding, fall protection platforms, and anchored safety harnesses. Harness compliance must be audited at every shift change.`;
        } else {
          responseText = `I found safety references regarding your query in the safety database. Let's look at the primary clauses cited below.`;
        }
      } else {
        responseText = "I couldn't find any direct regulatory clauses matching your query in the preloaded safety database. Please search using keywords like 'confined space', 'hot work', 'h2s', or 'safety harness'.";
        confidence = 0;
      }

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: responseText,
          citations: results,
          confidence: confidence > 0 ? confidence : undefined
        }
      ]);
    }, 400);
  };

  const generateLiveAuditReport = () => {
    const analysis = analyzeRisk(sensors, permits, workers);
    const date = new Date().toLocaleString();
    const activePermits = permits.filter(p => p.status === 'Active');
    const ppeViolations = workers.filter(w => !w.ppeCompliant);

    let report = `===========================================================
AEGIS SENTINEL - STATUTORY SAFETY COMPLIANCE REPORT
Generated on: ${date}
Facility: Visakhapatnam Steel Coke Oven Battery #5
Audit Status: ${analysis.level === 'CRITICAL' || analysis.level === 'HIGH' ? '🔴 NON-COMPLIANT' : '🟢 COMPLIANT'}
===========================================================

1. CURRENT TELEMETRY READINGS
-----------------------------------------------------------
- Methane (CH4) Level        : ${sensors.ch4}% LEL (Explosive Limit Threshold: 10%)
- Hydrogen Sulphide (H2S)    : ${sensors.h2s} ppm (Permissible Exposure Limit: 10 ppm)
- Carbon Monoxide (CO)       : ${sensors.co} ppm (8-hr Exposure Limit: 35 ppm)
- Ambient Temperature        : ${sensors.temperature}°C
- Ventilation Fan Status     : ${sensors.ventilation ? 'ONLINE (ACTIVE)' : 'OFFLINE (FAILED)'}
- Dispersion Wind Speed      : ${sensors.windSpeed} km/h

2. WORK PERMIT STATUS
-----------------------------------------------------------
Active Permits Registered: ${activePermits.length}
${activePermits.length > 0 
  ? activePermits.map(p => `  * Permit Number: ${p.permitNumber}
    Type: ${p.type} | Location: ${p.location}
    Issued to: ${p.assignedWorkers.join(', ')}`).join('\n')
  : '  * No active work permits registered.'}

3. FIELD PPE AUDITING
-----------------------------------------------------------
CCTV Computer Vision Alert Flags:
${ppeViolations.length > 0
  ? `⚠️ PPE VIOLATION WARNING: ${ppeViolations.length} Worker(s) out of safety harness/helmet compliance.
  Violators: ${ppeViolations.map(w => `${w.name} (${w.role}) at ${w.activeZone}`).join(', ')}`
  : '🟢 All field technicians verified PPE compliant via CCTV visual feeds.'}

4. STATUTORY EVALUATION & THREAT LOG
-----------------------------------------------------------
Composite Risk Index Score: ${analysis.score}/100 [Level: ${analysis.level}]

Identified Violations:
${analysis.primaryThreats.map((threat, idx) => `  [Violation ${idx + 1}] ${threat}`).join('\n')}

Cited Regulatory Violations:
${analysis.citedClauses.length > 0
  ? analysis.citedClauses.map(clause => `  - ${clause}`).join('\n')
  : '  - No active statutory violations detected. Operating within safe guidelines.'}

5. MANDATORY CORRECTIVE INTERVENTIONS
-----------------------------------------------------------
${analysis.recommendations.map((rec, idx) => `  [Action ${idx + 1}] ${rec}`).join('\n')}

-----------------------------------------------------------
Report generated by Aegis Sentinel Compliance Agent (v2.1)
Authorized for submittal to MHA and Petroleum & Explosives Safety Organisation (PESO).
===========================================================`;

    setAuditReport(report);
    setShowReport(true);
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-full bg-[#080d1a]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white-05 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-[#00e5ff]" size={18} />
          <h2 className="text-lg font-bold tracking-wide">Regulatory RAG Auditor</h2>
        </div>
        <button 
          onClick={generateLiveAuditReport}
          className="flex items-center gap-1.5 text-xs font-bold bg-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff]/35 border border-[#00e5ff]/40 px-3 py-1.5 rounded transition-all cursor-pointer"
        >
          <FileText size={14} />
          Run Live Safety Audit
        </button>
      </div>

      {!showReport ? (
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Chat Logs */}
          <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-3 mb-4" style={{ maxHeight: '240px', minHeight: '180px' }}>
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg text-xs leading-relaxed max-w-[90%] ${
                  msg.sender === 'user' 
                    ? 'bg-[#00e5ff]/10 text-white border border-[#00e5ff]/25 self-end' 
                    : 'bg-white-02 text-gray-300 border border-white-05 self-start'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {msg.sender === 'user' ? 'Operator' : 'Aegis Compliance Officer'}
                  {msg.sender === 'assistant' && msg.confidence && (
                    <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20 font-mono">
                      RAG confidence: {msg.confidence}%
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Citations Box */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 border-t border-white-05 pt-2 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 block">Cited Safety Standards:</span>
                    {msg.citations.map((cit) => (
                      <div key={cit.id} className="bg-black/30 p-2 rounded border border-white-05 text-[10px]">
                        <span className="text-[#00e5ff] font-bold">{cit.source}</span> — <span className="text-gray-400">{cit.section}</span>
                        <p className="mt-1 text-gray-400 italic font-sans">"{cit.content}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Questions Grid */}
          <div className="mb-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Quick Search Topics:</span>
            <div className="flex flex-wrap gap-1">
              {quickQuestions.map((q, qIdx) => (
                <button 
                  key={qIdx}
                  onClick={() => handleSearch(q.query)}
                  className="text-[10px] py-1 px-2 rounded bg-white-02 border border-white-05 hover:bg-white-05 text-gray-300 transition-colors text-left"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask regulatory compliance question..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              className="flex-grow bg-[#04060c] border border-white-10 rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff] transition-colors"
            />
            <button 
              onClick={() => handleSearch(query)}
              className="bg-[#00e5ff] hover:bg-[#00c5db] text-black font-bold p-2 rounded transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Report View Mode */
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow bg-black rounded border border-white-05 p-3 font-mono text-[10px] overflow-y-auto whitespace-pre leading-normal mb-3" style={{ maxHeight: '310px' }}>
            {auditReport}
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([auditReport], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = "aegis_safety_audit_report.txt";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="text-xs font-semibold py-1.5 px-3 rounded bg-white-05 border border-white-10 hover:border-white-20 transition-all text-white"
            >
              Download Text Report
            </button>
            <button 
              onClick={() => setShowReport(false)}
              className="text-xs font-semibold py-1.5 px-3 rounded bg-[#ff1744] hover:bg-[#d5002b] text-white transition-all"
            >
              Return to Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

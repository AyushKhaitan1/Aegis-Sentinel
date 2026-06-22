import { useState, useEffect } from 'react';
import { analyzeRisk, generateAgentDialogue } from './utils/riskEngine';
import type { SensorData, WorkPermit, Worker, AgentMessage } from './utils/riskEngine';
import { PlantLayout } from './components/PlantLayout';
import { SimulatorControls } from './components/SimulatorControls';
import { AgentConsole } from './components/AgentConsole';
import { ComplianceCopilot } from './components/ComplianceCopilot';
import { EmergencyOrchestrator } from './components/EmergencyOrchestrator';
import { Shield, Clock, AlertTriangle, Video, Activity, Users, BookOpen, Terminal, ShieldAlert } from 'lucide-react';

type TabType = 'twin' | 'cctv' | 'iot' | 'agents' | 'compliance' | 'emergency';

function App() {
  // 1. Core States
  const [activeTab, setActiveTab] = useState<TabType>('twin');
  const [sensors, setSensors] = useState<SensorData>({
    ch4: 0,
    h2s: 0,
    co: 12,
    temperature: 28,
    ventilation: true,
    windSpeed: 10
  });

  const [permits, setPermits] = useState<WorkPermit[]>([
    {
      id: 'p-1',
      type: 'Hot Work',
      status: 'Active',
      location: 'Coke Oven Battery',
      assignedWorkers: ['Rajesh Kumar', 'Sunil Dutt'],
      issuedAt: '08:00 AM',
      expiresAt: '04:00 PM',
      permitNumber: 'PTW-HW-8820'
    },
    {
      id: 'p-2',
      type: 'Confined Space Entry',
      status: 'Pending',
      location: 'Storage Tank B',
      assignedWorkers: ['Amit Singh'],
      issuedAt: '02:00 PM',
      expiresAt: '06:00 PM',
      permitNumber: 'PTW-CS-4019'
    },
    {
      id: 'p-3',
      type: 'Height Work',
      status: 'Pending',
      location: 'Coke Oven Battery',
      assignedWorkers: ['Sunil Dutt'],
      issuedAt: '09:00 AM',
      expiresAt: '05:00 PM',
      permitNumber: 'PTW-HT-2291'
    }
  ]);

  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: 'w-1',
      name: 'Ayush Khaitan',
      role: 'Safety Supervisor',
      x: 18,
      y: 35,
      activeZone: 'Control Room',
      ppeCompliant: true,
      heartRate: 72
    },
    {
      id: 'w-2',
      name: 'Rajesh Kumar',
      role: 'Welder',
      x: 24,
      y: 15,
      activeZone: 'Coke Oven Battery #5',
      ppeCompliant: true,
      heartRate: 85
    },
    {
      id: 'w-3',
      name: 'Amit Singh',
      role: 'Technician',
      x: 63,
      y: 13,
      activeZone: 'Storage Tank B',
      ppeCompliant: true,
      heartRate: 78
    },
    {
      id: 'w-4',
      name: 'Sunil Dutt',
      role: 'Fitter',
      x: 48,
      y: 22,
      activeZone: 'Gas Manifold',
      ppeCompliant: true,
      heartRate: 90
    }
  ]);

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [ppeViolationActive, setPpeViolationActive] = useState(false);
  const [isManualTriggered, setIsManualTriggered] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [time, setTime] = useState<string>('');

  // 2. Real-time Clock
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTime(date.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Trigger PPE violation effect on workers state
  useEffect(() => {
    setWorkers(prev => 
      prev.map(w => {
        if (w.id === 'w-4') {
          return { ...w, ppeCompliant: !ppeViolationActive };
        }
        return w;
      })
    );
  }, [ppeViolationActive]);

  // 4. Calculate Risk Levels and Dialogues
  const riskAnalysis = analyzeRisk(sensors, permits, workers);
  
  useEffect(() => {
    const dialogs = generateAgentDialogue(riskAnalysis, sensors, permits, workers);
    setAgentMessages(prev => {
      const combined = [...prev, ...dialogs];
      if (combined.length > 35) {
        return combined.slice(combined.length - 35);
      }
      return combined;
    });

    // Auto-swap tab to Emergency when index goes Critical!
    if (riskAnalysis.level === 'CRITICAL' || isManualTriggered) {
      setActiveTab('emergency');
    }
  }, [
    sensors.ch4, sensors.h2s, sensors.co, sensors.temperature, sensors.ventilation, sensors.windSpeed,
    ppeViolationActive,
    isManualTriggered
  ]);

  // 5. Apply Presets
  const applyPreset = (preset: 'normal' | 'confined' | 'hotwork' | 'heat') => {
    setIsManualTriggered(false);
    
    if (preset === 'normal') {
      setSensors({
        ch4: 0,
        h2s: 0,
        co: 12,
        temperature: 28,
        ventilation: true,
        windSpeed: 10
      });
      setPermits(prev => 
        prev.map(p => 
          p.id === 'p-1' ? { ...p, status: 'Active' } : { ...p, status: 'Pending' }
        )
      );
      setPpeViolationActive(false);
      setWorkers(prev => prev.map(w => ({ ...w, heartRate: 75 + Math.floor(Math.random() * 10) })));
      setActiveTab('twin');
    } 
    
    else if (preset === 'confined') {
      setSensors({
        ch4: 1,
        h2s: 14,
        co: 15,
        temperature: 30,
        ventilation: false,
        windSpeed: 6
      });
      setPermits(prev => 
        prev.map(p => 
          p.id === 'p-2' ? { ...p, status: 'Active' } : { ...p, status: 'Pending' }
        )
      );
      setPpeViolationActive(false);
      setWorkers(prev => 
        prev.map(w => 
          w.id === 'w-3' ? { ...w, heartRate: 115 } : w
        )
      );
    } 
    
    else if (preset === 'hotwork') {
      setSensors({
        ch4: 12,
        h2s: 0,
        co: 10,
        temperature: 34,
        ventilation: true,
        windSpeed: 18
      });
      setPermits(prev => 
        prev.map(p => 
          p.id === 'p-1' ? { ...p, status: 'Active' } : { ...p, status: 'Pending' }
        )
      );
      setPpeViolationActive(false);
      setWorkers(prev => prev.map(w => ({ ...w, heartRate: 80 + Math.floor(Math.random() * 10) })));
    } 
    
    else if (preset === 'heat') {
      setSensors({
        ch4: 0,
        h2s: 0,
        co: 5,
        temperature: 44,
        windSpeed: 12,
        ventilation: true
      });
      setPermits(prev => 
        prev.map(p => 
          p.id === 'p-3' ? { ...p, status: 'Active' } : { ...p, status: 'Pending' }
        )
      );
      setPpeViolationActive(true);
      setWorkers(prev => 
        prev.map(w => 
          w.id === 'w-4' ? { ...w, heartRate: 102 } : w
        )
      );
      setActiveTab('cctv'); // Focus on CCTV feed to show YOLO bounding boxes!
    }
  };

  const handleTogglePermit = (id: string) => {
    setPermits(prev => 
      prev.map(p => 
        p.id === id 
          ? { ...p, status: p.status === 'Active' ? 'Pending' : 'Active' } 
          : p
      )
    );
  };

  const handleToggleManualTrigger = () => {
    setIsManualTriggered(!isManualTriggered);
  };

  const activeSelectedWorker = selectedWorker 
    ? workers.find(w => w.id === selectedWorker.id) || selectedWorker
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header HUD */}
      <header className="glass-panel mx-5 mt-5 mb-4 p-4 flex justify-between items-center bg-[#090e1c] border-white-05">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center border border-[#00e5ff]/30">
            <Shield className="text-[#00e5ff]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider uppercase header-title-neon">Aegis Sentinel</h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-0.5">Unified Fused Intelligence Layer</p>
          </div>
        </div>

        {/* Global Safety Index Bar */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-gray-500 font-mono uppercase">Composite Risk Index</span>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-48 h-3 bg-white-05 rounded-full overflow-hidden border border-white-10 relative">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${riskAnalysis.score}%`,
                    backgroundColor: riskAnalysis.color,
                    boxShadow: `0 0 10px ${riskAnalysis.color}`
                  }}
                />
              </div>
              <span className="text-sm font-black font-mono" style={{ color: riskAnalysis.color }}>
                {riskAnalysis.score}%
              </span>
            </div>
          </div>

          <div className="border-l border-white-10 h-8"></div>

          {/* Time & Node Status */}
          <div className="flex flex-col font-mono text-xs text-right">
            <span className="text-gray-400 flex items-center gap-1.5 justify-end">
              <Clock size={12} className="text-[#00e5ff]" />
              {time}
            </span>
            <span className="text-[9px] text-gray-500 uppercase mt-0.5">SCADA Registry linked: 14 Nodes</span>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Layout */}
      <main className="dashboard-grid flex-grow">
        
        {/* Left Side: Dynamic Tabbed Panels */}
        <div className="flex flex-col gap-4">
          
          {/* Tab Navigation Menu */}
          <nav className="tab-nav">
            <button 
              className={`tab-btn ${activeTab === 'twin' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('twin')}
            >
              <Users size={14} />
              Digital Twin Map
            </button>
            <button 
              className={`tab-btn ${activeTab === 'cctv' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('cctv')}
            >
              <Video size={14} />
              CCTV CV Feeds
            </button>
            <button 
              className={`tab-btn ${activeTab === 'iot' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('iot')}
            >
              <Activity size={14} />
              IoT Registry
            </button>
            <button 
              className={`tab-btn ${activeTab === 'agents' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('agents')}
            >
              <Terminal size={14} />
              War Room
            </button>
            <button 
              className={`tab-btn ${activeTab === 'compliance' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('compliance')}
            >
              <BookOpen size={14} />
              RAG Copilot
            </button>
            <button 
              className={`tab-btn ${activeTab === 'emergency' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('emergency')}
            >
              <ShieldAlert size={14} />
              Emergency Playbooks
            </button>
          </nav>

          {/* Active Risk Level HUD Banner */}
          <div className="glass-panel p-3.5 flex justify-between items-center relative" 
               style={{ 
                 borderLeft: `5px solid ${riskAnalysis.color}`,
                 backgroundColor: riskAnalysis.level === 'CRITICAL' ? 'rgba(255, 23, 68, 0.04)' : 'var(--bg-surface)'
               }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Aegis Threat Assessor</span>
                <span className="badge" style={{ 
                  backgroundColor: `${riskAnalysis.color}20`, 
                  color: riskAnalysis.color,
                  borderColor: `${riskAnalysis.color}35`
                }}>
                  {riskAnalysis.level}
                </span>
              </div>
              
              <div className="mt-2 flex flex-col gap-1">
                {riskAnalysis.primaryThreats.map((threat, idx) => (
                  <div key={idx} className="flex gap-2 text-xs items-center leading-none text-gray-300">
                    <AlertTriangle size={12} className="shrink-0" style={{ color: riskAnalysis.color }} />
                    <span>{threat}</span>
                  </div>
                ))}
              </div>
            </div>

            {riskAnalysis.citedClauses.length > 0 && (
              <div className="text-right shrink-0">
                <span className="text-[8px] font-bold text-gray-500 uppercase font-mono block mb-1">CITED STATUTES</span>
                <div className="flex gap-1.5 justify-end">
                  {riskAnalysis.citedClauses.map((c, idx) => (
                    <span key={idx} className="text-[9px] font-bold font-mono bg-white-05 border border-white-10 px-2 py-0.5 rounded text-gray-300">
                      {c.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab Workspace Contents */}
          <div className="flex-grow">
            
            {/* Tab 1: Plant Layout SVG Map */}
            {activeTab === 'twin' && (
              <PlantLayout 
                sensors={sensors}
                permits={permits}
                workers={workers}
                selectedWorker={activeSelectedWorker}
                onSelectWorker={setSelectedWorker}
                isEvacuating={riskAnalysis.level === 'CRITICAL' || isManualTriggered}
              />
            )}

            {/* Tab 2: Simulated CCTV feeds with YOLO CV overlay */}
            {activeTab === 'cctv' && (
              <div className="glass-panel p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white-05 pb-3">
                  <div className="flex items-center gap-2">
                    <Video className="text-[#00e5ff]" size={18} />
                    <h2 className="text-lg font-bold tracking-wide">Live CCTV Computer Vision Feeds</h2>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-[#10b981] font-bold">
                    <span className="w-2 h-2 bg-[#ff1744] rounded-full animate-blink-rec"></span>
                    REC LIVE (2 FEEDS)
                  </span>
                </div>

                <div className="cctv-grid">
                  
                  {/* Camera 1: Coke Oven Battery */}
                  <div className="cctv-viewport">
                    <div className="cctv-scanline"></div>
                    <div className="cctv-scanline-sweep"></div>
                    
                    {/* Simulated visual layout */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" stroke="rgba(255,255,255,0.1)">
                        <rect x="20" y="40" width="80" height="60" rx="3" strokeWidth="1" />
                        <line x1="120" y1="20" x2="160" y2="100" strokeWidth="1.5" />
                        <text x="60" y="70" fill="gray" fontSize="8" textAnchor="middle">CO BATTERY #5</text>
                      </svg>
                    </div>

                    {/* CV Bounding Boxes overlay */}
                    {/* Worker 1: Welder Compliant */}
                    <div className="cctv-bounding-box" style={{ top: '35%', left: '15%', width: '22%', height: '50%' }}>
                      <span className="cctv-bounding-label">Welder: Rajesh K (PPE Compliant 98%)</span>
                    </div>

                    {/* Worker 2: Fitter (Sunil Dutt) PPE Violation or Compliant */}
                    <div className={`cctv-bounding-box ${ppeViolationActive ? 'violation' : ''}`} style={{ top: '30%', left: '55%', width: '24%', height: '55%' }}>
                      <span className="cctv-bounding-label">
                        {ppeViolationActive ? '⚠️ VIOLATION: Harness Missing (94%)' : 'Fitter: Sunil Dutt (PPE Compliant 96%)'}
                      </span>
                    </div>

                    {/* HUD Overlay text */}
                    <div className="cctv-overlay-hud">
                      <div className="flex justify-between">
                        <span>CAM-01: CO5_HEADER</span>
                        <span>FPS: 29.97</span>
                      </div>
                      <div className="mt-auto flex justify-between">
                        <span>YOLOv8x_PPE_AUDIT</span>
                        <span>ISO: 800</span>
                      </div>
                    </div>
                  </div>

                  {/* Camera 2: Storage Tank B (Gas dispersion / thermal view) */}
                  <div className="cctv-viewport">
                    <div className="cctv-scanline"></div>
                    <div className="cctv-scanline-sweep"></div>

                    {/* Simulated visual layout */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-45">
                      <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" stroke="rgba(255,255,255,0.1)">
                        <circle cx="100" cy="60" r="30" strokeWidth="1.5" />
                        <text x="100" y="64" fill="gray" fontSize="8" textAnchor="middle">STORAGE TANK B</text>
                      </svg>
                    </div>

                    {/* Simulated thermal gas cloud overlay */}
                    {sensors.h2s > 0 && (
                      <div 
                        className="absolute bg-red-600/35 rounded-full filter blur-xl pointer-events-none" 
                        style={{ 
                          top: '30%', 
                          left: '35%', 
                          width: `${30 + sensors.h2s * 2}%`, 
                          height: `${30 + sensors.h2s * 2}%`,
                          animation: 'pulse-red-border 1s infinite'
                        }}
                      />
                    )}

                    {/* CV Bounding Label */}
                    <div className={`cctv-bounding-box ${sensors.h2s >= 10 ? 'violation' : ''}`} style={{ top: '22%', left: '30%', width: '40%', height: '55%' }}>
                      <span className="cctv-bounding-label">
                        {sensors.h2s > 0 ? `⚠️ Gas dispersion detected (H2S: ${sensors.h2s} ppm)` : 'Zone thermal profile stable'}
                      </span>
                    </div>

                    {/* HUD Overlay text */}
                    <div className="cctv-overlay-hud">
                      <div className="flex justify-between">
                        <span>CAM-02: STORAGE_TANK_B_THERM</span>
                        <span>INFRARED_ACTIVE</span>
                      </div>
                      <div className="mt-auto flex justify-between">
                        <span>YOLOv8x_GAS_THERM_PLUME</span>
                        <span>ALARM: {sensors.h2s >= 10 ? 'TRIGGERED' : 'OFF'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Tab 3: IoT Registry list with active sparklines */}
            {activeTab === 'iot' && (
              <div className="glass-panel p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white-05 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="text-[#00e5ff]" size={18} />
                    <h2 className="text-lg font-bold tracking-wide">SCADA Modbus & MQTT Sensor Registry</h2>
                  </div>
                  <span className="text-xs font-mono text-gray-500">14 Linked Transducers</span>
                </div>

                <div className="flex flex-col gap-2">
                  
                  {/* CH4 Sensor Card */}
                  <div className="iot-card">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white font-mono">SN-CH4-08A</span>
                      <span className="text-[9px] text-gray-500 font-mono">Type: NDIR Methane | Modbus: Reg 40012</span>
                    </div>
                    {/* Sparkline */}
                    <svg className={`sparkline-svg ${sensors.ch4 >= 10 ? 'alert' : (sensors.ch4 > 0 ? 'warning' : '')}`}>
                      <path d={`M 0,15 L 10,12 L 20,${18 - sensors.ch4 * 0.4} L 30,10 L 40,${15 - sensors.ch4 * 0.5} L 55,20 L 70,${20 - sensors.ch4 * 0.9}`} />
                    </svg>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono" style={{ color: sensors.ch4 >= 10 ? '#ff1744' : '#fff' }}>
                        {sensors.ch4}% LEL
                      </span>
                      <span className="text-[8px] text-[#10B981] font-mono block">ONLINE (MQTT)</span>
                    </div>
                  </div>

                  {/* H2S Sensor Card */}
                  <div className="iot-card">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white font-mono">SN-H2S-14C</span>
                      <span className="text-[9px] text-gray-500 font-mono">Type: Electrochemical H2S | Modbus: Reg 40018</span>
                    </div>
                    {/* Sparkline */}
                    <svg className={`sparkline-svg ${sensors.h2s >= 10 ? 'alert' : (sensors.h2s > 0 ? 'warning' : '')}`}>
                      <path d={`M 0,14 L 10,${14 - sensors.h2s * 0.2} L 22,17 L 35,${10 - sensors.h2s * 0.3} L 48,15 L 60,18 L 70,${20 - sensors.h2s * 0.7}`} />
                    </svg>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono" style={{ color: sensors.h2s >= 10 ? '#ff1744' : '#fff' }}>
                        {sensors.h2s} ppm
                      </span>
                      <span className="text-[8px] text-[#10B981] font-mono block">ONLINE (Modbus)</span>
                    </div>
                  </div>

                  {/* CO Sensor Card */}
                  <div className="iot-card">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white font-mono">SN-CO-05E</span>
                      <span className="text-[9px] text-gray-500 font-mono">Type: Electrochemical Carbon Monoxide | Modbus: Reg 40024</span>
                    </div>
                    {/* Sparkline */}
                    <svg className={`sparkline-svg ${sensors.co >= 35 ? 'warning' : ''}`}>
                      <path d={`M 0,16 L 10,13 L 24,${16 - sensors.co * 0.05} L 38,11 L 50,15 L 70,${20 - sensors.co * 0.1}`} />
                    </svg>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono" style={{ color: sensors.co >= 35 ? '#f59e0b' : '#fff' }}>
                        {sensors.co} ppm
                      </span>
                      <span className="text-[8px] text-[#10B981] font-mono block">ONLINE (Modbus)</span>
                    </div>
                  </div>

                  {/* Ventilation System Status Card */}
                  <div className="iot-card">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white font-mono">SN-VENT-02</span>
                      <span className="text-[9px] text-gray-500 font-mono">Type: Air Flow Transducer | Modbus: Reg 40030</span>
                    </div>
                    {/* Sparkline */}
                    <svg className={`sparkline-svg ${!sensors.ventilation ? 'alert' : ''}`}>
                      <path d={sensors.ventilation ? "M 0,12 L 15,10 L 30,12 L 45,9 L 60,11 L 70,10" : "M 0,22 H 70"} />
                    </svg>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono" style={{ color: sensors.ventilation ? '#10B981' : '#ff1744' }}>
                        {sensors.ventilation ? 'FLOW OK' : 'NO FLOW'}
                      </span>
                      <span className="text-[8px] font-mono block" style={{ color: sensors.ventilation ? '#10B981' : '#ff1744' }}>
                        {sensors.ventilation ? 'ONLINE' : 'FAILED'}
                      </span>
                    </div>
                  </div>

                  {/* Temperature Probe Card */}
                  <div className="iot-card">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white font-mono">SN-TEMP-11</span>
                      <span className="text-[9px] text-gray-500 font-mono">Type: PT100 RTD Thermistor | MQTT: co5/thermal</span>
                    </div>
                    {/* Sparkline */}
                    <svg className="sparkline-svg">
                      <path d={`M 0,15 L 12,${16 - (sensors.temperature - 20) * 0.1} L 24,14 L 38,${16 - (sensors.temperature - 20) * 0.2} L 52,15 L 70,${20 - (sensors.temperature - 20) * 0.4}`} />
                    </svg>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-white">
                        {sensors.temperature}°C
                      </span>
                      <span className="text-[8px] text-[#10B981] font-mono block">ONLINE (MQTT)</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Tab 4: AgentConsole */}
            {activeTab === 'agents' && (
              <AgentConsole 
                messages={agentMessages}
                riskLevel={riskAnalysis.level}
              />
            )}

            {/* Tab 5: ComplianceCopilot */}
            {activeTab === 'compliance' && (
              <ComplianceCopilot 
                sensors={sensors}
                permits={permits}
                workers={workers}
              />
            )}

            {/* Tab 6: EmergencyOrchestrator */}
            {activeTab === 'emergency' && (
              <EmergencyOrchestrator 
                riskLevel={riskAnalysis.level}
                sensors={sensors}
                permits={permits}
                workers={workers}
                isManualTriggered={isManualTriggered}
                onToggleManualTrigger={handleToggleManualTrigger}
              />
            )}

          </div>

        </div>

        {/* Right Side: Telemetry Controls & Agent Logs */}
        <div className="flex flex-col gap-4">
          <SimulatorControls 
            sensors={sensors}
            setSensors={setSensors}
            permits={permits}
            onTogglePermit={handleTogglePermit}
            ppeViolationActive={ppeViolationActive}
            onTogglePpeViolation={() => setPpeViolationActive(!ppeViolationActive)}
            onApplyPreset={applyPreset}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-white-05 text-[10px] text-gray-600 font-mono mt-8">
        AEGIS SENTINEL PLATFORM (V2.1) | HACKATHON BUILD SPEC - CONFIDENTIAL | UNSTOP PLATFORM SUBMISSION
      </footer>
    </div>
  );
}

export default App;

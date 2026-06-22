import React from 'react';
import type { SensorData, WorkPermit } from '../utils/riskEngine';
import { Sliders, ShieldAlert, Sparkles } from 'lucide-react';

interface SimulatorControlsProps {
  sensors: SensorData;
  setSensors: (updater: (prev: SensorData) => SensorData) => void;
  permits: WorkPermit[];
  onTogglePermit: (id: string) => void;
  ppeViolationActive: boolean;
  onTogglePpeViolation: () => void;
  onApplyPreset: (preset: 'normal' | 'confined' | 'hotwork' | 'heat') => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  sensors,
  setSensors,
  permits,
  onTogglePermit,
  ppeViolationActive,
  onTogglePpeViolation,
  onApplyPreset
}) => {

  const handleSensorChange = (key: keyof SensorData, value: number | boolean) => {
    setSensors((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white-05 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="text-[#00e5ff]" size={18} />
          <h2 className="text-lg font-bold tracking-wide">Telemetry Simulator Controls</h2>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#00e5ff] font-mono bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/20">
          <Sparkles size={10} />
          SIM MODE: MANUAL OVERRIDE
        </div>
      </div>

      {/* 1. Quick Scenario Presets */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Scenario Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            className="text-xs font-semibold py-2 px-3 rounded bg-white/5 border border-white/10 hover:bg-[#10B981]/15 hover:border-[#10B981] transition-all text-left"
            onClick={() => onApplyPreset('normal')}
          >
            🟢 Normal Operations
          </button>
          <button 
            className="text-xs font-semibold py-2 px-3 rounded bg-white/5 border border-white/10 hover:bg-[#ff1744]/15 hover:border-[#ff1744] transition-all text-left"
            onClick={() => onApplyPreset('confined')}
          >
            🚨 Confined Space Gas Trap
          </button>
          <button 
            className="text-xs font-semibold py-2 px-3 rounded bg-white/5 border border-white/10 hover:bg-[#f59e0b]/15 hover:border-[#f59e0b] transition-all text-left"
            onClick={() => onApplyPreset('hotwork')}
          >
            🔥 Hot Work Ignition Risk
          </button>
          <button 
            className="text-xs font-semibold py-2 px-3 rounded bg-white/5 border border-white/10 hover:bg-blue-500/15 hover:border-blue-500 transition-all text-left"
            onClick={() => onApplyPreset('heat')}
          >
            ⚠️ Heat Fatigue & PPE Breach
          </button>
        </div>
      </div>

      <hr className="border-white-05" />

      {/* 2. Gas Telemetry Sliders */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Gas Telemetry</h3>
        <div className="flex flex-col gap-3">
          
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Methane (CH4) Leak</span>
              <span className={sensors.ch4 >= 10 ? 'text-[#ff1744] font-bold' : 'text-gray-300'}>
                {sensors.ch4}% LEL {sensors.ch4 >= 10 && '⚠️'}
              </span>
            </div>
            <input 
              type="range" min="0" max="20" step="1" 
              value={sensors.ch4}
              onChange={(e) => handleSensorChange('ch4', parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>0% (Safe)</span>
              <span>10% LEL Limit</span>
              <span>20% LEL</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Hydrogen Sulphide (H2S)</span>
              <span className={sensors.h2s >= 10 ? 'text-[#ff1744] font-bold' : 'text-gray-300'}>
                {sensors.h2s} ppm {sensors.h2s >= 10 && '⚠️'}
              </span>
            </div>
            <input 
              type="range" min="0" max="25" step="1" 
              value={sensors.h2s}
              onChange={(e) => handleSensorChange('h2s', parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>0 ppm</span>
              <span>10 ppm OSHA PEL</span>
              <span>25 ppm</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Carbon Monoxide (CO)</span>
              <span className={sensors.co >= 35 ? 'text-[#f59e0b] font-bold' : 'text-gray-300'}>
                {sensors.co} ppm {sensors.co >= 35 && '⚠️'}
              </span>
            </div>
            <input 
              type="range" min="0" max="150" step="5" 
              value={sensors.co}
              onChange={(e) => handleSensorChange('co', parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>0 ppm</span>
              <span>35 ppm TWA Limit</span>
              <span>150 ppm</span>
            </div>
          </div>

        </div>
      </div>

      <hr className="border-white-05" />

      {/* 3. Ambient & Operations */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Environmental Telemetry</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono mb-1 text-gray-400">Temperature (°C)</label>
            <input 
              type="range" min="20" max="50" step="1" 
              value={sensors.temperature}
              onChange={(e) => handleSensorChange('temperature', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>20°C</span>
              <span>{sensors.temperature}°C</span>
              <span>50°C</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono mb-1 text-gray-400">Wind Speed (km/h)</label>
            <input 
              type="range" min="0" max="40" step="2" 
              value={sensors.windSpeed}
              onChange={(e) => handleSensorChange('windSpeed', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>Calm</span>
              <span>{sensors.windSpeed} km/h</span>
              <span>40 km/h</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 bg-white-02 p-2.5 rounded border border-white-05">
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Forced Air Ventilation</span>
            <span className="text-[10px] text-gray-400">Main exhaust and air-push systems</span>
          </div>
          <button 
            onClick={() => handleSensorChange('ventilation', !sensors.ventilation)}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              sensors.ventilation 
                ? 'bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/40' 
                : 'bg-[#ff1744]/25 text-[#ff1744] border border-[#ff1744]/40 animate-pulse'
            }`}
          >
            {sensors.ventilation ? 'ACTIVE' : 'FAILED'}
          </button>
        </div>
      </div>

      <hr className="border-white-05" />

      {/* 4. Active Work Permits */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Work Permits</h3>
        <div className="flex flex-col gap-2">
          {permits.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-white-02 p-2 rounded border border-white-05">
              <div className="flex flex-col">
                <span className="text-xs font-semibold">{p.type}</span>
                <span className="text-[9px] text-gray-400">{p.permitNumber} | {p.location}</span>
              </div>
              <button 
                onClick={() => onTogglePermit(p.id)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                  p.status === 'Active'
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {p.status === 'Active' ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-white-05" />

      {/* 5. CCTV Camera CV Alerts */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          <ShieldAlert size={14} className="text-[#ff1744]" />
          CCTV Computer Vision Analytics
        </div>
        <div className="flex items-center justify-between bg-white-02 p-2.5 rounded border border-white-05">
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Flag PPE Compliance Violations</span>
            <span className="text-[10px] text-gray-400">Simulate camera spotting technician without helmet</span>
          </div>
          <button 
            onClick={onTogglePpeViolation}
            className={`text-xs font-bold px-3 py-1 rounded transition-all ${
              ppeViolationActive 
                ? 'bg-[#ff1744] text-white border border-[#ff1744] animate-pulse'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-[#ff1744]/50'
            }`}
          >
            {ppeViolationActive ? '⚠️ DETECTED' : 'SECURE'}
          </button>
        </div>
      </div>

      <hr className="border-white-05" />

      {/* 6. Modbus / MQTT Schema Registry Details */}
      <div className="bg-[#05070e]/80 p-2.5 rounded border border-white-05 text-[9px] font-mono text-gray-500">
        <span className="text-[10px] font-bold text-gray-400 block mb-1">🔗 INDUSTRIAL SCADA MAPPINGS</span>
        <div className="flex flex-col gap-1">
          <div>• Modbus/TCP: <span className="text-[#00e5ff]">Register 40012</span> (Coils) &rarr; CH4 Gas LEL</div>
          <div>• Modbus/TCP: <span className="text-[#00e5ff]">Register 40018</span> (Input) &rarr; H2S Gas ppm</div>
          <div>• MQTT Topic: <span className="text-[#8b5cf6]">refinery/co5/ambient</span> (JSON) &rarr; Temp / Wind</div>
          <div>• RTSP Stream: <span className="text-[#10b981]">rtsp://cctv-srv/co5/cam01</span> (YOLOv8) &rarr; PPE Audit</div>
        </div>
      </div>
    </div>
  );
};

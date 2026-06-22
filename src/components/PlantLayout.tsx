import React from 'react';
import type { SensorData, WorkPermit, Worker } from '../utils/riskEngine';
import { Radio } from 'lucide-react';

interface PlantLayoutProps {
  sensors: SensorData;
  permits: WorkPermit[];
  workers: Worker[];
  selectedWorker: Worker | null;
  onSelectWorker: (worker: Worker | null) => void;
  isEvacuating: boolean;
}

export const PlantLayout: React.FC<PlantLayoutProps> = ({
  sensors,
  permits,
  workers,
  selectedWorker,
  onSelectWorker,
  isEvacuating
}) => {
  const hotWorkActive = permits.some(p => p.type === 'Hot Work' && p.status === 'Active');
  const confinedSpaceActive = permits.some(p => p.type === 'Confined Space Entry' && p.status === 'Active');

  return (
    <div className="glass-panel p-5 flex flex-col h-full position-relative">
      <div className="flex justify-between items-center mb-4 border-b border-white-05 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="text-[#00e5ff] animate-pulse" size={18} />
          <h2 className="text-lg font-bold tracking-wide">Live Spatial Digital Twin Map</h2>
        </div>
        <div className="flex gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Safe</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span> Warning</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ff1744] animate-pulse"></span> Hazard</span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="flex-grow flex items-center justify-center bg-[#05070e] rounded-lg border border-white-05 relative overflow-hidden" style={{ minHeight: '380px' }}>
        
        {/* Technical HUD Overlay Grid Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }} 
        />

        {/* Evacuation Alert Flash Overlay */}
        {isEvacuating && (
          <div className="absolute inset-0 pointer-events-none z-10"
               style={{ 
                 border: '3px solid #ff1744',
                 animation: 'pulse-red-border 1.5s infinite',
                 boxShadow: 'inset 0 0 40px rgba(255, 23, 68, 0.15)'
               }}
          />
        )}

        <svg viewBox="0 0 800 450" className="w-full h-full select-none" style={{ maxHeight: '420px' }}>
          <defs>
            {/* Radial gradients for simulated gas dispersion */}
            <radialGradient id="ch4Glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={sensors.ch4 >= 10 ? '#ff1744' : '#f59e0b'} stopOpacity="0.6" />
              <stop offset="60%" stopColor={sensors.ch4 >= 10 ? '#ff1744' : '#f59e0b'} stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="h2sGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={sensors.h2s >= 10 ? '#ff1744' : '#f59e0b'} stopOpacity="0.75" />
              <stop offset="50%" stopColor={sensors.h2s >= 10 ? '#ff1744' : '#f59e0b'} stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff1744" stopOpacity="0" />
            </radialGradient>

            <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,23,68,0.2)" strokeWidth="3" />
            </pattern>
          </defs>

          {/* --- PLANT STRUCTURES & ZONES --- */}
          
          {/* Technical HUD elements */}
          <g transform="translate(750, 45)" opacity="0.45" stroke="#00e5ff" strokeWidth="1" fill="none">
            <circle cx="0" cy="0" r="16" strokeDasharray="3,3" />
            <line x1="0" y1="-20" x2="0" y2="20" />
            <line x1="-20" y1="0" x2="20" y2="0" />
            <text x="0" y="-23" fill="#00e5ff" stroke="none" fontSize="8" textAnchor="middle" fontWeight="bold">N</text>
            <text x="24" y="3" fill="#6b7280" stroke="none" fontSize="7" textAnchor="start">E</text>
            <text x="-24" y="3" fill="#6b7280" stroke="none" fontSize="7" textAnchor="end">W</text>
            <text x="0" y="27" fill="#6b7280" stroke="none" fontSize="7" textAnchor="middle">S</text>
          </g>

          {/* Coordinate ticks */}
          <line x1="100" y1="0" x2="100" y2="8" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="200" y1="0" x2="200" y2="8" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="300" y1="0" x2="300" y2="8" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="400" y1="0" x2="400" y2="8" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="500" y1="0" x2="500" y2="8" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="600" y1="0" x2="600" y2="8" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="700" y1="0" x2="700" y2="8" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="0" y1="100" x2="8" y2="100" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="0" y1="200" x2="8" y2="200" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="0" y1="300" x2="8" y2="300" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />
          <line x1="0" y1="400" x2="8" y2="400" stroke="rgba(0,229,255,0.15)" strokeWidth="1" />

          {/* Base Layout Grid Labels */}
          <text x="15" y="25" fill="#6b7280" fontSize="10" fontFamily="var(--font-mono)">LAT: 17.7291° N | LON: 83.2201° E (Vizag Steel Battery-5)</text>
          
          {/* 1. Coke Oven Battery Zone */}
          <g id="zone-coke-oven">
            {/* Active Hot Work Permit Boundary Glow */}
            <rect x="50" y="60" width="280" height="140" rx="8" 
                  fill={hotWorkActive ? "rgba(245, 158, 11, 0.04)" : "rgba(255, 255, 255, 0.01)"} 
                  stroke={hotWorkActive ? "#f59e0b" : "rgba(255,255,255,0.1)"} 
                  strokeWidth={hotWorkActive ? "2" : "1"}
                  strokeDasharray={hotWorkActive ? "6,4" : "none"} 
                  className={hotWorkActive ? "animate-pulse" : ""}
            />
            {hotWorkActive && (
              <text x="60" y="80" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)">[ACTIVE PERMIT: HOT WORK]</text>
            )}
            <text x="60" y="185" fill="#f3f4f6" fontSize="14" fontWeight="600">Coke Oven Battery #5</text>
            <text x="60" y="100" fill="#9ca3af" fontSize="10">Oven chambers, gas extraction headers</text>
          </g>

          {/* 2. Gas Manifold & Pipings */}
          <g id="zone-gas-manifold">
            {/* Piping conduits */}
            <path d="M 230 130 H 450 V 220 H 600" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="8" />
            <path d="M 230 130 H 450 V 220 H 600" fill="none" 
                  stroke={sensors.ch4 > 0 ? (sensors.ch4 >= 10 ? "#ff1744" : "#f59e0b") : "#00e5ff"} 
                  strokeWidth="2" 
                  strokeDasharray="8,8" 
                  className={sensors.ch4 > 0 ? "animate-pulse" : ""}
            />
            
            {/* Manifold Block */}
            <rect x="420" y="180" width="100" height="80" rx="6" 
                  fill="rgba(13, 20, 38, 0.8)" 
                  stroke={sensors.ch4 >= 10 ? "#ff1744" : "rgba(255,255,255,0.15)"} 
                  strokeWidth="1.5" 
            />
            <text x="430" y="200" fill="#f3f4f6" fontSize="11" fontWeight="600">Gas Manifold</text>
            <text x="430" y="215" fill="#9ca3af" fontSize="9">Control Valves</text>
            
            {/* CH4 Sensor Node */}
            <circle cx="470" cy="235" r="7" fill={sensors.ch4 >= 10 ? "#ff1744" : (sensors.ch4 > 0 ? "#f59e0b" : "#10B981")} />
            <text x="482" y="238" fill="#9ca3af" fontSize="9" fontFamily="var(--font-mono)">CH4: {sensors.ch4}%</text>
          </g>

          {/* 3. Storage Tank B (Confined Space) */}
          <g id="zone-storage-tank">
            {/* Highlighted Confined Space boundary */}
            <rect x="520" y="60" width="220" height="150" rx="8" 
                  fill={confinedSpaceActive ? "rgba(139, 92, 246, 0.05)" : "rgba(255, 255, 255, 0.01)"} 
                  stroke={confinedSpaceActive ? "#8b5cf6" : "rgba(255,255,255,0.1)"}
                  strokeWidth={confinedSpaceActive ? "2" : "1"}
                  strokeDasharray={confinedSpaceActive ? "6,4" : "none"}
            />
            <circle cx="630" cy="135" r="45" fill="rgba(13, 20, 38, 0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            
            {confinedSpaceActive && (
              <circle cx="630" cy="135" r="45" fill="url(#diagonalHatch)" />
            )}
            
            <text x="590" y="130" fill="#f3f4f6" fontSize="11" fontWeight="bold" textAnchor="middle">Storage Tank B</text>
            <text x="590" y="145" fill="#8b5cf6" fontSize="8" fontWeight="bold" textAnchor="middle">[CONFINED SPACE]</text>
            
            {/* H2S Sensor Node inside Tank B */}
            <circle cx="655" cy="135" r="6" fill={sensors.h2s >= 10 ? "#ff1744" : (sensors.h2s > 0 ? "#f59e0b" : "#10B981")} />
            <text x="666" y="138" fill="#9ca3af" fontSize="9" fontFamily="var(--font-mono)">H2S: {sensors.h2s} ppm</text>
          </g>

          {/* 4. Compressor Station & Main Control Room */}
          <g id="zone-control-room">
            <rect x="50" y="270" width="220" height="130" rx="8" fill="rgba(13, 20, 38, 0.8)" stroke="rgba(255,255,255,0.1)" />
            <text x="65" y="295" fill="#f3f4f6" fontSize="13" fontWeight="600">Compressor Station</text>
            <text x="65" y="312" fill="#9ca3af" fontSize="10">Secondary air compressors & control logic</text>
            
            {/* Ventilation system indicator */}
            <rect x="65" y="330" width="100" height="22" rx="4" 
                  fill={sensors.ventilation ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 23, 68, 0.15)"} 
                  stroke={sensors.ventilation ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 23, 68, 0.5)"} 
            />
            <text x="73" y="344" fill={sensors.ventilation ? "#10B981" : "#ff1744"} fontSize="8" fontWeight="bold" fontFamily="var(--font-mono)">
              FORCED VENT: {sensors.ventilation ? 'ACTIVE' : 'FAILED'}
            </text>
          </g>

          {/* 5. Safe Assembly Point */}
          <g id="zone-assembly">
            <rect x="520" y="290" width="220" height="110" rx="8" fill="rgba(16, 185, 129, 0.05)" stroke="#10B981" strokeWidth="1" strokeDasharray="4,4" />
            <text x="630" y="330" fill="#10B981" fontSize="14" fontWeight="800" textAnchor="middle">SAFE ASSEMBLY POINT</text>
            <text x="630" y="348" fill="#9ca3af" fontSize="10" textAnchor="middle">Wind direction evacuation safe zone</text>
            <text x="630" y="365" fill="#6b7280" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">COORDINATES: S-4 SECTOR</text>
          </g>

          {/* --- GAS PLUME SIMULATION (Radial Gradient Overlays) --- */}
          {/* Methane (CH4) Plume near Manifold */}
          {sensors.ch4 > 0 && (
            <circle cx="450" cy="200" r={40 + sensors.ch4 * 6} fill="url(#ch4Glow)" className="pointer-events-none opacity-60" />
          )}

          {/* Hydrogen Sulphide (H2S) Plume near Storage Tank */}
          {sensors.h2s > 0 && (
            <circle cx="630" cy="135" r={30 + sensors.h2s * 8} fill="url(#h2sGlow)" className="pointer-events-none opacity-70" />
          )}

          {/* --- DYNAMIC EVACUATION PATHS --- */}
          {isEvacuating && (
            <g id="evacuation-routes">
              {/* Route 1: Coke Oven to Assembly Point */}
              <path d="M 230 180 Q 380 250 560 300" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="8,6" className="animate-pulse" />
              {/* Route 2: Storage Tank to Assembly Point */}
              <path d="M 630 185 V 285" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="8,6" className="animate-pulse" />
              
              {/* Evac directional arrows */}
              <polygon points="560,300 550,293 553,303" fill="#10B981" />
              <polygon points="630,285 625,275 635,275" fill="#10B981" />
              
              <text x="350" y="225" fill="#10B981" fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">EVAC ROUTE A</text>
              <text x="640" y="240" fill="#10B981" fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">EVAC ROUTE B</text>
            </g>
          )}

          {/* --- WORKER NODES --- */}
          {workers.map(w => {
            const isSelected = selectedWorker?.id === w.id;
            
            return (
              <g key={w.id} 
                 transform={`translate(${(w.x / 100) * 800}, ${(w.y / 100) * 450})`}
                 className="cursor-pointer"
                 onClick={(e) => {
                   e.stopPropagation();
                   onSelectWorker(isSelected ? null : w);
                 }}
              >
                {/* Glowing ring under selected worker */}
                {isSelected && (
                  <circle cx="0" cy="0" r="16" fill="none" stroke="#00e5ff" strokeWidth="2" className="animate-pulse" />
                )}
                
                {/* Safety Ring based on PPE status */}
                <circle cx="0" cy="0" r="11" 
                        fill={w.ppeCompliant ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 23, 68, 0.3)"} 
                        stroke={w.ppeCompliant ? "#10B981" : "#ff1744"} 
                        strokeWidth="2" 
                />
                
                {/* Worker initials */}
                <text x="0" y="4" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {w.name.split(' ').map(n => n[0]).join('')}
                </text>
                
                {/* Small indicator label */}
                <text x="0" y="-15" fill={w.ppeCompliant ? "#9ca3af" : "#ff1744"} fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="var(--font-sans)">
                  {w.ppeCompliant ? '' : '⚠️ NO PPE'}
                </text>
              </g>
            );
          })}

        </svg>
        
        {/* Selected Worker Info Overlay Panel */}
        {selectedWorker && (
          <div className="absolute bottom-4 left-4 right-4 glass-panel p-3 border-[#00e5ff] z-20 flex justify-between items-center bg-[#0d1426] animate-slide-up" style={{ animation: 'slide-up 0.2s ease-out' }}>
            <div className="flex gap-4 items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${selectedWorker.ppeCompliant ? 'bg-[#10B981]' : 'bg-[#ff1744]'}`}>
                {selectedWorker.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-sm font-bold">{selectedWorker.name} ({selectedWorker.role})</h4>
                <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                  <span>Zone: <strong className="text-white">{selectedWorker.activeZone}</strong></span>
                  <span>Telemetry: <strong className={selectedWorker.heartRate > 100 ? "text-[#f59e0b]" : "text-[#10B981]"}>{selectedWorker.heartRate} bpm</strong></span>
                  <span className="flex items-center gap-1">
                    PPE Status: 
                    <strong className={selectedWorker.ppeCompliant ? "text-[#10B981]" : "text-[#ff1744]"}>
                      {selectedWorker.ppeCompliant ? 'Compliant' : 'VIOLATION DETECTED'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
            <button className="text-xs border border-white-20 hover:border-[#00e5ff] rounded px-3 py-1 bg-white-05 transition-colors"
                    onClick={() => onSelectWorker(null)}>
              Close
            </button>
          </div>
        )}
      </div>
      
      {/* HUD Info Footer */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] text-gray-500 font-mono">
        <div className="border border-white-05 p-1 rounded">WIND: {sensors.windSpeed} KM/H E</div>
        <div className="border border-white-05 p-1 rounded">TEMP: {sensors.temperature}°C</div>
        <div className="border border-white-05 p-1 rounded">SYS LOCK: UNLOCKED</div>
        <div className="border border-white-05 p-1 rounded">SCADA LINK: SECURE</div>
      </div>
    </div>
  );
};

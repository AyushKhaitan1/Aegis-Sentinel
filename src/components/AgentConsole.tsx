import React, { useEffect, useRef } from 'react';
import type { AgentMessage } from '../utils/riskEngine';
import { Cpu, MessageSquare, Terminal, Shield, Activity, FileCheck, AlertTriangle } from 'lucide-react';

interface AgentConsoleProps {
  messages: AgentMessage[];
  riskLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

export const AgentConsole: React.FC<AgentConsoleProps> = ({ messages, riskLevel }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom when new messages appear
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'Telemetry Agent':
        return <Activity size={14} className="text-[#3b82f6]" />;
      case 'Permit Coordinator':
        return <FileCheck size={14} className="text-[#8b5cf6]" />;
      case 'Compliance Officer':
        return <Shield size={14} className="text-[#f59e0b]" />;
      case 'Emergency Director':
        return <AlertTriangle size={14} className="text-[#ff1744]" />;
      default:
        return <Cpu size={14} className="text-[#00e5ff]" />;
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-full bg-[#080d1a]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white-05 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="text-[#00e5ff]" size={18} />
          <h2 className="text-lg font-bold tracking-wide">Multi-Agent Safety War Room</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              riskLevel === 'CRITICAL' ? 'bg-[#ff1744]' : (riskLevel === 'HIGH' ? 'bg-[#f59e0b]' : 'bg-[#00e5ff]')
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              riskLevel === 'CRITICAL' ? 'bg-[#ff1744]' : (riskLevel === 'HIGH' ? 'bg-[#f59e0b]' : 'bg-[#00e5ff]')
            }`}></span>
          </span>
          <span className="text-xs font-mono text-gray-400">Collaborative Layer Active</span>
        </div>
      </div>

      {/* 1. Agent Status Cards */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="border border-white-05 p-2 rounded bg-white-01 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-full bg-[#3b82f6]/10 flex items-center justify-center mb-1.5 border border-[#3b82f6]/20">
            <Activity size={14} className="text-[#3b82f6]" />
          </div>
          <span className="text-[10px] font-bold">Telemetry</span>
          <span className="text-[8px] text-[#10B981] font-mono mt-0.5">ONLINE</span>
        </div>

        <div className="border border-white-05 p-2 rounded bg-white-01 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center mb-1.5 border border-[#8b5cf6]/20">
            <FileCheck size={14} className="text-[#8b5cf6]" />
          </div>
          <span className="text-[10px] font-bold">Permits</span>
          <span className="text-[8px] text-[#10B981] font-mono mt-0.5">ONLINE</span>
        </div>

        <div className="border border-white-05 p-2 rounded bg-white-01 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-full bg-[#f59e0b]/10 flex items-center justify-center mb-1.5 border border-[#f59e0b]/20">
            <Shield size={14} className="text-[#f59e0b]" />
          </div>
          <span className="text-[10px] font-bold">Compliance</span>
          <span className="text-[8px] text-[#10B981] font-mono mt-0.5">ANALYZING</span>
        </div>

        <div className="border border-white-05 p-2 rounded bg-white-01 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-full bg-[#ff1744]/10 flex items-center justify-center mb-1.5 border border-[#ff1744]/20">
            <AlertTriangle size={14} className="text-[#ff1744]" />
          </div>
          <span className="text-[10px] font-bold">Emergency</span>
          <span className="text-[8px] font-mono mt-0.5" style={{ color: riskLevel === 'CRITICAL' ? '#ff1744' : '#6b7280' }}>
            {riskLevel === 'CRITICAL' ? 'STANDBY' : 'SLEEPING'}
          </span>
        </div>
      </div>

      {/* 2. Interactive Terminal log */}
      <div className="flex-grow flex flex-col bg-[#04060c] border border-white-05 rounded-lg p-3 overflow-hidden" style={{ minHeight: '260px' }}>
        
        {/* Terminal Header Info */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono border-b border-white-05 pb-2 mb-2">
          <MessageSquare size={10} />
          <span>AEGIS_SENTINEL_AGENT_LOGS.sh</span>
        </div>

        {/* Scrollable Message Box */}
        <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-3 font-mono text-xs">
          {messages.length === 0 ? (
            <div className="text-gray-600 italic p-4 text-center">
              Awaiting telemetry triggers... Modify simulator values to start agent discussion.
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="border-l-2 pl-3 py-0.5" style={{ borderColor: msg.avatarColor }}>
                
                {/* Agent metadata */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center">
                    {getAgentIcon(msg.agentName)}
                  </span>
                  <span className="font-bold text-[11px]" style={{ color: msg.avatarColor }}>
                    {msg.agentName}
                  </span>
                  <span className="text-[9px] text-gray-500">
                    [{msg.timestamp}]
                  </span>
                </div>

                {/* Message Content */}
                <div className="text-gray-300 leading-relaxed text-[11px] whitespace-pre-wrap">
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
      
      {/* Agent system instructions description */}
      <div className="mt-3 text-[10px] text-gray-500 font-sans leading-relaxed border-t border-white-05 pt-2">
        <strong>Operation Note:</strong> Each agent parses distinct schemas (IoT SCADA channels, active work permits, Factories Act regulations) and publishes findings to the shared Sentinel Core coordinator using structured compliance payloads.
      </div>
    </div>
  );
};

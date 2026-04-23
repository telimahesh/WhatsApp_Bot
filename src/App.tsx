import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Send, Users, Tag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';

export default function App() {
  const [status, setStatus] = useState({ status: 'Loading...', qr: '' });
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setStatus(data);
        
        if (data.qr) {
          const url = await QRCode.toDataURL(data.qr);
          setQrUrl(url);
        } else {
          setQrUrl('');
        }
      } catch (err) {
        console.error('Failed to fetch status', err);
      }
    };

    const interval = setInterval(fetchStatus, 3000);
    fetchStatus();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#E0E0E0] font-sans p-6 md:p-12 selection:bg-white selection:text-black">
      <div className="max-w-[1280px] mx-auto flex flex-col min-h-full">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-baseline border-b border-white/10 pb-8 mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl font-serif italic tracking-tighter text-white"
          >
            WA—Auto
          </motion.h1>
          <div className="text-right uppercase tracking-[0.2em] text-[10px] opacity-40 font-bold mt-4 md:mt-0">
            System Version 2.4.1 // Unofficial Bridge
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 flex-grow">
          
          {/* Left: Authentication Column */}
          <div className="md:col-span-3 flex flex-col space-y-6">
            <div className="bg-[#141414] border border-white/5 p-6 rounded-sm">
              <div className="text-[10px] uppercase tracking-widest opacity-40 mb-5">Authentication Status</div>
              <div className="flex items-center space-x-2 mb-8">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  status.status === 'Connected' 
                    ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' 
                    : 'bg-amber-500 shadow-[0_0_12px_#f59e0b] animate-pulse'
                }`}></span>
                <span className="text-xs font-mono font-bold tracking-tight uppercase">
                  {status.status === 'Connected' ? 'ACTIVE SESSION' : 'AWAITING AUTH'}
                </span>
              </div>

              <div className="aspect-square bg-white p-3 mb-6 relative overflow-hidden group">
                <AnimatePresence mode="wait">
                  {qrUrl ? (
                    <motion.img 
                      key="qr"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={qrUrl} 
                      className="w-full h-full object-contain" 
                      alt="Link your device" 
                    />
                  ) : status.status === 'Connected' ? (
                    <motion.div 
                      key="active"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center text-black"
                    >
                      <CheckCircle size={48} strokeWidth={1} />
                      <span className="text-[10px] mt-2 font-bold uppercase tracking-widest">Linked</span>
                    </motion.div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <Smartphone className="animate-bounce" size={32} />
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-[11px] opacity-40 leading-relaxed italic font-serif">
                Scan via Linked Devices. Risk acknowledged: secondary SIM recommended for high-volume tasks.
              </p>
            </div>

            <div className="bg-[#141414] border border-white/5 p-6 rounded-sm flex-grow">
              <div className="text-[10px] uppercase tracking-widest opacity-40 mb-6">Environment</div>
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-mono flex justify-between uppercase opacity-60 mb-2">
                    <span>Performance</span>
                    <span>98%</span>
                  </div>
                  <div className="w-full bg-white/5 h-[1px]"><div className="bg-white/30 h-full w-[98%]"></div></div>
                </div>
                <div className="text-[10px] font-mono leading-relaxed opacity-60">
                   RUNTIME: NODE_LTS<br/>
                   PORT: 3000<br/>
                   BRIDGE: PUPPETEER_CHROME
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Commands & API */}
          <div className="md:col-span-5 flex flex-col space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10 border border-white/10">
              <div className="p-8 bg-[#0C0C0C]">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2">Internal Index</div>
                <div className="text-6xl font-serif">12.0<span className="text-xl italic opacity-40">k</span></div>
                <div className="text-[10px] uppercase mt-2 opacity-30 italic">Subscriber Load</div>
              </div>
              <div className="p-8 bg-[#0C0C0C]">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2">Success Rate</div>
                <div className="text-6xl font-serif">99<span className="text-xl italic opacity-40">%</span></div>
                <div className="text-[10px] uppercase mt-2 opacity-30 italic">Delivery Metric</div>
              </div>
            </div>

            <div className="flex-grow">
              <div className="text-[10px] uppercase tracking-widest opacity-40 mb-6 flex justify-between border-b border-white/10 pb-4">
                <span>Active Triggers</span>
                <span>System Call</span>
              </div>
              <ul className="space-y-4">
                {[
                  { cmd: '!deal', desc: 'Affiliate Fetch' },
                  { cmd: '!subscribe', desc: 'Persistence Write' },
                  { cmd: '!unsubscribe', desc: 'Identity Purge' }
                ].map((item, i) => (
                  <li key={i} className="flex justify-between items-baseline group hover:bg-white/5 p-2 -mx-2 transition-colors transition-all duration-300">
                    <span className="font-mono text-xs tracking-tight text-white">{item.cmd}</span>
                    <span className="font-serif italic text-xs opacity-40 group-hover:opacity-100">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F5F5F0] text-black p-8 rounded-sm">
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] mb-4">REST Integration Endpoint</div>
              <div className="bg-black/5 p-4 border border-black/5">
                <code className="block font-mono text-[11px] overflow-hidden whitespace-nowrap opacity-70">
                  POST /api/broadcast
                </code>
              </div>
              <p className="text-[11px] mt-5 leading-relaxed font-serif italic text-black/60">
                Bridge your external CRM or Shop backend (PHP/Python) to trigger synchronous broadcasts.
              </p>
            </div>
          </div>

          {/* Right: Live Logs */}
          <div className="md:col-span-4 flex flex-col">
            <div className="text-[10px] uppercase tracking-widest opacity-40 mb-6">Real-Time Event Log</div>
            <div className="bg-[#141414] flex-grow font-mono text-[10px] p-6 text-emerald-400/70 border border-white/5 overflow-hidden relative min-h-[400px]">
              <div className="space-y-2">
                <div><span className="opacity-30">[04:33:01]</span> BOT_CORE: Initialization sequence started.</div>
                <div><span className="opacity-30">[04:33:05]</span> FS_STRATEGY: Loaded subscribers.json</div>
                <div><span className="opacity-30">[04:33:10]</span> NETWORK: Establishing WebSocket handshake...</div>
                <AnimatePresence>
                  {status.status === 'Connected' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <span className="opacity-30">[04:35:12]</span> <span className="text-white">EVENT: Authenticated.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="animate-pulse">_</div>
              </div>
              
              {/* Scanline depth effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%]"></div>
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#141414] to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <footer className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] font-medium opacity-30 gap-4">
          <div>Persistence: subscribers.json // deals.json</div>
          <div className="flex space-x-10">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"></div> Cron: 09:00 Daily</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"></div> Secure TLS Enabled</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

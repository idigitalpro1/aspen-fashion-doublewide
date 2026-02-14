
import React, { useState, useEffect, useRef } from 'react';
import { AppState, City, PaparazziShot, AnalysisResult } from './types';
import { generatePaparazziShot, analyzeFashionTrend } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isKeySelected: false,
    activeCity: 'Paris',
    isGenerating: false,
    isAnalyzing: false,
    shots: [],
    selectedShotId: null,
    agentName: 'Patrick Sweeney'
  });

  useEffect(() => {
    const checkKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setState(prev => ({ ...prev, isKeySelected: selected }));
    };
    checkKey();
  }, []);

  const handleCapture = async () => {
    setState(prev => ({ ...prev, isGenerating: true }));
    try {
      const { url, prompt } = await generatePaparazziShot(state.activeCity);
      const newShot: PaparazziShot = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        city: state.activeCity,
        timestamp: Date.now(),
        prompt
      };
      setState(prev => ({ 
        ...prev, 
        shots: [newShot, ...prev.shots], 
        selectedShotId: newShot.id,
        isGenerating: false 
      }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleScan = async (shot: PaparazziShot) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const analysis = await analyzeFashionTrend(shot.prompt, state.agentName);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        shots: prev.shots.map(s => s.id === shot.id ? { ...s, analysis } : s)
      }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const activeShot = state.shots.find(s => s.id === state.selectedShotId);

  if (!state.isKeySelected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-12">
        <div className="text-center space-y-8 max-w-xl">
          <h1 className="text-6xl font-serif tracking-tighter uppercase">Aspen Fashion</h1>
          <div className="h-px bg-zinc-200 w-24 mx-auto"></div>
          <p className="text-zinc-500 font-light tracking-widest text-sm uppercase">Global Doublewide Viewer</p>
          <button 
            onClick={() => window.aistudio.openSelectKey().then(() => setState(p => ({ ...p, isKeySelected: true })))}
            className="aspen-bg-gold text-white px-12 py-4 rounded-full text-xs font-semibold tracking-widest hover:bg-black transition-all"
          >
            INITIALIZE STUDIO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-white">
      {/* LEFT: THE PULSE (Paparazzi Feed) */}
      <section className="flex-1 h-full border-r border-zinc-100 flex flex-col relative bg-[#f9f9f9]">
        <header className="p-6 flex justify-between items-center border-b border-zinc-100 bg-white">
          <div className="flex items-baseline space-x-2">
            <h2 className="text-xl font-serif font-bold">THE PULSE</h2>
            <span className="text-[10px] text-zinc-400 tracking-widest uppercase">Paparazzi Feed</span>
          </div>
          <div className="flex space-x-2">
            {(['Paris', 'Milan', 'London', 'LA'] as City[]).map(city => (
              <button 
                key={city}
                onClick={() => setState(prev => ({ ...prev, activeCity: city }))}
                className={`px-3 py-1 text-[10px] tracking-widest uppercase border rounded-full transition-all ${state.activeCity === city ? 'bg-black text-white' : 'hover:border-black text-zinc-500'}`}
              >
                {city}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {state.isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-2 border-aspen-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs tracking-widest text-zinc-400 uppercase">Capturing Street Style...</p>
            </div>
          ) : activeShot ? (
            <div className={`relative group ${state.isAnalyzing ? 'is-scanning' : ''}`}>
              <img 
                src={activeShot.url} 
                className="w-full h-auto rounded-sm shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" 
                alt="Street Style"
              />
              <div className="scan-line"></div>
              
              {!activeShot.analysis && !state.isAnalyzing && (
                <button 
                  onClick={() => handleScan(activeShot)}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-8 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase border border-zinc-200 hover:bg-black hover:text-white transition-all shadow-xl"
                >
                  <i className="fas fa-microchip mr-2"></i> Scan Fashion Identity
                </button>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <i className="fas fa-camera-retro text-4xl text-zinc-200"></i>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif">No Live Intelligence</h3>
                <p className="text-xs text-zinc-400 uppercase tracking-widest">Select a city and capture the front row</p>
              </div>
              <button 
                onClick={handleCapture}
                className="aspen-bg-gold text-white px-10 py-3 rounded-full text-xs font-bold tracking-widest"
              >
                CAPTURE {state.activeCity.toUpperCase()}
              </button>
            </div>
          )}
        </div>

        {state.shots.length > 0 && (
          <div className="h-24 bg-white border-t border-zinc-100 flex p-3 space-x-3 overflow-x-auto">
            <button 
              onClick={handleCapture}
              className="flex-shrink-0 w-16 h-full border-2 border-dashed border-zinc-200 rounded flex items-center justify-center text-zinc-300 hover:border-aspen-gold hover:text-aspen-gold transition-colors"
            >
              <i className="fas fa-plus"></i>
            </button>
            {state.shots.map(shot => (
              <img 
                key={shot.id}
                src={shot.url}
                onClick={() => setState(p => ({ ...p, selectedShotId: shot.id }))}
                className={`w-16 h-full object-cover rounded cursor-pointer transition-all ${state.selectedShotId === shot.id ? 'ring-2 ring-aspen-gold opacity-100' : 'opacity-40 hover:opacity-100'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* RIGHT: THE STYLIST STUDIO (Agent Analysis) */}
      <section className="w-full md:w-[450px] h-full flex flex-col bg-white border-l border-zinc-100">
        <header className="p-6 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <input 
                className="text-xl font-serif font-bold bg-transparent border-none focus:outline-none w-48 text-aspen-gold"
                value={state.agentName}
                onChange={(e) => setState(p => ({ ...p, agentName: e.target.value }))}
              />
              <p className="text-[9px] text-zinc-400 tracking-widest uppercase">Lead Fashion Intelligence Agent</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <i className="fas fa-user-tie text-zinc-400"></i>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {state.isAnalyzing ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-4 bg-zinc-100 rounded w-3/4"></div>
              <div className="h-24 bg-zinc-50 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-zinc-50 rounded"></div>
                <div className="h-20 bg-zinc-50 rounded"></div>
              </div>
            </div>
          ) : activeShot?.analysis ? (
            <div className="space-y-10">
              {/* Identified Items */}
              <section className="space-y-4">
                <h4 className="text-[10px] tracking-widest text-zinc-400 uppercase font-bold border-b pb-2">Identified Pieces</h4>
                <div className="space-y-3">
                  {activeShot.analysis.identifiedItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-start group">
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] aspen-gold font-bold uppercase cursor-pointer hover:underline">Find Similar</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Regional Predictive Trends */}
              <section className="space-y-4">
                <h4 className="text-[10px] tracking-widest text-zinc-400 uppercase font-bold border-b pb-2">Global Trend Mapping</h4>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(activeShot.analysis.regionalTrends).map(([city, trend]) => (
                    <div key={city} className="p-4 bg-zinc-50 rounded-sm border-l-2 border-aspen-gold">
                      <p className="text-[10px] font-bold uppercase mb-1">{city} Market</p>
                      <p className="text-xs text-zinc-600 leading-relaxed italic">"{trend}"</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Agent Verdict */}
              <section className="bg-black text-white p-6 rounded-sm">
                <p className="text-[10px] tracking-widest uppercase mb-4 opacity-50">Studio Verdict</p>
                <p className="text-lg font-serif italic leading-relaxed">
                  "{activeShot.analysis.agentVerdict}"
                </p>
                <div className="mt-6 pt-6 border-
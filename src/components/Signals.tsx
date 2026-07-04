import React from 'react';
import { AISignal } from '../lib/ai-engine';
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SignalsList = ({ currentSignal }: { currentSignal: AISignal | null }) => {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          AI Signal Engine
        </h3>
      </div>
      
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {currentSignal ? (
            <motion.div 
              key={currentSignal.type + currentSignal.timestamp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="relative inline-flex">
                <div className={`text-5xl font-black ${currentSignal.confidence > 70 ? 'text-green-500' : 'text-amber-500'}`}>
                  {currentSignal.confidence}%
                </div>
                <div className="absolute -top-2 -right-6">
                   <div className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </div>
                </div>
              </div>
              
              <div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider">
                  {currentSignal.type.replace('DIGIT', '')}
                </span>
              </div>
              
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">
                {currentSignal.reason}
              </p>

              <div className="pt-4 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-tighter text-muted-foreground">
                <span>Signal generated at {new Date(currentSignal.timestamp).toLocaleTimeString()}</span>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3 opacity-50">
              <Activity className="w-12 h-12 mx-auto animate-pulse text-muted-foreground" />
              <p>Analyzing market ticks...</p>
              <p className="text-xs">Waiting for pattern confirmation</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import { Activity } from 'lucide-react';

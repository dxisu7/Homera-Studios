import React, { useEffect, useRef } from 'react';
import { TransformationLog } from '../types';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface LogViewerProps {
  logs: TransformationLog[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-700">
        <p className="text-xs font-mono">Waiting for input stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {logs.map((log, index) => (
        <div key={index} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 mb-2">
            {log.status === 'loading' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
            {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {log.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
            
            <span className={`text-xs font-bold uppercase tracking-wider ${
              log.status === 'error' ? 'text-red-400' : 'text-zinc-300'
            }`}>
              {log.title}
            </span>
          </div>
          
          <p className="text-sm text-zinc-400 mb-2 pl-6 border-l-2 border-zinc-800">
            {log.message}
          </p>

          {log.data && (
            <div className="pl-6 border-l-2 border-zinc-800 mt-2">
              <div className="bg-black/50 rounded-lg p-3 overflow-x-auto border border-zinc-800">
                <pre className="text-[10px] leading-relaxed font-mono text-zinc-300">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
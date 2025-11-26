import React from 'react';
import { Download, Save, Check } from 'lucide-react';

interface ResultViewerProps {
  original: string | null;
  generated: string | null;
  onSave?: () => void;
  isSaved?: boolean;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ generated, onSave, isSaved }) => {
  if (!generated) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black group">
      <img 
        src={generated} 
        alt="Generated Visualization" 
        className="max-h-full max-w-full object-contain"
      />
      
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onSave && (
          <button 
            onClick={onSave}
            disabled={isSaved}
            className={`
              backdrop-blur px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg
              ${isSaved 
                ? 'bg-emerald-500/90 text-white cursor-default' 
                : 'bg-black/70 text-white hover:bg-yellow-500 hover:text-black border border-white/10'
              }
            `}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaved ? 'Saved' : 'Save Result'}
          </button>
        )}

        <a 
          href={generated} 
          download="homera-ai-render.png"
          className="bg-black/70 border border-white/10 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white hover:text-black transition-all transform hover:scale-105 shadow-lg"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
      </div>
    </div>
  );
};
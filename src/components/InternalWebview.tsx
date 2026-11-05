import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, ExternalLink, Globe, Lock, ShieldAlert } from 'lucide-react';

interface InternalWebviewProps {
  title: string;
  url: string;
  onBack: () => void;
}

export const InternalWebview: React.FC<InternalWebviewProps> = ({
  title,
  url,
  onBack,
}) => {
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-dismiss loading overlay within 1.5s so student is never kept waiting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [key]);

  // Ensure url has https://
  const formattedUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#070a10] text-white overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Top Browser Bar */}
      <div className="px-3 py-2.5 bg-[#0e1422] border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            title="Back to GB Study"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white truncate max-w-[140px] sm:max-w-xs">
              {title}
            </span>
          </div>
        </div>

        {/* URL Pill */}
        <div className="flex-1 max-w-xs px-3 py-1 rounded-full bg-[#162035] border border-slate-700/60 flex items-center gap-1.5 text-xs text-slate-300 truncate">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate font-mono text-[11px]">{formattedUrl}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsLoading(true);
              setKey((prev) => prev + 1);
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reload"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <a
            href={formattedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 transition-colors cursor-pointer"
            title="Open in external browser"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="w-full h-1 bg-slate-800 overflow-hidden">
          <div className="h-full bg-sky-400 animate-pulse w-3/4" />
        </div>
      )}

      {/* Iframe View */}
      <div className="flex-1 relative bg-[#0a0f1d]">
        {/* Subtle loading indicator on top while iframe initializes */}

        <iframe
          key={key}
          src={formattedUrl}
          title={title}
          className="w-full h-full border-none bg-white"
          onLoad={() => setIsLoading(false)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />

        {/* Notice for sites with X-Frame-Options blocking */}
        <div className="absolute bottom-2 inset-x-2 pointer-events-none flex justify-center">
          <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-slate-700/80 px-3.5 py-1.5 rounded-full text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
            <span>Website block hone par bahar kholein:</span>
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>New Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

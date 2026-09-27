import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (Component as any) {
  state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EBF5F0] dark:bg-[#061E1B] text-[#0D3B36] dark:text-slate-100 flex items-center justify-center p-4 font-['Outfit']">
          <div className="max-w-md w-full bg-white dark:bg-[#092825] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto border border-amber-400/40">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="font-black text-xl text-[#0D3B36] dark:text-amber-300 uppercase tracking-tight">
              Atelier Display Recovered
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Tailor Pro encountered a temporary display issue. All your client data, measurements, and records are safely preserved.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#0D3B36] dark:bg-amber-400 text-white dark:text-[#0D3B36] font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Atelier</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

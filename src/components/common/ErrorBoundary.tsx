import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.pathname = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans antialiased text-slate-800">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                MindFlow encountered an unexpected error. Your mind maps and notes are safely preserved in local storage and cloud sync.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="text-left bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs font-mono overflow-x-auto max-h-32 border border-slate-800 selection:bg-rose-500 selection:text-white">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Error Diagnostics:</span>
                </div>
                <div className="break-all">{this.state.error.message}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Need assistance? Contact support at{' '}
              <a href="mailto:starcybercafe097@gmail.com" className="text-indigo-600 hover:underline">
                starcybercafe097@gmail.com
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

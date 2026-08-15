import React, { ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Portal Error caught:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('files_manager_token');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleResetSession = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#E8E2F7] via-[#DFD7F5] to-[#D5CAFA] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-md bg-[#FCFBF8] rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#F0ECE1] text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Portal Encountered an Issue
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Your browser or mobile session encountered a temporary display issue.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#8364ED] to-[#7150EA] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Portal</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetSession}
                className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-[#E0DBCF] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#8364ED]" />
                <span>Reset Session & Return to Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

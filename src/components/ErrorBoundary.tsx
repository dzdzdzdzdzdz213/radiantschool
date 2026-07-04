import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * React error boundary that catches render errors and shows a fallback UI
 * with retry, go-back, and go-home actions. Delegates to a class-based
 * inner component for `componentDidCatch` support.
 */
export function ErrorBoundary({ children, fallback, onError }: Props) {
  try {
    return <ErrorBoundaryInner fallback={fallback} onError={onError}>{children}</ErrorBoundaryInner>;
  } catch {
    return null;
  }
}

interface InnerProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface InnerState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<InnerProps, InnerState> {
  constructor(props: InnerProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): InnerState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onRetry={() => {
            this.setState({ hasError: false, error: null });
            window.location.reload();
          }}
          onGoBack={() => {
            this.setState({ hasError: false, error: null });
            window.history.back();
          }}
          onGoHome={() => {
            this.setState({ hasError: false, error: null });
            window.location.href = '/';
          }}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorBoundaryFallback({ error, onRetry, onGoBack, onGoHome }: {
  error: Error | null;
  onRetry: () => void;
  onGoBack: () => void;
  onGoHome: () => void;
}) {
  const { lang } = useLang();

  return (
    <div className="flex items-center justify-center p-12">
      <div className="rounded-2xl border border-border bg-card p-8 max-w-md w-full text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold">{t('errors.unknown', lang)}</h2>
        <p className="text-sm text-muted-foreground">
          {error?.message || t('errors.unknown', lang)}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {t('errors.retry', lang)}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onGoBack}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('errors.go_back', lang)}
            </button>
            <button
              onClick={onGoHome}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors flex-1"
            >
              <Home className="h-4 w-4" />
              {t('errors.go_home', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

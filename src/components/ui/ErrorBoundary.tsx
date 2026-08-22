import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) { return { error }; }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (error.message?.includes('dynamically imported') || error.message?.includes('Loading chunk')) {
      window.location.reload();
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
        <p className="text-muted-foreground text-sm max-w-md">{this.state.error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Recharger la page
        </button>
      </div>
    );
  }
}

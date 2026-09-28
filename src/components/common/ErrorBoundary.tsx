import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[320px] w-full flex flex-col items-center justify-center p-space-xl text-center bg-surface-container-low rounded-xl">
          <span className="material-symbols-outlined text-[48px] text-error mb-space-sm">error</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
            Something went wrong
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-space-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-space-lg py-space-sm bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-container transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

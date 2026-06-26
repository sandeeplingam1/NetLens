import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="error-boundary-fallback">
          <AlertTriangle size={24} strokeWidth={1.5} />
          <p>Something went wrong</p>
          <code className="font-mono">{this.state.error?.message}</code>
          <button className="btn-secondary" onClick={this.handleRetry}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

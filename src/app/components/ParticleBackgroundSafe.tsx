import { Component, ReactNode } from 'react';
import { ParticleBackground } from './ParticleBackground';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary specifically for ParticleBackground
 * If particles fail to render, just show nothing (graceful degradation)
 */
export class ParticleBackgroundSafe extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('⚠️ ParticleBackground failed to render (non-critical):', error.message);
  }

  render() {
    if (this.state.hasError) {
      // Fail silently - particle background is decorative
      return null;
    }

    return <ParticleBackground />;
  }
}

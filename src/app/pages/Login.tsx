import { SignIn } from '@clerk/clerk-react';
import { ParticleBackgroundSafe } from '../components/ParticleBackgroundSafe';

export function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackgroundSafe />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
            Lynqio
          </h1>
          <p className="text-muted-foreground">
            LinkedIn automation for recruiters
          </p>
        </div>

        <div className="glass-card p-8 !border-0 shadow-2xl">
          <SignIn 
            path="/login"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/"
            forceRedirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}
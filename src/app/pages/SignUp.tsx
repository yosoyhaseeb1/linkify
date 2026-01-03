import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { ParticleBackgroundSafe } from '../components/ParticleBackgroundSafe';

export function SignUp() {
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
          <ClerkSignUp 
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-2xl font-semibold text-foreground',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton: 'bg-white hover:bg-gray-50 text-gray-900 border-0',
                socialButtonsBlockButtonText: 'font-medium',
                formButtonPrimary: 'bg-primary hover:bg-primary-hover text-primary-foreground',
                formFieldInput: 'bg-input-background border-border text-foreground focus:ring-primary/50',
                formFieldLabel: 'text-foreground',
                footerActionLink: 'text-primary hover:text-primary-hover',
                identityPreviewText: 'text-foreground',
                identityPreviewEditButton: 'text-primary hover:text-primary-hover',
                formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground',
                otpCodeFieldInput: 'bg-input-background border-border text-foreground',
                formResendCodeLink: 'text-primary hover:text-primary-hover',
                footer: 'bg-transparent',
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/login"
            afterSignUpUrl="/"
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}
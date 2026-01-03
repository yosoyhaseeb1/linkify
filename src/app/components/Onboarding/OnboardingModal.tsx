import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Rocket, Target, Users, Zap, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

/**
 * OnboardingModal - Multi-step onboarding flow for new users
 * 
 * A guided tour that walks users through the key features of Lynqio,
 * helping them understand how to use the platform effectively.
 * 
 * Features:
 * - 5-step guided tour
 * - Progress indicators
 * - Skip functionality
 * - Keyboard navigation (Escape to close, Arrow keys to navigate)
 * - WCAG 2.1 Level AA compliant
 * - Mobile responsive
 * - Smooth animations
 * 
 * @param {Object} props
 * @param {Function} props.onComplete - Callback when onboarding is completed
 * @param {Function} props.onSkip - Callback when user skips onboarding
 * 
 * @example
 * <OnboardingModal 
 *   onComplete={() => console.log('Completed!')}
 *   onSkip={() => console.log('Skipped')}
 * />
 */

interface OnboardingModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to Lynqio! 👋",
      description: "Your LinkedIn outreach command center",
      icon: <Rocket className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground/80">
            Lynqio automates your LinkedIn recruitment workflow from start to finish. 
            Find decision makers, draft personalized messages, and manage your entire 
            outreach pipeline in one place.
          </p>
          <p className="text-foreground/80">
            Let's get you set up in just 2 minutes!
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-primary">
              💡 <strong>Pro tip:</strong> You can restart this tour anytime from Settings
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Create Your First Run",
      description: "Turn job posts into qualified prospects",
      icon: <Target className="w-12 h-12 text-cyan-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground/80">
            A <strong className="text-primary">Run</strong> is where the magic happens. 
            Paste a LinkedIn job URL, and Lynqio will:
          </p>
          <ul className="space-y-2 text-foreground/80">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Find the top 3 decision makers for that role</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Generate personalized outreach messages</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Create HeyReach campaigns automatically</span>
            </li>
          </ul>
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
            <p className="text-sm text-cyan-400">
              🎯 Click "New Run" in the sidebar to get started!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Pipeline Overview",
      description: "Track every prospect from invite to signed mandate",
      icon: <Target className="w-12 h-12 text-emerald-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground/80">
            Your <strong className="text-primary">Pipeline</strong> is a drag-and-drop 
            kanban board that shows where every prospect stands in your recruitment process.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background-lighter border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Stage 1</div>
              <div className="font-medium text-sm">Invite Sent</div>
            </div>
            <div className="bg-background-lighter border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Stage 2</div>
              <div className="font-medium text-sm">Connected</div>
            </div>
            <div className="bg-background-lighter border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Stage 3</div>
              <div className="font-medium text-sm">Conversation</div>
            </div>
            <div className="bg-background-lighter border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Stage 4</div>
              <div className="font-medium text-sm">Signed! 🎉</div>
            </div>
          </div>
          <p className="text-foreground/80 text-sm">
            Simply drag prospects between stages as your outreach progresses.
          </p>
        </div>
      )
    },
    {
      id: 4,
      title: "Team Collaboration",
      description: "Work together, win together",
      icon: <Users className="w-12 h-12 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground/80">
            Lynqio is built for teams. Invite your colleagues to collaborate on 
            outreach campaigns, share prospects, and track team performance.
          </p>
          <ul className="space-y-2 text-foreground/80">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Prevent duplicate outreach with job claims</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>See team performance analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Share company blacklists and target accounts</span>
            </li>
          </ul>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-sm text-purple-400">
              👥 Go to Team settings to invite members
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Integrations",
      description: "Connect your tools for seamless automation",
      icon: <Zap className="w-12 h-12 text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground/80">
            Connect Lynqio with your favorite tools to supercharge your workflow:
          </p>
          <div className="space-y-3">
            <div className="bg-background-lighter border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">HeyReach</div>
                  <div className="text-xs text-muted-foreground">LinkedIn automation</div>
                </div>
              </div>
              <p className="text-sm text-foreground/70">
                Automatically create campaigns and send connection requests
              </p>
            </div>
            <div className="bg-background-lighter border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="font-medium">Apollo.io</div>
                  <div className="text-xs text-muted-foreground">Contact enrichment</div>
                </div>
              </div>
              <p className="text-sm text-foreground/70">
                Find decision makers and their contact information
              </p>
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-400">
              ⚡ Configure integrations in Settings → Integrations
            </p>
          </div>
        </div>
      )
    }
  ];

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      } else if (e.key === 'ArrowRight' && !isLastStep) {
        nextStep();
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        previousStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isFirstStep, isLastStep]);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl"
      >
        <div className="glass-card p-6 sm:p-8 border-primary/20 shadow-2xl">
          {/* Close/Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors group"
            aria-label="Skip onboarding"
          >
            <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-white/20'
                }`}
                aria-label={`Go to step ${index + 1}`}
                aria-current={index === currentStep ? 'step' : undefined}
              />
            ))}
          </div>

          {/* Step counter */}
          <div className="text-center mb-6">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          {/* Content with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px] flex flex-col"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="w-20 h-20 bg-background-lighter rounded-2xl flex items-center justify-center border border-border"
                >
                  {currentStepData.icon}
                </motion.div>
              </div>

              {/* Title */}
              <h2 
                id="onboarding-title"
                className="text-2xl sm:text-3xl font-bold text-center mb-3"
              >
                {currentStepData.title}
              </h2>

              {/* Description */}
              <p 
                id="onboarding-description"
                className="text-center text-muted-foreground mb-8"
              >
                {currentStepData.description}
              </p>

              {/* Step content */}
              <div className="flex-1 mb-8">
                {currentStepData.content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={previousStep}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
                  aria-label="Previous step"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              {!isLastStep && (
                <button
                  onClick={onSkip}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Skip onboarding tour"
                >
                  Skip Tour
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {isLastStep ? (
                <button
                  onClick={handleComplete}
                  className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-black font-semibold transition-colors flex items-center gap-2"
                  aria-label="Finish onboarding"
                >
                  <span>Finish Setup</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-black font-semibold transition-colors flex items-center gap-2"
                  aria-label="Next step"
                >
                  <span>{isFirstStep ? "Let's Go!" : "Next"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">Esc</kbd> to skip
            {!isLastStep && (
              <>
                {' · '}
                <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">→</kbd> next
              </>
            )}
            {!isFirstStep && (
              <>
                {' · '}
                <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">←</kbd> back
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

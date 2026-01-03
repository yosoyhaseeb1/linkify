import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureLockedBannerProps {
  featureName: string;
  description: string;
  requiredPlan: 'Pro' | 'Enterprise';
  comingSoon?: boolean;
}

export function FeatureLockedBanner({ 
  featureName, 
  description, 
  requiredPlan,
  comingSoon = false
}: FeatureLockedBannerProps) {
  return (
    <div className="glass-card p-6 rounded-xl border-l-4 border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {comingSoon ? (
              <Sparkles className="w-5 h-5 text-primary" />
            ) : (
              <Lock className="w-5 h-5 text-primary" />
            )}
            <h3>{featureName}</h3>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
              {requiredPlan}
            </span>
            {comingSoon && (
              <span className="px-2 py-1 bg-warning/10 text-warning rounded text-xs">
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          {!comingSoon && (
            <Link
              to="/billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02] text-sm"
            >
              Upgrade to {requiredPlan}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {comingSoon && (
            <p className="text-xs text-muted-foreground">
              This feature is currently in development and will be available in Q1 2026.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface FeatureUpgradePromptProps {
  featureName: string;
  requiredPlan: 'Pro' | 'Enterprise';
}

export function FeatureUpgradePrompt({ featureName, requiredPlan }: FeatureUpgradePromptProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
      <Lock className="w-3 h-3" />
      <span>{requiredPlan}</span>
    </div>
  );
}
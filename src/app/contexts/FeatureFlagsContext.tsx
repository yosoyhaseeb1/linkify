import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FeatureFlags {
  // Tier 1: Core Intelligence
  aiCandidateMatching: boolean;
  multiJobIntelligence: boolean;
  competitiveIntelligence: boolean;

  // Tier 2: Analytics
  campaignPerformanceDashboard: boolean;
  prospectEngagementTracking: boolean;
  abMessageTesting: boolean;

  // Tier 3: Multi-Channel
  multiChannelSequencing: boolean;
  atsIntegration: boolean;

  // Tier 4: Personalization (already covered in backend)
  dynamicPersonalization: boolean;
  industryTemplates: boolean;

  // Tier 5: Compliance
  linkedinSafetyAI: boolean;
  optOutManagement: boolean;

  // Tier 6: Team Collaboration
  teamPlaybooks: boolean;
  clientPortal: boolean;

  // Tier 7: Advanced Automation
  smartCampaignOrchestration: boolean;
  jobPostMonitoring: boolean;

  // Tier 8: Enterprise
  dedicatedSuccessManager: boolean;
  customAITraining: boolean;
}

interface FeatureFlagsContextType {
  features: FeatureFlags;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
  enableFeature: (feature: keyof FeatureFlags) => void;
  disableFeature: (feature: keyof FeatureFlags) => void;
  getPlanFeatures: (plan: 'Pilot' | 'Pro' | 'Enterprise') => (keyof FeatureFlags)[];
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  // Default feature flags - can be toggled per organization/plan
  const [features, setFeatures] = useState<FeatureFlags>({
    // Pilot features (basic)
    dynamicPersonalization: true,
    linkedinSafetyAI: true,

    // Pro features
    multiJobIntelligence: false, // Backend ready, UI coming soon
    competitiveIntelligence: false, // Backend ready, UI coming soon
    campaignPerformanceDashboard: false, // Coming Q1 2026
    prospectEngagementTracking: false, // Coming Q1 2026
    abMessageTesting: false, // Coming Q1 2026
    multiChannelSequencing: true, // Backend ready, UI simplified for launch
    industryTemplates: true,
    optOutManagement: true,
    teamPlaybooks: false, // Coming Q1 2026
    smartCampaignOrchestration: false, // Coming Q1 2026
    jobPostMonitoring: false, // Coming Q1 2026

    // Enterprise features
    atsIntegration: false, // Coming Q1 2026
    clientPortal: false, // Coming Q2 2026
    dedicatedSuccessManager: false, // Manual setup
    customAITraining: false // Manual setup
  });

  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    return features[feature];
  };

  const enableFeature = (feature: keyof FeatureFlags) => {
    setFeatures(prev => ({ ...prev, [feature]: true }));
  };

  const disableFeature = (feature: keyof FeatureFlags) => {
    setFeatures(prev => ({ ...prev, [feature]: false }));
  };

  const getPlanFeatures = (plan: 'Pilot' | 'Pro' | 'Enterprise'): (keyof FeatureFlags)[] => {
    const pilotFeatures: (keyof FeatureFlags)[] = [
      'dynamicPersonalization',
      'linkedinSafetyAI',
      'industryTemplates',
      'optOutManagement'
    ];

    const proFeatures: (keyof FeatureFlags)[] = [
      ...pilotFeatures,
      'multiJobIntelligence',
      'competitiveIntelligence',
      'campaignPerformanceDashboard',
      'prospectEngagementTracking',
      'abMessageTesting',
      'multiChannelSequencing',
      'teamPlaybooks',
      'smartCampaignOrchestration',
      'jobPostMonitoring'
    ];

    const enterpriseFeatures: (keyof FeatureFlags)[] = [
      ...proFeatures,
      'atsIntegration',
      'clientPortal',
      'dedicatedSuccessManager',
      'customAITraining'
    ];

    switch (plan) {
      case 'Pilot':
        return pilotFeatures;
      case 'Pro':
        return proFeatures;
      case 'Enterprise':
        return enterpriseFeatures;
      default:
        return pilotFeatures;
    }
  };

  return (
    <FeatureFlagsContext.Provider
      value={{
        features,
        isFeatureEnabled,
        enableFeature,
        disableFeature,
        getPlanFeatures
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}

// Helper hook to check if user has access to a feature based on their plan
export function useHasFeature(feature: keyof FeatureFlags) {
  const { isFeatureEnabled, getPlanFeatures } = useFeatureFlags();
  // In production, this would also check the user's current plan
  return isFeatureEnabled(feature);
}
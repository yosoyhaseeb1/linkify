import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Download, ExternalLink, CheckCircle, Sparkles, Zap, Crown, TrendingUp, ArrowRight, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';

export function Billing() {
  const { currentOrg, usage } = useOrganization();
  const [showPricingComparison, setShowPricingComparison] = useState(true);
  const [loading, setLoading] = useState(false); // Changed to false
  const [isPilotPricing, setIsPilotPricing] = useState(true);

  // Use real usage data from OrganizationContext

  // Removed artificial delay
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);
  //   return () => clearTimeout(timer);
  // }, []);

  const handleManageSubscription = () => {
    toast.success('Opening Stripe billing portal...');
    window.open('https://billing.stripe.com/p/login/test', '_blank');
  };

  const handleUpgrade = (plan: string) => {
    toast.success(`Upgrading to ${plan} plan...`);
  };

  // New comprehensive pricing table with generous limits
  const comprehensivePricing = [
    {
      name: 'Starter',
      description: 'For small recruiting teams',
      icon: Zap,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      regularPrice: 599,
      pilotPrice: 299,
      seats: 3,
      runs: 750,
      contacts: 2000,
      features: [
        '750 runs per month',
        '2,000 contacts in CRM',
        '3 team seats included',
        'LinkedIn automation',
        'Full in-house CRM',
        'Automation Tools Integrations',
        'LinkedIn safety & rate limiting',
        'Email support'
      ]
    },
    {
      name: 'Professional',
      description: 'For growing recruiting teams',
      icon: Sparkles,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      popular: true,
      regularPrice: 899,
      pilotPrice: 449,
      seats: 5,
      runs: 1250,
      contacts: 5000,
      features: [
        '1,250 runs per month',
        '5,000 contacts in CRM',
        '5 team seats included',
        'Everything in Starter, plus:',
        'Multi-channel sequencing',
        'Advanced analytics',
        'Priority support',
        'Dedicated onboarding'
      ]
    },
    {
      name: 'Growth',
      description: 'For established agencies',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      regularPrice: 1599,
      pilotPrice: 799,
      seats: 10,
      runs: 2500,
      contacts: 10000,
      features: [
        '2,500 runs per month',
        '10,000 contacts in CRM',
        '10 team seats included',
        'Everything in Professional, plus:',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced team collaboration',
        'White-glove support'
      ]
    }
  ];

  const pricingTiers = {
    Pilot: {
      name: 'Pilot',
      price: '€500',
      description: 'Perfect for solo recruiters getting started',
      icon: Zap,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      regularPrice: 599,
      pilotPrice: 299,
      features: [
        'Up to 50 runs per month',
        'Up to 500 prospects per month',
        '2 team seats',
        'LinkedIn automation',
        'HeyReach & Apollo integration',
        'Basic message templates',
        'Email support',
        'Run history & tracking'
      ]
    },
    Pro: {
      name: 'Pro',
      price: '€1,000',
      description: 'For growing teams and agencies',
      icon: Sparkles,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      popular: true,
      regularPrice: 899,
      pilotPrice: 449,
      features: [
        'Up to 100 runs per month',
        'Up to 1,000 prospects per month',
        '5 team seats',
        'Everything in Pilot, plus:',
        'AI-powered candidate matching scores',
        'Campaign performance analytics',
        'Multi-channel sequencing (email + LinkedIn)',
        'Dynamic message personalization',
        'LinkedIn safety & rate limiting',
        'Priority support',
        'Advanced reporting'
      ]
    },
    Enterprise: {
      name: 'Enterprise',
      price: '€2,500',
      description: 'For large teams with custom needs',
      icon: Crown,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      regularPrice: 1599,
      pilotPrice: 799,
      features: [
        'Unlimited runs',
        'Unlimited prospects',
        'Unlimited team seats',
        'Everything in Pro, plus:',
        'ATS integration (Greenhouse, Lever, Bullhorn)',
        'White-label client portal',
        'Custom AI training on your data',
        'Dedicated success manager',
        'Custom SLA',
        '99.9% uptime guarantee',
        'API access',
        'Advanced security & compliance'
      ]
    }
  };

  // Helper function to get current plan pricing
  const getCurrentPlanPrice = () => {
    const planName = currentOrg?.plan || 'Pilot';
    const planTier = pricingTiers[planName];
    if (!planTier) return '€0';
    
    // Use pilot pricing by default (since user is on pilot)
    const price = isPilotPricing ? planTier.pilotPrice : planTier.regularPrice;
    return `€${price}`;
  };

  const comingSoonFeatures = [
    { name: 'Multi-job intelligence', tier: 'Pro', description: 'Analyze multiple similar roles at once' },
    { name: 'Competitive intelligence', tier: 'Pro', description: 'See which prospects are oversaturated' },
    { name: 'Prospect engagement tracking', tier: 'Pro', description: 'Track profile views and engagement' },
    { name: 'A/B message testing', tier: 'Pro', description: 'Automatically optimize message performance' },
    { name: 'Custom integrations', tier: 'Enterprise', description: 'Connect to your internal tools' }
  ];

  const featureMatrix = [
    {
      category: 'Core Features',
      features: [
        { name: 'Runs per month', pilot: '50', pro: '100', enterprise: 'Unlimited', available: true },
        { name: 'Prospects per month', pilot: '500', pro: '1,000', enterprise: 'Unlimited', available: true },
        { name: 'Team seats', pilot: '2', pro: '5', enterprise: 'Unlimited', available: true },
        { name: 'LinkedIn automation', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'HeyReach & Apollo integration', pilot: true, pro: true, enterprise: true, available: true },
      ]
    },
    {
      category: 'AI & Intelligence',
      features: [
        { name: 'Dynamic message personalization', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'AI candidate matching scores', pilot: false, pro: true, enterprise: true, available: false, comingSoon: 'Q1 2026', backendReady: true },
        { name: 'Multi-job intelligence', pilot: false, pro: true, enterprise: true, available: false, comingSoon: 'Q1 2026', backendReady: true },
        { name: 'Competitive intelligence', pilot: false, pro: true, enterprise: true, available: false, comingSoon: 'Q1 2026', backendReady: true },
        { name: 'Custom AI training', pilot: false, pro: false, enterprise: true, available: false, comingSoon: 'Q2 2026' },
      ]
    },
    {
      category: 'Analytics & Optimization',
      features: [
        { name: 'Basic reporting', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'Campaign performance dashboard', pilot: false, pro: true, enterprise: true, available: false, comingSoon: 'Q1 2026' },
        { name: 'Prospect engagement tracking', pilot: false, pro: true, enterprise: true, available: false, comingSoon: 'Q1 2026' },
        { name: 'A/B message testing', pilot: false, pro: true, enterprise: true, available: false, comingSoon: 'Q1 2026' },
        { name: 'ROI calculator', pilot: false, pro: true, enterprise: true, available: false, comingSoon: 'Q2 2026' },
      ]
    },
    {
      category: 'Multi-Channel',
      features: [
        { name: 'LinkedIn outreach', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'Email sequencing', pilot: false, pro: true, enterprise: true, available: true, backendReady: true, note: 'Backend ready' },
        { name: 'Multi-channel orchestration', pilot: false, pro: true, enterprise: true, available: false, comingSoon: 'Q1 2026' },
      ]
    },
    {
      category: 'Integrations',
      features: [
        { name: 'HeyReach integration', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'Apollo integration', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'ATS integration', pilot: false, pro: false, enterprise: true, available: false, comingSoon: 'Q2 2026' },
        { name: 'API access', pilot: false, pro: false, enterprise: true, available: false, comingSoon: 'Q2 2026' },
        { name: 'Custom integrations', pilot: false, pro: false, enterprise: true, available: false },
      ]
    },
    {
      category: 'Compliance & Safety',
      features: [
        { name: 'LinkedIn safety & rate limiting', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'Opt-out management', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'GDPR compliance', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'Custom SLA', pilot: false, pro: false, enterprise: true, available: true },
        { name: '99.9% uptime guarantee', pilot: false, pro: false, enterprise: true, available: true },
      ]
    },
    {
      category: 'Support & Services',
      features: [
        { name: 'Email support', pilot: true, pro: true, enterprise: true, available: true },
        { name: 'Priority support', pilot: false, pro: true, enterprise: true, available: true },
        { name: 'Dedicated success manager', pilot: false, pro: false, enterprise: true, available: true },
        { name: 'White-label client portal', pilot: false, pro: false, enterprise: true, available: false, comingSoon: 'Q2 2026' },
      ]
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const renderFeatureCell = (value: boolean | string, available: boolean) => {
    if (typeof value === 'string') {
      return <span className="text-sm">{value}</span>;
    }
    if (!available) {
      return (
        <div className="flex items-center justify-center">
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
      );
    }
    return value ? (
      <div className="flex items-center justify-center">
        <Check className="w-4 h-4 text-success" />
      </div>
    ) : (
      <div className="flex items-center justify-center">
        <X className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl">Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Current Plan */}
      <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-xl mb-6 sm:mb-8">
        {loading ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="w-32 h-8" />
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
                <Skeleton className="w-48 h-4" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Skeleton className="w-full sm:w-32 h-11 rounded-lg" />
                <Skeleton className="w-full sm:w-48 h-11 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="w-24 h-4 mb-2" />
                  <Skeleton className="w-32 h-9" />
                </div>
              ))}
            </div>

            <div className="p-4 bg-accent/20 rounded-lg">
              <Skeleton className="w-40 h-5 mb-3" />
              <div className="grid grid-cols-1 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="w-full h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Title and Status */}
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                  <h2>{currentOrg?.plan} Plan</h2>
                  <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm whitespace-nowrap">
                    Active
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {currentOrg?.seats} seats • Renews monthly
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowPricingComparison(!showPricingComparison)}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-secondary/80 hover:scale-[1.02] text-sm sm:text-base"
                >
                  <TrendingUp className="w-4 h-4" />
                  {showPricingComparison ? 'Hide' : 'Compare'} Plans
                </button>
                <button
                  onClick={handleManageSubscription}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02] text-sm sm:text-base"
                >
                  <ExternalLink className="w-4 h-4" />
                  Manage Subscription
                </button>
              </div>
            </div>

            {/* Billing Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plan Price</p>
                <p className="text-2xl sm:text-3xl font-semibold">
                  {getCurrentPlanPrice()}
                  <span className="text-sm text-muted-foreground font-normal">/month</span>
                </p>
                {isPilotPricing && (
                  <p className="text-xs text-success mt-1">
                    🎉 Pilot pricing - 50% off for life!
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Billing Period</p>
                <p className="text-2xl sm:text-3xl font-semibold">Monthly</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Next Billing Date</p>
                <p className="text-2xl sm:text-3xl font-semibold">Jan 1</p>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-6 p-4 bg-accent/20 rounded-lg">
              <h4 className="mb-3">Current Plan Features</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pricingTiers[currentOrg?.plan || 'Pilot'].features.slice(0, 8).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Payment Method */}
      <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-xl mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2>Payment Method</h2>
          <button
            onClick={handleManageSubscription}
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            Update
          </button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="font-medium">•••• •••• •••• 4242</p>
            <p className="text-sm text-muted-foreground">Expires 12/2025</p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-xl mb-6 sm:mb-8">
        <h2 className="mb-6">Usage This Month</h2>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span>Runs</span>
              <span className="text-sm text-muted-foreground">
                {usage.runsUsed} / {usage.runsLimit}
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(usage.runsUsed / usage.runsLimit) * 100}%` }}
              />
            </div>
            {usage.runsUsed / usage.runsLimit > 0.8 && (
              <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  <strong>You're using {Math.round((usage.runsUsed / usage.runsLimit) * 100)}% of your monthly runs.</strong> Consider upgrading to {currentOrg?.plan === 'Pilot' ? 'Pro' : 'Enterprise'} for {currentOrg?.plan === 'Pilot' ? '2x more capacity' : 'unlimited runs'}.
                </p>
                <button
                  onClick={() => handleUpgrade(currentOrg?.plan === 'Pilot' ? 'Pro' : 'Enterprise')}
                  className="mt-2 text-sm text-warning hover:underline flex items-center gap-1"
                >
                  Upgrade now
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span>Prospects Generated</span>
              <span className="text-sm text-muted-foreground">
                {usage.prospectsUsed} / {usage.prospectsLimit}
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-chart-2 transition-all"
                style={{ width: `${(usage.prospectsUsed / usage.prospectsLimit) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span>Team Seats</span>
              <span className="text-sm text-muted-foreground">
                {currentOrg?.usedSeats} / {currentOrg?.seats}
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-chart-4 transition-all"
                style={{
                  width: `${((currentOrg?.usedSeats || 0) / (currentOrg?.seats || 1)) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-info/5 border border-info/20 rounded-lg">
          <p className="text-sm">
            <strong>Usage resets on {formatDate(usage.resetDate)}</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Your usage limits will be refreshed at the start of your next billing period.
          </p>
        </div>
      </div>

      {/* Billing History */}
      <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-xl mb-6 sm:mb-8">
        <h2 className="mb-6">Billing History</h2>
        <div className="space-y-3">
          {[
            { id: 'inv-001', date: '2024-12-01', amount: '€1,000', status: 'Paid' },
            { id: 'inv-002', date: '2024-11-01', amount: '€1,000', status: 'Paid' },
            { id: 'inv-003', date: '2024-10-01', amount: '€1,000', status: 'Paid' }
          ].map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">Invoice {invoice.id}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(invoice.date)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">{invoice.amount}</p>
                  <p className="text-sm text-success">{invoice.status}</p>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Comparison */}
      {showPricingComparison && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2>Compare Plans</h2>
          </div>

          {/* New Comprehensive Pricing Table with Pilot/Regular Toggle */}
          <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-xl mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="mb-2 text-xl sm:text-2xl">Updated Pricing - Generous Limits</h2>
                <p className="text-sm text-muted-foreground">
                  Choose the plan that fits your recruiting needs
                </p>
              </div>
              
              {/* Pilot/Regular Toggle */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-muted/30 rounded-lg">
                  <button
                    onClick={() => setIsPilotPricing(false)}
                    className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !isPilotPricing
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Regular
                  </button>
                  <button
                    onClick={() => setIsPilotPricing(true)}
                    className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isPilotPricing
                        ? 'bg-success text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Pilot (50% OFF)</span>
                    <span className="sm:hidden">50% OFF</span>
                  </button>
                </div>
              </div>
            </div>

            {isPilotPricing && (
              <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm text-success">
                  <strong>🎉 Pilot Pricing - 50% Off For Life!</strong> Early adopters get permanent pricing at half the regular rate. This discount never expires.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {comprehensivePricing.map((plan) => {
                const Icon = plan.icon;
                const displayPrice = isPilotPricing ? plan.pilotPrice : plan.regularPrice;
                const isEnterprise = plan.name === 'Enterprise';
                
                return (
                  <div
                    key={plan.name}
                    className={`glass-card rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
                      plan.popular ? 'ring-2 ring-primary -mt-4 max-lg:mt-0' : 'mt-0'
                    }`}
                  >
                    {plan.popular ? (
                      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-medium">
                        Most Popular
                      </div>
                    ) : (
                      <div className="py-2 text-xs font-medium invisible">
                        Placeholder
                      </div>
                    )}
                    <div className={`p-5 ${plan.popular ? 'mt-4' : ''}`}>
                      <div className={`w-10 h-10 rounded-lg ${plan.bgColor} flex items-center justify-center mb-3`}>
                        <Icon className={`w-5 h-5 ${plan.color}`} />
                      </div>
                      <h3 className="text-lg mb-1">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">{plan.description}</p>
                      
                      <div className="mb-4">
                        {isEnterprise ? (
                          <div>
                            <span className="text-2xl font-bold">Custom</span>
                            <p className="text-xs text-muted-foreground mt-1">Contact sales</p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold">€{displayPrice}</span>
                              <span className="text-xs text-muted-foreground">/mo</span>
                            </div>
                            {isPilotPricing && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground line-through">€{plan.regularPrice}</span>
                                <span className="text-xs text-success font-medium">Save €{plan.regularPrice && displayPrice ? plan.regularPrice - displayPrice : 0}/mo</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 mb-4 py-3 border-y border-border/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Runs/month:</span>
                          <span className="font-semibold">{typeof plan.runs === 'number' ? plan.runs.toLocaleString() : plan.runs}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Contacts:</span>
                          <span className="font-semibold">{typeof plan.contacts === 'number' ? plan.contacts.toLocaleString() : plan.contacts}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Seats:</span>
                          <span className="font-semibold">{plan.seats}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpgrade(plan.name)}
                        className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] ${
                          plan.popular
                            ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {isEnterprise ? 'Contact Sales' : 'Choose Plan'}
                      </button>

                      <ul className="mt-4 space-y-2">
                        {plan.features.slice(0, 6).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs">
                            {feature.includes('Everything in') ? (
                              <span className="text-muted-foreground font-medium pt-0.5">{feature}</span>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{feature}</span>
                              </>
                            )}
                          </li>
                        ))}
                        {plan.features.length > 6 && (
                          <li className="text-xs text-primary font-medium pt-1">
                            + {plan.features.length - 6} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Notes */}
            <div className="mt-6 p-4 bg-info/5 border border-info/20 rounded-lg">
              <h4 className="text-sm font-medium mb-2">💡 Understanding "Runs"</h4>
              <p className="text-sm text-muted-foreground">
                <strong>1 run = finding 1 decision maker</strong> for a job post. With 300 runs/month on Starter, you can work on 10-15 active jobs and find 20-30 decision makers for each. Perfect for active recruiters who need comprehensive coverage.
              </p>
            </div>
          </div>
          
          {/* Coming Soon Features */}
          <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2>Roadmap Highlights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comingSoonFeatures.map((feature, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{feature.name}</h4>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                      {feature.tier}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-info/5 border border-info/20 rounded-lg">
              <p className="text-sm">
                <strong>Backend infrastructure ready for Q1 2026 features</strong> - AI matching, multi-job intelligence, and competitive analysis are already built and will be available in your dashboard soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
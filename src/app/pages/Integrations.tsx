import { CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Integrations() {
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [syncingIntegrations, setSyncingIntegrations] = useState<string[]>([]);
  const [integrations, setIntegrations] = useState([
    {
      id: 'heyreach',
      name: 'HeyReach',
      description: 'LinkedIn automation platform for sending connection requests and messages',
      connected: true,
      workspace: 'Acme Recruiting Team',
      connectedAt: '2024-11-15T10:30:00',
      lastSynced: '2024-12-25T08:15:00',
      logo: 'https://i.imgur.com/7HnJk1v.png',
      setupUrl: 'https://heyreach.io/connect'
    },
    {
      id: 'apollo',
      name: 'Apollo',
      description: 'Sales intelligence and prospect database for finding decision makers',
      connected: true,
      workspace: 'Acme Recruiting',
      connectedAt: '2024-11-15T10:35:00',
      lastSynced: '2024-12-25T09:30:00',
      logo: 'https://i.imgur.com/eJkuRN9.png',
      setupUrl: 'https://apollo.io/connect'
    },
    {
      id: 'lemlist',
      name: 'Lemlist',
      description: 'Email outreach and automation platform for personalized cold email campaigns',
      connected: false,
      workspace: undefined,
      connectedAt: undefined,
      lastSynced: undefined,
      logo: 'https://i.imgur.com/0nQSm1a.png',
      setupUrl: 'https://lemlist.com/connect'
    }
  ]);

  useEffect(() => {
    // Simulate checking connection status
    setTimeout(() => {
      setCheckingConnection(false);
    }, 1500);
  }, []);

  const handleConnect = (id: string) => {
    toast.success(`Connecting to ${integrations.find(i => i.id === id)?.name}...`);
    setSyncingIntegrations([...syncingIntegrations, id]);
    setTimeout(() => {
      setIntegrations(integrations.map(int => 
        int.id === id 
          ? { ...int, connected: true, connectedAt: new Date().toISOString(), workspace: 'Demo Workspace', lastSynced: new Date().toISOString() }
          : int
      ));
      setSyncingIntegrations(syncingIntegrations.filter(i => i !== id));
      toast.success('Integration connected successfully');
    }, 1500);
  };

  const handleSync = (id: string) => {
    setSyncingIntegrations([...syncingIntegrations, id]);
    toast.success('Syncing integration...');
    setTimeout(() => {
      setIntegrations(integrations.map(int => 
        int.id === id 
          ? { ...int, lastSynced: new Date().toISOString() }
          : int
      ));
      setSyncingIntegrations(syncingIntegrations.filter(i => i !== id));
      toast.success('Sync completed successfully');
    }, 2000);
  };

  const handleDisconnect = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (window.confirm(`Are you sure you want to disconnect ${integration?.name}?`)) {
      setIntegrations(integrations.map(int => 
        int.id === id 
          ? { ...int, connected: false, workspace: undefined, connectedAt: undefined }
          : int
      ));
      toast.success('Integration disconnected');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatLastSynced = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return formatDate(dateString);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1>Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your tools to enable automation
        </p>
      </div>

      {/* Integration Cards */}
      <div className="space-y-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="glass-card p-6 rounded-xl">
            <div className="flex items-start gap-6">
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center text-3xl flex-shrink-0">
                <ImageWithFallback
                  src={integration.logo}
                  alt={integration.name}
                  className="w-16 h-16"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2>{integration.name}</h2>
                      {integration.connected ? (
                        <div className="flex items-center gap-1.5 text-success">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Not Connected</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>

                {integration.connected && (
                  <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Workspace</p>
                        <p className="text-sm">{integration.workspace}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Connected Since</p>
                        <p className="text-sm">{formatDate(integration.connectedAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Last Synced</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{formatLastSynced(integration.lastSynced)}</p>
                          <button
                            onClick={() => handleSync(integration.id)}
                            disabled={syncingIntegrations.includes(integration.id)}
                            className="text-primary hover:text-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Sync now"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingIntegrations.includes(integration.id) ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {integration.connected ? (
                    <>
                      <button
                        onClick={() => handleConnect(integration.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reconnect
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm"
                      >
                        Disconnect
                      </button>
                      <a
                        href={integration.setupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
                      >
                        <span>Manage Settings</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02]"
                    >
                      Connect {integration.name}
                    </button>
                  )}
                </div>

                {/* Instructions */}
                {!integration.connected && (
                  <div className="mt-4 p-4 bg-info/5 border border-info/20 rounded-lg">
                    <h4 className="text-sm mb-2">How to connect:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Click "Connect {integration.name}" above</li>
                      <li>Sign in to your {integration.name} account</li>
                      <li>Authorize the connection</li>
                      <li>Your {integration.name} account will be linked</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-6 glass-card rounded-xl border-l-4 border-info">
        <h3 className="mb-2">Why these integrations?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong>HeyReach</strong> - Executes LinkedIn outreach campaigns, sends connection requests, and manages follow-ups</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong>Apollo</strong> - Finds and enriches prospect data to identify the right decision makers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong>Lemlist</strong> - Sends personalized cold email campaigns to reach out to prospects</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
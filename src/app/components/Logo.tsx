interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { container: 'w-6 h-6', text: 'text-base', icon: 'w-3 h-3' },
    md: { container: 'w-8 h-8', text: 'text-lg', icon: 'w-4 h-4' },
    lg: { container: 'w-12 h-12', text: 'text-2xl', icon: 'w-6 h-6' }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {/* Icon - Network/Connection nodes forming "LQ" */}
      <div className={`${currentSize.container} rounded-lg bg-gradient-to-br from-primary via-primary-hover to-chart-2 flex items-center justify-center relative overflow-hidden`}>
        {/* Geometric network pattern */}
        <svg className={currentSize.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Connection nodes forming abstract "LQ" */}
          {/* L shape */}
          <circle cx="7" cy="6" r="2" fill="white" fillOpacity="0.9" />
          <circle cx="7" cy="12" r="2" fill="white" fillOpacity="0.9" />
          <circle cx="7" cy="18" r="2" fill="white" fillOpacity="0.9" />
          <circle cx="13" cy="18" r="2" fill="white" fillOpacity="0.9" />
          
          {/* Q shape */}
          <circle cx="17" cy="6" r="2" fill="white" fillOpacity="0.9" />
          <circle cx="17" cy="12" r="2" fill="white" fillOpacity="0.9" />
          <circle cx="21" cy="15" r="1.5" fill="white" fillOpacity="0.7" />
          
          {/* Connecting lines */}
          <line x1="7" y1="6" x2="7" y2="18" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="7" y1="18" x2="13" y2="18" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="17" y1="6" x2="17" y2="12" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="17" y1="12" x2="21" y2="15" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-semibold ${currentSize.text}`}>
          Lynqio
        </span>
      )}
    </div>
  );
}
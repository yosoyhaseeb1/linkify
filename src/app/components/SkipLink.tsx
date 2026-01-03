/**
 * Skip to main content link for keyboard navigation
 * Improves accessibility by allowing users to skip repetitive navigation
 */

interface SkipLinkProps {
  targetId?: string;
  text?: string;
}

export function SkipLink({ 
  targetId = 'main-content', 
  text = 'Skip to main content' 
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a 
      href={`#${targetId}`} 
      className="skip-link"
      onClick={handleClick}
    >
      {text}
    </a>
  );
}

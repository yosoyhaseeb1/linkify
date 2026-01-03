import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function ParticleBackground() {
  // Generate random particles with error handling
  const particles = useMemo<Particle[]>(() => {
    try {
      const particleCount = 60; // Total number of particles
      const particleArray = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Random x position (0-100%)
        y: Math.random() * 100, // Random y position (0-100%)
        size: Math.random() * 3 + 1, // Random size between 1-4px
        duration: Math.random() * 20 + 15, // Duration between 15-35s
        delay: Math.random() * 5, // Random delay 0-5s
        opacity: Math.random() * 0.4 + 0.1, // Opacity between 0.1-0.5
      }));
      console.log('✅ ParticleBackground: Generated', particleArray.length, 'particles');
      return particleArray;
    } catch (error) {
      console.error('❌ ParticleBackground: Error generating particles:', error);
      return [];
    }
  }, []);

  // Don't render if particles failed to generate
  if (!particles || particles.length === 0) {
    console.warn('⚠️ ParticleBackground: No particles to render');
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      
      {/* Static particles - NO ANIMATION */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: '#3cc2ff',
            opacity: particle.opacity,
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      {/* Larger glowing orbs - STATIC */}
      {[...Array(8)].map((_, i) => {
        return (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full blur-xl hidden md:block"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              background: `radial-gradient(circle, rgba(60, 194, 255, ${Math.random() * 0.15 + 0.05}) 0%, transparent 70%)`,
              opacity: 0.3,
            }}
          />
        );
      })}

      {/* Connecting lines between nearby particles (subtle) - STATIC */}
      <svg className="absolute inset-0 w-full h-full hidden md:block">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(60, 194, 255, 0)" />
            <stop offset="50%" stopColor="rgba(60, 194, 255, 0.1)" />
            <stop offset="100%" stopColor="rgba(60, 194, 255, 0)" />
          </linearGradient>
        </defs>
        {particles.slice(0, 15).map((particle, i) => {
          const nextParticle = particles[(i + 3) % particles.length];
          return (
            <line
              key={`line-${i}`}
              x1={`${particle.x}%`}
              y1={`${particle.y}%`}
              x2={`${nextParticle.x}%`}
              y2={`${nextParticle.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
              opacity="0.1"
            />
          );
        })}
      </svg>

      {/* Shimmer effect - REMOVED (was animated) */}
    </div>
  );
}

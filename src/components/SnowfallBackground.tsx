import React, { useEffect, useRef } from 'react';
import { ThemeMode } from '../types';

interface SnowfallBackgroundProps {
  themeMode: ThemeMode;
}

interface SnowflakeParticle {
  x: number;
  y: number;
  radius: number;
  baseSpeed: number;
  opacity: number;
  swaySpeed: number;
  swayAngle: number;
  swayRadius: number;
}

export const SnowfallBackground: React.FC<SnowfallBackgroundProps> = ({ themeMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollVelocityRef = useRef<number>(0);
  const scrollDirectionRef = useRef<number>(1); // 1 = down, -1 = up
  const lastScrollYRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(Date.now());
  const lastTouchYRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const isLight = themeMode === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 165 micro snow particles for soft, peaceful snowfall
    const FLAKE_COUNT = 165;
    const flakes: SnowflakeParticle[] = [];

    for (let i = 0; i < FLAKE_COUNT; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.45 + Math.random() * 1.1, // tiny micro particles 0.45px to 1.55px
        baseSpeed: 0.06 + Math.random() * 0.14, // slow-motion gentle floating fall speed
        opacity: isLight ? 0.35 + Math.random() * 0.4 : 0.4 + Math.random() * 0.5,
        swaySpeed: 0.006 + Math.random() * 0.012,
        swayAngle: Math.random() * Math.PI * 2,
        swayRadius: 0.35 + Math.random() * 0.85
      });
    }

    // 1. Window scroll listener
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const now = Date.now();
      const dt = Math.max(1, now - lastScrollTimeRef.current);
      const dy = currentScrollY - lastScrollYRef.current;

      if (Math.abs(dy) > 1) {
        scrollDirectionRef.current = dy >= 0 ? 1 : -1;
        const impulse = Math.min(6.0, Math.abs(dy) / (dt * 0.15));
        scrollVelocityRef.current = Math.min(8.0, scrollVelocityRef.current + impulse * 0.6);
      }

      lastScrollYRef.current = currentScrollY;
      lastScrollTimeRef.current = now;
    };

    // 2. Mouse wheel listener (works immediately even without page scroll overflow)
    const handleWheel = (e: WheelEvent) => {
      const delta = e.deltaY;
      if (Math.abs(delta) > 0.5) {
        scrollDirectionRef.current = delta >= 0 ? 1 : -1;
        const impulse = Math.min(5.0, Math.abs(delta) / 18);
        scrollVelocityRef.current = Math.min(8.5, scrollVelocityRef.current + impulse * 0.7);
      }
    };

    // 3. Touch move listener for mobile/tablet
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastTouchYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && lastTouchYRef.current !== null) {
        const delta = lastTouchYRef.current - e.touches[0].clientY;
        if (Math.abs(delta) > 1) {
          scrollDirectionRef.current = delta >= 0 ? 1 : -1;
          const impulse = Math.min(5.0, Math.abs(delta) / 10);
          scrollVelocityRef.current = Math.min(8.0, scrollVelocityRef.current + impulse * 0.5);
        }
        lastTouchYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      lastTouchYRef.current = null;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth decay of scroll velocity towards 0
      scrollVelocityRef.current *= 0.94;
      if (scrollVelocityRef.current < 0.01) {
        scrollVelocityRef.current = 0;
      }
      const currentBoost = scrollVelocityRef.current; // 0 to ~8.0
      const direction = scrollDirectionRef.current;

      const flakeColor = isLight ? 'rgba(71, 85, 105, ' : 'rgba(255, 255, 255, ';

      for (let i = 0; i < FLAKE_COUNT; i++) {
        const flake = flakes[i];

        // Vertical displacement with noticeable acceleration on scroll/wheel
        // If scrolling down, falls faster down; if scrolling up, gentle upward drift
        const verticalDelta = flake.baseSpeed + (direction > 0 ? currentBoost * 0.55 : -currentBoost * 0.35);
        flake.y += Math.max(0.04, verticalDelta);

        // Harmonic sway & fluid lateral swirl when scrolling
        flake.swayAngle += flake.swaySpeed + currentBoost * 0.015;
        const swirlDisplacement = Math.sin(flake.swayAngle * 1.5) * (flake.swayRadius + currentBoost * 0.4);
        flake.x += Math.sin(flake.swayAngle) * flake.swayRadius + swirlDisplacement * 0.2;

        // Wrap around seamlessly
        if (flake.y > height + 10) {
          flake.y = -10;
          flake.x = Math.random() * width;
        } else if (flake.y < -10) {
          flake.y = height + 10;
          flake.x = Math.random() * width;
        }

        if (flake.x > width + 10) {
          flake.x = -10;
        } else if (flake.x < -10) {
          flake.x = width + 10;
        }

        // Draw micro flake
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${flakeColor}${flake.opacity})`;
        ctx.fill();
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isLight]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Ice and Fire (Buz ve Ateş) Diagonal Corner Atmosphere */}
      {/* ICE: Cool Icy Sky Blue Glow strictly in Top-Left Corner (Sol Üst Köşe) */}
      <div 
        className="absolute rounded-full blur-[140px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          width: '56vmax',
          height: '56vmax',
          top: '-22%',
          left: '-18%',
          backgroundColor: isLight ? 'rgba(56, 189, 248, 0.08)' : 'rgba(14, 165, 233, 0.12)',
        }}
      />
      {/* ICE ACCENT: Subtle Soft Sapphire Depth Glow at Top-Left */}
      <div 
        className="absolute rounded-full blur-[120px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          width: '40vmax',
          height: '40vmax',
          top: '-8%',
          left: '-8%',
          backgroundColor: isLight ? 'rgba(99, 102, 241, 0.05)' : 'rgba(56, 189, 248, 0.08)',
        }}
      />

      {/* FIRE: Delicate Warm Amber & Soft Ember Glow strictly in Bottom-Right Corner (Sağ Alt Köşe) */}
      <div 
        className="absolute rounded-full blur-[140px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          width: '56vmax',
          height: '56vmax',
          bottom: '-22%',
          right: '-18%',
          backgroundColor: isLight ? 'rgba(249, 115, 22, 0.07)' : 'rgba(234, 88, 12, 0.11)',
        }}
      />
      {/* FIRE ACCENT: Subtle Soft Coral/Rose Glow at Bottom-Right */}
      <div 
        className="absolute rounded-full blur-[120px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          width: '40vmax',
          height: '40vmax',
          bottom: '-8%',
          right: '-8%',
          backgroundColor: isLight ? 'rgba(244, 63, 94, 0.05)' : 'rgba(225, 29, 72, 0.08)',
        }}
      />

      {/* 2. 60FPS Reactive High-Performance Snowfall Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};


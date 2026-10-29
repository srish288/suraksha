import React, { useRef, useEffect, useMemo } from 'react';

export type AiOrbState = 'idle' | 'listening' | 'thinking' | 'responding' | 'offline' | 'unavailable';

export interface AiOrbVisualizationProps {
  state: AiOrbState;
  className?: string;
  size?: number;
}

export const AiOrbVisualization: React.FC<AiOrbVisualizationProps> = ({
  state = 'idle',
  className = '',
  size = 140
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const width = size;
    const height = size;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = size * 0.3;

    // Palette per state
    const getTheme = () => {
      switch (state) {
        case 'thinking':
          return {
            primary: '#a855f7', // Violet
            secondary: '#38bdf8', // Sky
            ambient: 'rgba(168, 85, 247, 0.15)',
            speed: 0.06,
            ringCount: 4
          };
        case 'responding':
          return {
            primary: '#10b981', // Emerald
            secondary: '#06b6d4', // Cyan
            ambient: 'rgba(16, 185, 129, 0.18)',
            speed: 0.045,
            ringCount: 5
          };
        case 'listening':
          return {
            primary: '#f59e0b', // Amber
            secondary: '#06b6d4', // Cyan
            ambient: 'rgba(245, 158, 11, 0.15)',
            speed: 0.04,
            ringCount: 3
          };
        case 'offline':
          return {
            primary: '#d97706', // Amber gold
            secondary: '#64748b', // Slate
            ambient: 'rgba(217, 119, 6, 0.1)',
            speed: 0.015,
            ringCount: 2
          };
        case 'unavailable':
          return {
            primary: '#ef4444', // Red
            secondary: '#475569', // Slate
            ambient: 'rgba(239, 68, 68, 0.1)',
            speed: 0.01,
            ringCount: 2
          };
        case 'idle':
        default:
          return {
            primary: '#06b6d4', // Cyan
            secondary: '#3b82f6', // Blue
            ambient: 'rgba(6, 182, 212, 0.12)',
            speed: 0.02,
            ringCount: 3
          };
      }
    };

    const render = () => {
      const theme = getTheme();
      ctx.clearRect(0, 0, width, height);

      // Central Ambient Glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius * 1.6
      );
      glowGrad.addColorStop(0, theme.ambient);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // If user prefers reduced motion, render single static concentric emblem
      if (prefersReducedMotion) {
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = theme.secondary;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      // 1. Core Organic Breathing Sphere
      const pulse = Math.sin(step * 2) * (radius * 0.08);
      const coreRadius = radius * 0.45 + pulse;

      const coreGrad = ctx.createRadialGradient(
        centerX - coreRadius * 0.3,
        centerY - coreRadius * 0.3,
        0,
        centerX,
        centerY,
        coreRadius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, theme.primary);
      coreGrad.addColorStop(1, theme.secondary);

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Animated Harmonic Orbit Rings
      for (let i = 0; i < theme.ringCount; i++) {
        const ringAngle = step * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / theme.ringCount;
        const xRadius = radius * (0.8 + i * 0.18);
        const yRadius = radius * (0.35 + i * 0.08);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(ringAngle * 0.3);

        ctx.strokeStyle = i === 0 ? theme.primary : theme.secondary;
        ctx.lineWidth = 1.4 - i * 0.2;
        ctx.globalAlpha = 0.7 - i * 0.15;

        ctx.beginPath();
        ctx.ellipse(0, 0, xRadius, yRadius, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Orbital particle tracking along ring
        const particleAngle = step * 1.5 + i;
        const px = Math.cos(particleAngle) * xRadius;
        const py = Math.sin(particleAngle) * yRadius;

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      step += theme.speed;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, size, prefersReducedMotion]);

  // Status pill text
  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Analyzing Query...';
      case 'thinking':
        return 'Searching Safety Database...';
      case 'responding':
        return 'Active Response Streaming';
      case 'offline':
        return 'Offline Knowledge Base';
      case 'unavailable':
        return 'Telemetry Standby';
      case 'idle':
      default:
        return 'AI Companion Ready';
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'thinking':
        return 'text-purple-400 bg-purple-950/80 border-purple-800/60';
      case 'responding':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60';
      case 'listening':
        return 'text-amber-400 bg-amber-950/80 border-amber-800/60';
      case 'offline':
        return 'text-amber-300 bg-amber-950/80 border-amber-800/60';
      case 'unavailable':
        return 'text-rose-400 bg-rose-950/80 border-rose-800/60';
      case 'idle':
      default:
        return 'text-cyan-400 bg-cyan-950/80 border-cyan-800/60';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="block drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          aria-label={`SURAKSHA AI Safety Orb: ${getStatusText()}`}
        />
      </div>

      <div className="mt-1">
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${getStatusColor()}`}
        >
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};

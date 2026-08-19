import React, { useEffect, useRef } from 'react';

interface Props {
  className?: string;
  variant?: 'full' | 'subtle';
}

export const LiveBackground: React.FC<Props> = ({
  className = '',
  variant = 'full',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle nodes representing neon fiscal telemetry & deep teal ambient nodes
    const particleCount = window.innerWidth < 768 ? 24 : 48;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;
      color: string;
      alpha: number;
      pulseSpeed: number;
      pulseOffset: number;
    }> = [];

    const colors = [
      '#22D39F', // Primary Accent (Teal / Mint)
      '#19C99A', // Accent Hover
      '#102D30', // Deep Teal
      '#7F8BA3', // Muted Text / Slate
      '#263047', // Border Indigo
      '#F0F4FF', // Neon White / Mint Highlight
    ];

    for (let i = 0; i < particleCount; i++) {
      const baseRadius = Math.random() * 2.8 + 1.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: baseRadius,
        baseRadius,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.55 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Interactive mouse tracker
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length > 0) {
        targetMouseX = e.touches[0].clientX;
        targetMouseY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        targetMouseX = (e as MouseEvent).clientX;
        targetMouseY = (e as MouseEvent).clientY;
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;
    const render = () => {
      time += 0.015;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle luminous interactive gradient spot around cursor
      const cursorGlow = ctx.createRadialGradient(
        mouseX,
        mouseY,
        10,
        mouseX,
        mouseY,
        Math.min(width, height) * 0.38
      );
      cursorGlow.addColorStop(0, 'rgba(34, 211, 159, 0.09)');
      cursorGlow.addColorStop(0.5, 'rgba(16, 45, 48, 0.05)');
      cursorGlow.addColorStop(1, 'rgba(14, 17, 32, 0)');
      ctx.fillStyle = cursorGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw connections between nearby particles
      ctx.lineWidth = 0.75;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = width < 768 ? 90 : 135;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.2;
            ctx.strokeStyle = `rgba(34, 211, 159, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Pulsate radius
        p.radius = p.baseRadius + Math.sin(time * p.pulseSpeed * 10 + p.pulseOffset) * 0.6;

        // Particle shadow glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color === '#22D39F' ? '#22D39F' : '#102D30';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* BASE DEEP DARK CYBERNETIC BACKGROUND */}
      <div className="absolute inset-0 bg-[#0E1120]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0E1120] via-[#0B0F18] to-[#0E1120]" />

      {/* AMBIENT FLOATING DEEP TEAL & NEON EMERALD GLOW BLOBS */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] min-w-[350px] min-h-[350px] rounded-full bg-[#102D30]/40 blur-[90px] sm:blur-[140px] pointer-events-none float-bubble"
      />
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] min-w-[380px] min-h-[380px] rounded-full bg-[#22D39F]/12 blur-[100px] sm:blur-[160px] pointer-events-none float-bubble-delayed"
      />
      <div
        className="absolute top-[40%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] min-w-[300px] min-h-[300px] rounded-full bg-[#161D2F]/60 blur-[80px] pointer-events-none float-bubble"
        style={{ animationDuration: '11s' }}
      />
      <div
        className="absolute top-[70%] left-[10%] w-[40vw] h-[40vw] min-w-[280px] min-h-[280px] rounded-full bg-[#102D30]/30 blur-[80px] pointer-events-none float-bubble-delayed"
        style={{ animationDuration: '13s' }}
      />

      {/* DYNAMIC LIVE PARTICLE CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-75"
      />

      {/* SUBTLE TEXTURED GRID / MATRIX OVERLAY */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#26304712_1px,transparent_1px),linear-gradient(to_bottom,#26304712_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />
    </div>
  );
};

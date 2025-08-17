"use client";

import { useEffect, useRef } from "react";

export default function BackgroundNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context as CanvasRenderingContext2D; // ✅ tell TS it's safe

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // nodes
    const nodes = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 0.8,
      dy: (Math.random() - 0.5) * 0.8,
      r: 5 + Math.random() * 8,
      color: `hsl(${Math.random() * 360}, 90%, 55%)`
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // background
      ctx.fillStyle = "#0a0b0f";
      ctx.fillRect(0, 0, width, height);

      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            ctx.strokeStyle = "rgba(255,255,255,0.12)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 20;
        ctx.fill();

        // move
        n.x += n.dx;
        n.y += n.dy;
        if (n.x < 0 || n.x > width) n.dx *= -1;
        if (n.y < 0 || n.y > height) n.dy *= -1;
      });

      requestAnimationFrame(draw);
    }

    draw();

    // resize handler
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen -z-10 block"
    />
  );
}

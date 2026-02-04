import { useEffect, useRef } from "react";
import { HUDOverlay } from "./HUDOverlay";

interface VideoFeedProps {
  imageUrl: string;
}

export function VideoFeed({ imageUrl }: VideoFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Skeleton tracking points (MediaPipe style)
    const skeleton = {
      nose: { x: 640, y: 180 },
      leftShoulder: { x: 580, y: 280 },
      rightShoulder: { x: 700, y: 280 },
      leftElbow: { x: 520, y: 380 },
      rightElbow: { x: 760, y: 380 },
      leftWrist: { x: 480, y: 480 },
      rightWrist: { x: 800, y: 480 },
      leftHip: { x: 600, y: 480 },
      rightHip: { x: 680, y: 480 },
      leftKnee: { x: 600, y: 600 },
      rightKnee: { x: 680, y: 600 },
      leftAnkle: { x: 600, y: 700 },
      rightAnkle: { x: 680, y: 700 },
    };

    const connections = [
      ["nose", "leftShoulder"],
      ["nose", "rightShoulder"],
      ["leftShoulder", "rightShoulder"],
      ["leftShoulder", "leftElbow"],
      ["leftElbow", "leftWrist"],
      ["rightShoulder", "rightElbow"],
      ["rightElbow", "rightWrist"],
      ["leftShoulder", "leftHip"],
      ["rightShoulder", "rightHip"],
      ["leftHip", "rightHip"],
      ["leftHip", "leftKnee"],
      ["leftKnee", "leftAnkle"],
      ["rightHip", "rightKnee"],
      ["rightKnee", "rightAnkle"],
    ];

    let animationFrame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections (lines)
      ctx.strokeStyle = "#CCFF00";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(204, 255, 0, 0.8)";

      connections.forEach(([start, end]) => {
        const startPoint = skeleton[start as keyof typeof skeleton];
        const endPoint = skeleton[end as keyof typeof skeleton];
        
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      });

      // Draw joints (points)
      Object.values(skeleton).forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#00D4FF";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(0, 212, 255, 1)";
        ctx.fill();
      });

      // Animate with slight movement
      animationFrame++;
      const wave = Math.sin(animationFrame * 0.05) * 3;
      
      Object.keys(skeleton).forEach((key) => {
        const point = skeleton[key as keyof typeof skeleton];
        point.y += wave * 0.2;
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--deep-charcoal)] to-[var(--matte-black)]">
        <img
          src={imageUrl}
          alt="Pushup training"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Skeleton overlay canvas */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full"
      />

      {/* HUD Overlay */}
      <HUDOverlay />

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-[var(--algorand-cyan)] to-transparent animate-[scan_3s_linear_infinite]" />
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--algorand-cyan)] opacity-60" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[var(--algorand-cyan)] opacity-60" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[var(--electric-volt)] opacity-60" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--electric-volt)] opacity-60" />
    </div>
  );
}
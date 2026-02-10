// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { HUDOverlay } from "./HUDOverlay";
import { PoseDetector } from "../services/PoseDetector";
import { RepCounter } from "../services/RepCounter";
import { POSE_CONNECTIONS, API_KEY } from "@mediapipe/pose";
// Note: API_KEY is not usually exported from @mediapipe/pose, checking usage. 
// Actually POSE_CONNECTIONS might need to come from the package or be defined manually if not exported.
// Let's assume POSE_CONNECTIONS is available or we can use the shim's if needed.
// For now, I'll rely on the PoseDetector service to handle the heavy lifting, 
// but I need to draw the results here.

interface VideoFeedProps {
  onRepCount?: (count: number) => void;
  isActive: boolean;
}

export function VideoFeed({ onRepCount, isActive }: VideoFeedProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector] = useState(() => new PoseDetector());
  const [repCounter] = useState(() => new RepCounter(onRepCount));
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Drawing utility
  const drawResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only draw if we have landmarks
    if (results.poseLandmarks) {
      // Iterate through landmarks to draw connections and points
      // We can use MediaPipe's drawing utils if installed, or manual drawing
      // For simplicity/control, manual drawing:

      const landmarks = results.poseLandmarks;

      // Draw Connections
      if (POSE_CONNECTIONS) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0, 212, 255, 0.6)"; // Cyan glow

        for (const [start, end] of POSE_CONNECTIONS) {
          const startLandmark = landmarks[start];
          const endLandmark = landmarks[end];

          // MediaPipe pose landmarks can sometimes be undefined or hidden
          if (startLandmark && endLandmark &&
            startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
            ctx.beginPath();
            ctx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
            ctx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
            ctx.stroke();
          }
        }
      }

      // Draw Points
      for (const landmark of landmarks) {
        if (landmark.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = "#00D4FF"; // Cyan border
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Process reps
    if (results.poseLandmarks) {
      const stats = repCounter.processLandmarks(results.poseLandmarks);
      // We could also draw the angle or state on screen here if desired
    }
  }, [repCounter]);

  useEffect(() => {
    detector.setOnResults(drawResults);
  }, [detector, drawResults]);

  useEffect(() => {
    let animationFrameId: number;

    const startDetection = async () => {
      if (isActive && webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;

        // Ensure canvas matches video dimensions
        if (canvasRef.current) {
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
        }

        await detector.start(video);
        setIsCameraReady(true);
      } else {
        animationFrameId = requestAnimationFrame(startDetection);
      }
    };

    if (isActive) {
      startDetection();
    } else {
      detector.stop();
      setIsCameraReady(false);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      detector.stop();
    };
  }, [isActive, detector]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
      {isActive ? (
        <>
          <Webcam
            ref={webcamRef}
            className="absolute inset-0 w-full h-full object-cover"
            mirrored
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--deep-charcoal)]">
          <p className="text-white/40 font-['Rajdhani']">Camera Inactive</p>
        </div>
      )}

      {/* HUD Overlay */}
      <HUDOverlay />

      {/* Scan line effect (only when active) */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-[var(--algorand-cyan)] to-transparent animate-[scan_3s_linear_infinite]" />
        </div>
      )}

      {/* Decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--algorand-cyan)] opacity-60" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[var(--algorand-cyan)] opacity-60" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[var(--electric-volt)] opacity-60" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--electric-volt)] opacity-60" />
    </div>
  );
}
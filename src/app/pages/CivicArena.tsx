import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { FaCamera, FaCheckCircle, FaSpinner, FaTrash } from "react-icons/fa";

export function CivicArena() {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<{ status: string; confidence: number } | null>(null);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const verifyCleanliness = async () => {
        if (!imgSrc) return;

        setVerifying(true);
        try {
            // TODO: Replace with actual backend endpoint
            // const response = await fetch("http://localhost:8000/api/verify-cleanliness", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({ image: imgSrc }),
            // });
            // const data = await response.json();

            // Simulation for UI testing
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockResult = Math.random() > 0.3
                ? { status: "clean", confidence: 0.95 }
                : { status: "messy", confidence: 0.88 };

            setResult(mockResult);
        } catch (error) {
            console.error("Verification failed:", error);
        } finally {
            setVerifying(false);
        }
    };

    const retake = () => {
        setImgSrc(null);
        setResult(null);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 max-w-4xl mx-auto p-4">
            <header className="text-center mb-4">
                <h1 className="text-4xl font-bold text-[var(--neon-purple)] mb-2">CIVIC SENSE ARENA</h1>
                <p className="text-[var(--holographic-silver)]">
                    Verify cleanliness. Earn rewards. Build a better campus.
                </p>
            </header>

            <div className="relative w-full max-w-xl aspect-video bg-black rounded-3xl overflow-hidden border-2 border-[var(--neon-purple)] shadow-[0_0_50px_rgba(180,0,255,0.2)]">
                {imgSrc ? (
                    <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Overlay UI */}
                {verifying && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                        <FaSpinner className="animate-spin text-[var(--neon-purple)] text-6xl mb-4" />
                        <p className="text-xl text-white font-mono animate-pulse">ANALYZING WITH VISION AI...</p>
                    </div>
                )}

                {result && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 p-8 text-center">
                        {result.status === "clean" ? (
                            <>
                                <FaCheckCircle className="text-green-500 text-6xl mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">VERIFIED CLEAN</h2>
                                <p className="text-green-400 font-mono mb-6">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                                <div className="p-4 bg-green-500/20 border border-green-500 rounded-xl">
                                    <p className="text-white">Reward initiated! 5 ALGO sent to your wallet.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <FaTrash className="text-red-500 text-6xl mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">NOT CLEAN</h2>
                                <p className="text-red-400 font-mono mb-6">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                                <p className="text-[var(--holographic-silver)]">Please clean the area and try again.</p>
                            </>
                        )}
                        <button
                            onClick={retake}
                            className="mt-8 px-6 py-2 border border-white/20 hover:bg-white/10 rounded-full text-white transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                {!imgSrc && (
                    <button
                        onClick={capture}
                        className="flex items-center gap-2 px-8 py-4 bg-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/80 text-white rounded-full font-bold text-lg shadow-lg transition-all"
                    >
                        <FaCamera /> SNAP PHOTO
                    </button>
                )}

                {imgSrc && !verifying && !result && (
                    <>
                        <button
                            onClick={retake}
                            className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white rounded-full transition-colors"
                        >
                            Retake
                        </button>
                        <button
                            onClick={verifyCleanliness}
                            className="px-8 py-3 bg-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/80 text-white rounded-full font-bold shadow-lg transition-all"
                        >
                            VERIFY & CLAIM REWARD
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

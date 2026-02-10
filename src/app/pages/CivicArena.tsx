import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { FaCamera, FaCheckCircle, FaSpinner, FaTrash } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function CivicArena() {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<{ status: "clean" | "messy"; confidence: number } | null>(null);

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
            // Remove "data:image/jpeg;base64," prefix
            const base64Image = imgSrc.split(",")[1];

            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = "Analyze this image. Does it show visible trash, litter, or garbage like bottles, cups, wrappers, or leftover food? If YES, categorize as 'messy'. If the area looks generally tidy or just has non-trash items, categorize as 'clean'. Return JSON format: { \"status\": \"clean\" | \"messy\", \"confidence\": 0.0 to 1.0 }";

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: "image/jpeg",
                    },
                },
            ]);

            const responseText = result.response.text();
            console.log("Gemini Response:", responseText);

            // Simple parsing to handle potential markdown wrapping
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const json = JSON.parse(jsonMatch[0]);
                setResult({
                    status: json.status,
                    confidence: json.confidence || 0.9
                });

                // Send to backend
                try {
                    const submitResponse = await fetch('http://localhost:8000/api/civic/verify-cleanliness', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image: imgSrc,
                            walletAddress: "TEST_WALLET_ADDRESS" // TODO: Get actual wallet from context
                        })
                    });
                    const submitData = await submitResponse.json();
                    console.log("Submission Result:", submitData);
                } catch (e) {
                    console.error("Backend submission failed", e);
                }

            } else {
                // Fallback parsing if JSON fails
                const isMessy = responseText.toLowerCase().includes("messy");
                setResult({
                    status: isMessy ? "messy" : "clean",
                    confidence: 0.85
                });
            }

        } catch (error) {
            console.error("Verification failed:", error);
            alert("AI Verification Failed. Check API Key or Console.");
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
                <p className="text-xs text-[var(--neon-purple)] mt-2">Powered by Gemini Vision AI</p>
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
                        <p className="text-xl text-white font-mono animate-pulse">ANALYZING WITH GEMINI AI...</p>
                    </div>
                )}

                {result && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 p-8 text-center">
                        {result.status === "clean" ? (
                            <>
                                <FaCheckCircle className="text-green-500 text-6xl mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">AI VERIFIED</h2>
                                <p className="text-green-400 font-mono mb-6">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                                <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-xl">
                                    <p className="text-white font-bold">Submitted for Admin Review</p>
                                    <p className="text-xs text-yellow-300 mt-1">Reward pending approval</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <FaTrash className="text-red-500 text-6xl mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">TRASH DETECTED</h2>
                                <p className="text-red-400 font-mono mb-6">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                                <p className="text-[var(--holographic-silver)]">Please clean the area and try again.</p>
                            </>
                        )}
                        <button
                            onClick={retake}
                            className="mt-8 px-6 py-2 border border-white/20 hover:bg-white/10 rounded-full text-white transition-colors"
                        >
                            {result.status === "clean" ? "Submit Another" : "Try Again"}
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

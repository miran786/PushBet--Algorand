import { useRef, useState, useCallback } from "react";

const toast = { success: (msg: string) => console.log('✅', msg), error: (msg: string) => console.error('❌', msg) };
import Webcam from "react-webcam";
import { FaCamera, FaCheckCircle, FaSpinner, FaTrash } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";


const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function CivicArena() {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<{ status: "clean" | "messy"; confidence: number; reported?: boolean; resolved?: boolean } | null>(null);

    const capture = useCallback(() => {
        const screenshot = webcamRef.current?.getScreenshot();
        if (screenshot) {
            setImgSrc(screenshot);
            setResult(null);
        }
    }, [webcamRef]);

    const verifyCleanliness = async () => {
        if (!imgSrc || !GEMINI_API_KEY) return;
        setVerifying(true);
        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const base64Data = imgSrc.split(",")[1];
            const imagePart = { inlineData: { data: base64Data, mimeType: "image/jpeg" } };
            const prompt = "Analyze this image of a campus area. Is it clean or messy/has trash? Respond ONLY with JSON: {\"status\": \"clean\" or \"messy\", \"confidence\": 0.0-1.0}";
            const result = await model.generateContent([prompt, imagePart]);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setResult({ status: parsed.status, confidence: parsed.confidence });
            }
        } catch (err) {
            console.error("Verification error:", err);
            toast.error("Verification failed. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    const handleReport = () => {
        if (!result) return;
        setResult({ ...result, reported: true });
        toast.success("Area reported to Campus Cleaning Squad!");
    };

    const handleResolve = () => {
        if (!result) return;
        setResult({ ...result, status: "clean", resolved: true });
        toast.success("Area officially marked as RESOLVED by Admin.");
    };

    const retake = () => {
        setImgSrc(null);
        setResult(null);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-white mb-2">🏛️ Civic Sense Arena</h1>
            <p className="text-[var(--holographic-silver)] text-sm mb-4">Snap a photo of any campus area to verify cleanliness and earn rewards.</p>

            <div className="relative w-full max-w-md aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-white/10">
                {!imgSrc ? (
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{ facingMode: "environment" }}
                    />
                ) : (
                    <img src={imgSrc} alt="captured" className="w-full h-full object-cover" />
                )}

                {verifying && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                        <FaSpinner className="text-[var(--neon-purple)] text-4xl animate-spin mb-4" />
                        <p className="text-white font-mono">AI Analyzing...</p>
                    </div>
                )}

                {result && (
                    <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-20 p-8 text-center animate-in fade-in duration-300">
                        {result.status === "clean" ? (
                            <>
                                <FaCheckCircle className="text-green-500 text-6xl mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {result.resolved ? "ADMIN RESOLVED" : "AI VERIFIED"}
                                </h2>
                                <p className={`font-mono mb-6 ${result.resolved ? "text-blue-400" : "text-green-400"}`}>
                                    {result.resolved ? "Campus standard restored" : `Confidence: ${(result.confidence * 100).toFixed(1)}%`}
                                </p>
                                <div className={`p-4 rounded-xl border ${result.resolved ? "bg-blue-500/20 border-blue-500" : "bg-yellow-500/20 border-yellow-500"}`}>
                                    <p className="text-white font-bold">
                                        {result.resolved ? "Case Closed" : "Submitted for Admin Review"}
                                    </p>
                                    <p className="text-xs mt-1 text-white/70">
                                        {result.resolved ? "Thank you for your civic contribution" : "Reward pending approval"}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <FaTrash className={`text-6xl mb-4 ${result.reported ? "text-orange-500" : "text-red-500"}`} />
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {result.reported ? "ISSUE REPORTED" : "TRASH DETECTED"}
                                </h2>
                                <p className={`font-mono mb-6 ${result.reported ? "text-orange-400" : "text-red-400"}`}>
                                    {result.reported ? "Cleaning squad notified" : `Confidence: ${(result.confidence * 100).toFixed(1)}%`}
                                </p>
                                {!result.reported ? (
                                    <div className="space-y-4 w-full px-4">
                                        <p className="text-[var(--holographic-silver)] text-sm mb-4">You can report this area for cleaning or try again after picking up the trash.</p>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={handleReport}
                                                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg transition-all"
                                            >
                                                REPORT FOR CLEANING
                                            </button>
                                            <button
                                                onClick={handleResolve}
                                                className="w-full py-3 border-2 border-dashed border-gray-600 hover:border-blue-400 hover:text-blue-400 text-gray-500 text-xs font-mono rounded-xl transition-all"
                                            >
                                                [ADMIN] FORCE RESOLVE
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-orange-500/20 border border-orange-500 rounded-xl">
                                        <p className="text-white font-bold">Ticket #2026-PB-99</p>
                                        <p className="text-xs text-orange-300 mt-1">Status: DISPATCHED</p>
                                    </div>
                                )}
                            </>
                        )}
                        <button
                            onClick={retake}
                            className="mt-8 px-6 py-2 border border-white/20 hover:bg-white/10 rounded-full text-white transition-colors"
                        >
                            {result.status === "clean" ? "Submit Another" : "Retake Photo"}
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

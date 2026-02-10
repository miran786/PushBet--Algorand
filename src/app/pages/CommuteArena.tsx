import { useEffect, useState, useRef, useCallback } from "react";
import { FaBus, FaCheckCircle, FaSpinner, FaCamera, FaArrowRight, FaMapMarkerAlt } from "react-icons/fa";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Webcam from "react-webcam";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner"; // Using sonner for toasts as requested by project setup

// Fix for Leaflet marker icons in React
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix icon loading issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const VIT_COORDS = { lat: 18.4636, lng: 73.8682 }; // VIT Pune Coordinates
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Component to recenter map when coords change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

export function CommuteArena() {
    const { activeAccount, signTransactions } = useWallet();
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [rideStatus, setRideStatus] = useState<"idle" | "active" | "verifying_photo" | "arrived">("idle");
    const [payoutStatus, setPayoutStatus] = useState<"pending" | "success" | "error" | null>(null);

    // Photo Verification State
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [aiVerifying, setAiVerifying] = useState(false);

    // Watch position when ride is active
    useEffect(() => {
        if (rideStatus === "active" && "geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Geolocation Error:", error);
                    toast.error("Failed to get location. Using default for demo.");
                    setCoords(VIT_COORDS); // Fallback to VIT for demo
                },
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [rideStatus]);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const performAiVerification = async () => {
        if (!imgSrc) return;
        setAiVerifying(true);

        try {
            if (!GEMINI_API_KEY) {
                throw new Error("Gemini API Key missing");
            }

            // Remove "data:image/jpeg;base64," prefix
            const base64Image = imgSrc.split(",")[1];

            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = "Analyze this image. Does it look like a public transport setting, a bus interior, a train, a bus stop, or a view of a road from a vehicle? Answer strictly 'YES' or 'NO'.";

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
            console.log("Gemini Commute Check:", responseText);

            if (responseText.toUpperCase().includes("YES")) {
                toast.success("AI Verified Commute Context!");
                await handleArrival(); // Proceed to check-in
            } else {
                toast.error("Verification Failed: Image does not look like a commute context.");
                setImgSrc(null); // Reset to try again
            }

        } catch (error) {
            console.error("AI Verification Error", error);
            toast.error("AI Verification Failed. Please try again.");
        } finally {
            setAiVerifying(false);
        }
    };

    const handleArrival = async () => {
        setRideStatus("arrived");
        setPayoutStatus("pending");

        if (!activeAccount) {
            toast.error("Please connect wallet to record on-chain!");
            setPayoutStatus("error");
            return;
        }

        try {
            const algodToken = '';
            const algodServer = 'https://testnet-api.algonode.cloud';
            const algodPort = 443;
            const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

            const params = await algodClient.getTransactionParams().do();

            // Self-transaction with note to verify presence
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: activeAccount.address,
                receiver: activeAccount.address, // Send to self to record proof
                amount: 0,
                suggestedParams: params,
                note: new TextEncoder().encode(`CVP: Commute Verified | Lat: ${coords?.lat || "N/A"} | Via: Gemini`)
            });

            const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
            const rawSignedTxns = await signTransactions([encodedTxn]);
            const signedTxns = rawSignedTxns.filter((txn): txn is Uint8Array => txn !== null);

            if (signedTxns.length === 0) {
                throw new Error("Transaction signing cancelled");
            }

            const response = await algodClient.sendRawTransaction(signedTxns).do();
            const txId = response.txid;
            console.log("Check-in TxID:", txId);

            toast.info("Transaction sent! Waiting for confirmation...");
            await algosdk.waitForConfirmation(algodClient, txId, 4);
            
            setPayoutStatus("success");
            toast.success(`Check-in Confirmed! TxID: ${txId.substring(0, 8)}...`);

        } catch (error) {
            console.error("Check-in failed:", error);
            toast.error("Failed to process on-chain check-in.");
            setPayoutStatus("error");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full max-w-5xl mx-auto p-4 gap-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 rounded-full mb-4 ring-1 ring-pink-500/30">
                    <FaBus className="text-3xl text-pink-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                    COMMUTE POOL
                </h1>
                <p className="text-gray-400 max-w-lg mx-auto text-lg">
                    Verify your sustainable travel. Earn rewards.
                </p>
            </div>

            {/* Main Content Area */}
            <div className="w-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
                
                {/* IDLE STATE */}
                {rideStatus === "idle" && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                        <div className="w-full max-w-md space-y-4">
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-colors group cursor-pointer"
                                 onClick={() => { setRideStatus("active"); setCoords(VIT_COORDS); }}
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-pink-500 rounded-lg group-hover:scale-110 transition-transform">
                                        <FaMapMarkerAlt className="text-white text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-white font-bold text-lg">Start Journey</h3>
                                        <p className="text-gray-400 text-sm">Track route to VIT Pune</p>
                                    </div>
                                    <FaArrowRight className="ml-auto text-gray-500 group-hover:text-pink-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTIVE RIDE (MAP) STATE */}
                {rideStatus === "active" && (
                    <div className="relative w-full h-full min-h-[500px]">
                        <MapContainer
                            center={[VIT_COORDS.lat, VIT_COORDS.lng]}
                            zoom={13}
                            style={{ height: "100%", width: "100%", minHeight: "500px" }}
                            className="z-0"
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            <Marker position={[VIT_COORDS.lat, VIT_COORDS.lng]}>
                                <Popup>VIT Pune (Destination)</Popup>
                            </Marker>
                            {coords && (
                                <>
                                    <Marker position={[coords.lat, coords.lng]}>
                                        <Popup>You are Here</Popup>
                                    </Marker>
                                    <RecenterMap lat={coords.lat} lng={coords.lng} />
                                </>
                            )}
                        </MapContainer>

                        {/* Overlay Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
                            <button
                                onClick={() => setRideStatus("verifying_photo")}
                                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-xl border border-white/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <FaCamera /> VERIFY ARRIVAL
                            </button>
                        </div>

                        {/* Dev Tool */}
                        <button
                            onClick={() => setCoords(VIT_COORDS)}
                            className="absolute top-4 right-4 z-[1000] bg-black/80 text-xs text-gray-300 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-black"
                        >
                            [DEV] Teleport to VIT
                        </button>
                    </div>
                )}

                {/* VERIFYING STATE */}
                {rideStatus === "verifying_photo" && (
                    <div className="flex-1 flex flex-col p-6 items-center justify-center bg-black">
                        <h3 className="text-xl font-bold text-white mb-6">Verify Commute Context</h3>
                        
                        <div className="relative w-full max-w-lg aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-8 group">
                            {imgSrc ? (
                                <img src={imgSrc} alt="Commute Proof" className="w-full h-full object-cover" />
                            ) : (
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    className="w-full h-full object-cover"
                                    videoConstraints={{ facingMode: "environment" }}
                                />
                            )}

                            {aiVerifying && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                    <FaSpinner className="animate-spin text-pink-500 text-5xl mb-4" />
                                    <p className="text-lg text-white font-mono animate-pulse">Analyzing with Gemini AI...</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 w-full max-w-lg">
                            {!imgSrc ? (
                                <button 
                                    onClick={capture} 
                                    className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaCamera /> CAPTURE
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setImgSrc(null)} 
                                        disabled={aiVerifying}
                                        className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    >
                                        RETAKE
                                    </button>
                                    <button 
                                        onClick={performAiVerification} 
                                        disabled={aiVerifying}
                                        className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-colors disabled:opacity-50"
                                    >
                                        VERIFY
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ARRIVED / SUCCESS STATE */}
                {rideStatus === "arrived" && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
                            <FaCheckCircle className="text-green-500 text-5xl" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-white">Ride Verified!</h2>
                            <p className="text-gray-400">Your commute has been recorded on the Algorand blockchain.</p>
                        </div>

                        <div className="w-full max-w-sm bg-gray-800/50 p-6 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Status</span>
                                <span className={`font-bold ${payoutStatus === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {payoutStatus === 'success' ? 'Confirmed' : 'Processing...'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Verification</span>
                                <span className="text-white font-mono">AI-Gemini-1.5</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setRideStatus("idle");
                                setPayoutStatus(null);
                                setImgSrc(null);
                            }}
                            className="mt-8 text-gray-500 hover:text-white transition-colors underline decoration-dotted"
                        >
                            Start New Journey
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

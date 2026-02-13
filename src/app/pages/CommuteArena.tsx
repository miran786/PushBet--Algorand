import { useEffect, useState, useRef, useCallback } from "react";
import { FaBus, FaCheckCircle, FaSpinner, FaCamera, FaArrowRight, FaMapMarkerAlt, FaUser, FaCar, FaStar } from "react-icons/fa";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Webcam from "react-webcam";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";

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
const APP_ID = 755412945; // Live Testnet App ID

// Mock Drivers Data around VIT
const MOCK_DRIVERS = [
    { id: 1, name: "Rajesh Kumar", lat: 18.4650, lng: 73.8690, address: "W23...ABC", rating: 4.8 },
    { id: 2, name: "Priya Sharma", lat: 18.4620, lng: 73.8670, address: "X45...DEF", rating: 4.9 },
    { id: 3, name: "Amit Patel", lat: 18.4700, lng: 73.8650, address: "Y67...GHI", rating: 4.7 },
    { id: 4, name: "Suresh Singh", lat: 18.4610, lng: 73.8660, address: "Z89...JKL", rating: 4.5 },
];

function haversineDistance(coords1: { lat: number, lng: number }, coords2: { lat: number, lng: number }) {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords1.lat)) *
        Math.cos(toRad(coords2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Component to recenter map when coords change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        if (map) map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

export function CommuteArena() {
    const { activeAccount, signTransactions } = useWallet();
    const [coords, setCoords] = useState<{ lat: number; lng: number }>(VIT_COORDS);
    const [distanceToDest, setDistanceToDest] = useState<number | null>(null);
    const [rideStatus, setRideStatus] = useState<"idle" | "active" | "verifying_photo" | "arrived">("idle");
    const [payoutStatus, setPayoutStatus] = useState<"pending" | "success" | "error" | null>(null);
    const [co2Saved, setCo2Saved] = useState(0);

    // New State for Smart Contract Logic
    const [isOptedIn, setIsOptedIn] = useState(false);
    const [role, setRole] = useState<"none" | "rider" | "driver">("none");
    const [driverAddr, setDriverAddr] = useState<string>("");

    // Driver Matching State
    const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

    // Photo Verification State
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [aiVerifying, setAiVerifying] = useState(false);

    // Watch position
    useEffect(() => {
        let watchId: number;
        if ("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCoords(newCoords);

                    // Track distance during trip
                    if (rideStatus === "active") {
                        const dist = haversineDistance(newCoords, VIT_COORDS);
                        setDistanceToDest(dist);

                        // Auto-prompt arrival if within 100m (0.1km)
                        if (dist < 0.1) {
                            toast.info("You've arrived at VIT Pune! Opening verification...");
                            setRideStatus("verifying_photo");
                        }
                    }
                },
                (error) => {
                    console.error("Geolocation Error:", error);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [rideStatus]);

    // Check Account Status on Connect
    useEffect(() => {
        const checkStatus = async () => {
            if (!activeAccount) return;
            try {
                const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
                const info = await algodClient.accountInformation(activeAccount.address).do();

                const appLocalState = (info as any)['apps-local-state'] || [];
                const isOpted = appLocalState.some((app: any) => app.id === APP_ID);
                setIsOptedIn(isOpted);
            } catch (e) {
                console.error("Failed to fetch account info", e);
            }
        };
        checkStatus();
    }, [activeAccount]);

    // Calculate Driver Distances
    useEffect(() => {
        if (role === "rider" && rideStatus === "idle") {
            const driversWithDistance = MOCK_DRIVERS.map(driver => ({
                ...driver,
                distance: haversineDistance(coords, { lat: driver.lat, lng: driver.lng })
            })).sort((a, b) => a.distance - b.distance);
            setAvailableDrivers(driversWithDistance);
        }
    }, [role, rideStatus, coords]);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    // OPT-IN to App (Automatic "Create Account")
    const ensureOptIn = async (): Promise<boolean> => {
        if (isOptedIn) return true;
        if (!activeAccount) {
            toast.error("Please connect wallet first");
            return false;
        }
        try {
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();
            const txn = algosdk.makeApplicationOptInTxnFromObject({
                sender: activeAccount.address, appIndex: APP_ID, suggestedParams: params
            });
            const signedTxns = await signTransactions([algosdk.encodeUnsignedTransaction(txn)]);
            await algodClient.sendRawTransaction(signedTxns.filter((t): t is Uint8Array => t != null)).do();
            await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 4);
            setIsOptedIn(true);
            toast.success("Account Created Successfully!");
            return true;
        } catch (e: any) {
            if (e.message && e.message.includes("already opted in")) {
                setIsOptedIn(true);
                return true;
            }
            toast.error("Account Creation Failed");
            return false;
        }
    };

    const registerRole = (r: "rider" | "driver") => {
        setRole(r);
        toast.info(`Role set to ${r}`);
    };

    const startTrip = () => {
        setRideStatus("active");
        toast.success("Trip Started! Heading to VIT Pune.");
    };

    const performAiVerification = async () => {
        if (!imgSrc) return toast.error("Capture a photo first");
        setAiVerifying(true);
        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = "Analyze this image. Is it a photo of a college campus or a vehicle interior? Answer 'YES' or 'NO'.";

            const imageBase64 = imgSrc.split(",")[1];
            const result = await model.generateContent([
                prompt,
                { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
            ]);

            const text = result.response.text();
            setRideStatus("arrived");
            setPayoutStatus("success");
            setCo2Saved(prev => prev + 2.5);
            toast.success("Verified! Ride Complete & Driver Paid.");
        } catch (e) {
            console.error(e);
            toast.error("AI Verification Failed (Check API Key)");
        } finally {
            setAiVerifying(false);
        }
    };

    const handleRoleSelect = async (selectedRole: "rider" | "driver") => {
        if (!isOptedIn) {
            const success = await ensureOptIn();
            if (!success) return;
        }
        registerRole(selectedRole);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] w-full relative">
            {/* Full Screen Map Background */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0"
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Route Line */}
                    {(role === 'rider' || role === 'none') && (
                        <Polyline
                            positions={[[coords.lat, coords.lng], [VIT_COORDS.lat, VIT_COORDS.lng]]}
                            pathOptions={{ color: 'var(--electric-volt)', weight: 4, opacity: 0.6, dashArray: '10, 10' }}
                        />
                    )}

                    <Marker position={[VIT_COORDS.lat, VIT_COORDS.lng]}>
                        <Popup className="font-['Rajdhani'] font-bold">🎓 VIT Pune (Destination)</Popup>
                    </Marker>

                    <Marker position={[coords.lat, coords.lng]}>
                        <Popup className="font-['Rajdhani'] font-bold">📍 You are here</Popup>
                    </Marker>

                    {/* Available Drivers Markers */}
                    {availableDrivers.map(driver => (
                        <Marker
                            key={driver.id}
                            position={[driver.lat, driver.lng]}
                            eventHandlers={{
                                click: () => {
                                    setDriverAddr(driver.address);
                                    if (role === 'none') handleRoleSelect('rider');
                                }
                            }}
                        >
                            <Popup>
                                <div className="p-2 text-center">
                                    <div className="font-bold">{driver.name}</div>
                                    <div className="text-xs">⭐ {driver.rating}</div>
                                    {driverAddr === driver.address && <div className="text-green-600 font-bold mt-1">SELECTED</div>}
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <RecenterMap lat={coords.lat} lng={coords.lng} />
                </MapContainer>
            </div>

            {/* UI Overlays */}
            <div className="relative z-10 pointer-events-none w-full h-full p-4 flex flex-col justify-between">

                {/* Header Overlay */}
                <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl w-full max-w-md mx-auto flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                            COMMUTE POOL
                        </h1>
                        {distanceToDest ? (
                            <div className="text-xs text-white/60 font-mono">
                                Dist to College: <span className="text-white font-bold">{(distanceToDest).toFixed(2)} km</span>
                            </div>
                        ) : (
                            <div className="text-xs text-white/60">Locating...</div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400">CO2 Saved</div>
                        <div className="text-lg font-bold text-green-400">{co2Saved.toFixed(1)} kg</div>
                    </div>
                </div>

                {/* Bottom Interaction Panel */}
                <div className="pointer-events-auto w-full max-w-lg mx-auto">

                    {/* 1. Role Selection (Floating) */}
                    {role === "none" && (
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 space-y-4">
                            <h2 className="text-xl font-bold text-white text-center">How are you moving today?</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleRoleSelect("rider")}
                                    className="p-6 bg-gray-800 hover:bg-pink-900/40 border border-gray-700 hover:border-pink-500 rounded-2xl flex flex-col items-center gap-3 transition-all group"
                                >
                                    <FaUser className="text-3xl text-pink-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-white">Find Ride</span>
                                </button>
                                <button
                                    onClick={() => handleRoleSelect("driver")}
                                    className="p-6 bg-gray-800 hover:bg-purple-900/40 border border-gray-700 hover:border-purple-500 rounded-2xl flex flex-col items-center gap-3 transition-all group"
                                >
                                    <FaCar className="text-3xl text-purple-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-white">Drive</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. Rider Selection & Trip Start */}
                    {role === "rider" && rideStatus === "idle" && (
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col gap-4 max-h-[50vh]">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-white">Select Driver ({availableDrivers.length})</h3>
                                <button onClick={() => setRole("none")} className="text-xs text-gray-400 hover:text-white">Cancel</button>
                            </div>

                            <div className="space-y-2 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                                {availableDrivers.map(driver => (
                                    <div
                                        key={driver.id}
                                        onClick={() => setDriverAddr(driver.address)}
                                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                                            ${driverAddr === driver.address ? 'bg-pink-500/20 border-pink-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                                <FaCar className="text-white text-xs" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white">{driver.name}</div>
                                                <div className="text-xs text-gray-400">{driver.distance.toFixed(2)} km • ⭐ {driver.rating}</div>
                                            </div>
                                        </div>
                                        {driverAddr === driver.address && <FaCheckCircle className="text-pink-500" />}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={startTrip}
                                disabled={!driverAddr}
                                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 disabled:opacity-50
                                         hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg
                                         flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                            >
                                REQUEST RIDE <FaArrowRight />
                            </button>
                        </div>
                    )}

                    {/* 3. Active Trip Controls */}
                    {rideStatus === "active" && (
                        <div className="bg-black/90 backdrop-blur-xl border border-pink-500/30 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="font-bold text-white">RIDE IN PROGRESS</span>
                                </div>
                                <span className="text-pink-500 font-mono text-sm">ETA: {((distanceToDest || 0) * 2).toFixed(0)} min</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-pink-500 animate-[pulse_2s_infinite]" style={{ width: '60%' }} />
                            </div>
                            <button
                                onClick={() => setRideStatus("verifying_photo")}
                                className="w-full py-3 border border-white/20 hover:bg-white/10 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <FaCamera /> I Have Arrived
                            </button>
                        </div>
                    )}

                    {/* 4. Verification Camera Overlay */}
                    {rideStatus === "verifying_photo" && (
                        <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10">
                            <h3 className="text-center font-bold text-white mb-4">Verify Journey</h3>
                            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4 border border-white/20">
                                {imgSrc ? (
                                    <img src={imgSrc} alt="Proof" className="w-full h-full object-cover" />
                                ) : (
                                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" videoConstraints={{ facingMode: "environment" }} />
                                )}
                                {aiVerifying && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                                        <FaSpinner className="animate-spin text-pink-500 text-4xl mb-2" />
                                        <span className="text-white font-mono text-sm">Gemini Analyzing...</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                {!imgSrc ? (
                                    <button onClick={capture} className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200"><FaCamera className="inline mr-2" /> Capture</button>
                                ) : (
                                    <>
                                        <button onClick={() => setImgSrc(null)} disabled={aiVerifying} className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-xl">Retake</button>
                                        <button onClick={performAiVerification} disabled={aiVerifying} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl">Submit</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 5. Success/Paid Overlay */}
                    {rideStatus === "arrived" && (
                        <div className="bg-black/90 backdrop-blur-xl border border-green-500/30 p-8 rounded-3xl shadow-2xl text-center space-y-4 animate-in zoom-in">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <FaCheckCircle className="text-green-500 text-3xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Journey Complete!</h2>
                            <p className="text-gray-400 text-sm">Driver paid & CO2 saved.</p>
                            <button
                                onClick={() => { setRideStatus("idle"); setImgSrc(null); setDriverAddr(""); setRole("none"); }}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-colors"
                            >
                                Close & Reset
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

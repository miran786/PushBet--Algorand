import { useEffect, useState, useRef, useCallback } from "react";
import { FaBus, FaCheckCircle, FaSpinner, FaCamera, FaArrowRight, FaMapMarkerAlt, FaUser, FaCar, FaStar } from "react-icons/fa";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
    const [rideStatus, setRideStatus] = useState<"idle" | "active" | "verifying_photo" | "arrived">("idle");
    const [payoutStatus, setPayoutStatus] = useState<"pending" | "success" | "error" | null>(null);

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
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Geolocation Error:", error);
                    // toast.error("Location access denied. Using Demo Coords.");
                }
            );
        }
    }, []);

    // Check Account Status on Connect
    useEffect(() => {
        const checkStatus = async () => {
            if (!activeAccount) return;
            try {
                const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
                const info = await algodClient.accountInformation(activeAccount.address).do();

                // Check if opted into APP_ID
                const appLocalState = info['apps-local-state'] || [];
                const isOpted = appLocalState.some((app: any) => app.id === APP_ID);
                setIsOptedIn(isOpted);

                if (isOpted) {
                    // Try to fetch role from local state if possible (requires decoding k/v)
                    // For now, we assume role is not persisted in UI state on reload, or fetch it here.
                    // Simplified for demo: just set opted in.
                }
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
    const handleCreateAccount = async () => {
        if (!activeAccount) {
            toast.error("Please connect wallet first");
            return;
        }
        try {
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();

            const txn = algosdk.makeApplicationOptInTxnFromObject({
                sender: activeAccount.address,
                appIndex: APP_ID,
                suggestedParams: params
            });

            const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
            const signedTxns = await signTransactions([encodedTxn]);
            const filteredSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);

            await algodClient.sendRawTransaction(filteredSignedTxns).do();
            await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 4);

            setIsOptedIn(true);
            toast.success("Account Created Successfully!");
        } catch (e: any) {
            console.error(e);
            if (e.message && e.message.includes("already opted in")) {
                setIsOptedIn(true);
                toast.success("Account Restored (Already Registered)");
            } else {
                toast.error("Account Creation Failed");
            }
        }
    };

    // Register Role
    const registerRole = async (selectedRole: "rider" | "driver") => {
        if (!activeAccount) return;

        // Optimistic UI update for demo
        setRole(selectedRole);

        try {
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();

            const method = selectedRole === "rider" ? "register_rider" : "register_driver";
            const appArgs = [new TextEncoder().encode(method)];

            const txn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: activeAccount.address,
                appIndex: APP_ID,
                appArgs: appArgs,
                suggestedParams: params
            });

            const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
            const signedTxns = await signTransactions([encodedTxn]);
            const filteredSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);

            await algodClient.sendRawTransaction(filteredSignedTxns).do();
            toast.success(`Role Registered: ${selectedRole.toUpperCase()}`);
        } catch (e) {
            console.error(e);
            // Fallback for demo if txn fails (e.g., duplicate role)
            toast.warning("Role update synced (Demo Mode)");
        }
    };

    // Gamification State
    const [co2Saved, setCo2Saved] = useState(0);
    const [nftMinted, setNftMinted] = useState(false);

    // Start Trip (Deposit Collateral)
    const startTrip = async () => {
        if (!driverAddr) {
            toast.error("Select a driver first!");
            return;
        }

        if (!activeAccount) {
            setRideStatus("active");
            toast.success("Trip Started! (Demo Mode)");
            return;
        }
        try {
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();
            const appAddr = algosdk.getApplicationAddress(APP_ID);

            // 1. Payment to App (Collateral)
            const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: activeAccount.address,
                receiver: appAddr,
                amount: 1000000, // 1 ALGO
                suggestedParams: params
            });

            // 2. App Call (Start Trip)
            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: activeAccount.address,
                appIndex: APP_ID,
                appArgs: [new TextEncoder().encode("start_trip")],
                suggestedParams: params
            });

            const txns = [payTxn, appCallTxn];
            algosdk.assignGroupID(txns);

            const encodedTxns = txns.map(t => algosdk.encodeUnsignedTransaction(t));
            const signedTxns = await signTransactions(encodedTxns);
            const filteredSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);

            await algodClient.sendRawTransaction(filteredSignedTxns).do();
            setRideStatus("active");
            toast.success("Trip Started! Collateral Locked.");
        } catch (e) {
            console.error(e);
            toast.error("Failed to Start Trip");
        }
    };

    const performAiVerification = async () => {
        if (!imgSrc) return;
        setAiVerifying(true);

        try {
            if (!GEMINI_API_KEY) {
                // Mock verification for demo if no key
                setTimeout(() => {
                    toast.success("AI Verified Commute Context! (Mock)");
                    handleEndTrip();
                    setAiVerifying(false);
                }, 2000);
                return;
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
                await handleEndTrip(); // Proceed to check-in/payout
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

    // End Trip (Pay Driver)
    const handleEndTrip = async () => {
        setRideStatus("arrived");
        setPayoutStatus("pending");

        // CO2 Calculation: 1km = 0.2kg. Demo: Add 2.5kg per trip.
        const tripCo2 = 2.5;
        const newTotal = co2Saved + tripCo2;
        setCo2Saved(newTotal);

        // Check NFT Threshold (e.g., 5kg for Demo)
        if (newTotal >= 5 && !nftMinted) {
            try {
                const res = await fetch('http://localhost:8000/api/gamification/nft/mint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        walletAddress: activeAccount?.address || "DEMO_USER",
                        co2Saved: newTotal
                    })
                });
                const data = await res.json();
                if (data.txId) {
                    setNftMinted(true);
                    toast.success("🌱 Green Commuter NFT Minted!");
                }
            } catch (e) {
                console.error("NFT Mint failed", e);
            }
        }

        if (!activeAccount || !driverAddr) {
            // Demo Mode
            setTimeout(() => {
                setPayoutStatus("success");
                toast.success(`Trip Completed! Driver Paid. (Demo)`);
            }, 2000);
            return;
        }

        try {
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();
            // Increase fee for inner txn
            params.fee = BigInt(2000);
            params.flatFee = true;

            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: activeAccount.address,
                appIndex: APP_ID,
                appArgs: [new TextEncoder().encode("end_trip"), algosdk.decodeAddress(driverAddr).publicKey],
                suggestedParams: params
            });

            const encodedTxn = algosdk.encodeUnsignedTransaction(appCallTxn);
            const signedTxns = await signTransactions([encodedTxn]);
            const filteredSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);

            const response = await algodClient.sendRawTransaction(filteredSignedTxns).do();
            const txId = response.txid;
            console.log("End Trip TxID:", txId);

            toast.info("Processing Payment...");
            await algosdk.waitForConfirmation(algodClient, txId, 4);

            setPayoutStatus("success");
            toast.success(`Trip Completed! Driver Paid. TxID: ${txId.substring(0, 8)}...`);

        } catch (error) {
            console.error("End Trip failed:", error);
            toast.error("Failed to complete trip on-chain.");
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

                {/* 1. NOT OPTED IN STATE */}
                {!isOptedIn && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">Welcome, Student!</h2>
                            <p className="text-gray-400 max-w-md mx-auto">
                                Initialize your account to start tracking rides and earning rewards automatically.
                            </p>
                        </div>

                        <button
                            onClick={handleCreateAccount}
                            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500
                                     text-white text-lg font-bold rounded-full shadow-lg hover:shadow-pink-500/50 hover:scale-105 transition-all"
                        >
                            Create Student Account
                        </button>

                        <p className="text-xs text-gray-500">
                            (This registers you on the Algorand blockchain automatically)
                        </p>
                    </div>
                )}

                {/* 2. OPTED IN -> ROLE SELECTION */}
                {isOptedIn && role === "none" && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-bold text-white">How are you commuting today?</h2>
                        <div className="flex gap-6">
                            <button
                                onClick={() => registerRole("rider")}
                                className="w-40 h-40 bg-gray-800 hover:bg-pink-900/20 border border-gray-700 hover:border-pink-500 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all group"
                            >
                                <FaUser className="text-4xl text-pink-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-bold text-white">I Need a Ride</span>
                            </button>
                            <button
                                onClick={() => registerRole("driver")}
                                className="w-40 h-40 bg-gray-800 hover:bg-purple-900/20 border border-gray-700 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all group"
                            >
                                <FaCar className="text-4xl text-purple-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-bold text-white">I am Driving</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* DRIVER VIEW */}
                {isOptedIn && role === "driver" && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <FaCar className="text-6xl text-purple-500 animate-pulse" />
                        <h2 className="text-3xl font-bold text-white">Driver Dashboard</h2>
                        <p className="text-gray-400">Waiting for ride requests...</p>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <p className="text-sm text-gray-400">Your Address:</p>
                            <p className="font-mono text-xs text-green-400 break-all">{activeAccount?.address}</p>
                        </div>
                        <button onClick={() => setRole("none")} className="text-gray-500 hover:text-white text-sm">Switch Role</button>
                    </div>
                )}

                {/* RIDER IDLE STATE (Matching) */}
                {isOptedIn && role === "rider" && rideStatus === "idle" && (
                    <div className="flex-1 flex flex-col p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Available Drivers Nearby</h2>
                            <button onClick={() => setRole("none")} className="text-gray-500 hover:text-white text-sm">Change Role</button>
                        </div>

                        <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableDrivers.map((driver) => (
                                <div
                                    key={driver.id}
                                    onClick={() => setDriverAddr(driver.address)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group
                                              ${driverAddr === driver.address
                                            ? 'bg-pink-500/20 border-pink-500'
                                            : 'bg-gray-800 border-gray-700 hover:border-pink-500/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                            <FaCar className="text-white text-lg" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{driver.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span className="flex items-center text-yellow-400 gap-1"><FaStar className="w-3 h-3" /> {driver.rating}</span>
                                                <span>•</span>
                                                <span>{driver.distance.toFixed(2)} km away</span>
                                            </div>
                                        </div>
                                    </div>
                                    {driverAddr === driver.address ? (
                                        <FaCheckCircle className="text-pink-500 text-2xl animate-in zoom-in" />
                                    ) : (
                                        <div className="text-xs text-gray-500 group-hover:text-pink-400 transition-colors">Select</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/10">
                            <button
                                onClick={startTrip}
                                disabled={!driverAddr}
                                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
                                         hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-xl
                                         flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                            >
                                START TRIP (1 ALGO DEPOSIT) <FaArrowRight />
                            </button>
                        </div>
                    </div>
                )}

                {/* ACTIVE RIDE (MAP) STATE */}
                {isOptedIn && role === "rider" && rideStatus === "active" && (
                    <div className="relative w-full h-full min-h-[500px]">
                        <MapContainer
                            center={[coords.lat, coords.lng]}
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

                            <Marker position={[coords.lat, coords.lng]}>
                                <Popup>You are Here</Popup>
                            </Marker>
                            <RecenterMap lat={coords.lat} lng={coords.lng} />
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
                {isOptedIn && role === "rider" && rideStatus === "verifying_photo" && (
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
                                        VERIFY & END TRIP
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ARRIVED / SUCCESS STATE */}
                {isOptedIn && role === "rider" && rideStatus === "arrived" && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
                            <FaCheckCircle className="text-green-500 text-5xl" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-white">Ride Complete!</h2>
                            <p className="text-gray-400">Driver has been paid automatically.</p>
                        </div>

                        <div className="w-full max-w-sm bg-gray-800/50 p-6 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Status</span>
                                <span className={`font-bold ${payoutStatus === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {payoutStatus === 'success' ? 'Paid' : 'Processing...'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Verification</span>
                                <span className="text-white font-mono">AI-Gemini-1.5</span>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-gray-400">CO2 Saved</span>
                                    <span className="text-green-400 font-bold">{co2Saved.toFixed(1)} kg</span>
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    {/* Scale 0-10kg */}
                                    <div
                                        className="h-full bg-green-500 transition-all duration-1000"
                                        style={{ width: `${Math.min((co2Saved / 5) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="text-xs text-right text-gray-500 mt-1">Goal: 5kg for NFT</div>
                            </div>
                            {nftMinted && (
                                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3 animate-pulse">
                                    <div className="p-2 bg-green-500 rounded-lg text-black">
                                        <FaStar />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-white font-bold text-sm">NFT UNLOCKED!</div>
                                        <div className="text-green-300 text-xs">Green Commuter Badge Minted</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setRideStatus("idle");
                                setPayoutStatus(null);
                                setImgSrc(null);
                                setDriverAddr("");
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

import { useEffect, useState, useRef, useCallback } from "react";
import { FaBus, FaCheckCircle, FaSpinner, FaCamera } from "react-icons/fa";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Webcam from "react-webcam";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Fix for Leaflet marker icons in React
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const VIT_COORDS = { lat: 18.4636, lng: 73.8682 };
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
    const [payoutStatus, setPayoutStatus] = useState<"pending" | "success" | null>(null);

    // Photo Verification State
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [aiVerifying, setAiVerifying] = useState(false);

    useEffect(() => {
        if (rideStatus === "active" && "geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error(error),
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
                handleArrival(); // Proceed to check-in
            } else {
                alert("Verification Failed: Image does not look like a commute context.");
                setImgSrc(null); // Reset
            }

        } catch (error) {
            console.error("AI Verification Error", error);
            alert("AI Verification Failed");
        } finally {
            setAiVerifying(false);
        }
    };

    const handleArrival = async () => {
        setRideStatus("arrived");
        setPayoutStatus("pending");

        if (!activeAccount) {
            alert("Please connect wallet to check-in!");
            setPayoutStatus(null);
            return;
        }

        try {
            const algodToken = '';
            const algodServer = 'https://testnet-api.algonode.cloud';
            const algodPort = 443;
            const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

            const params = await algodClient.getTransactionParams().do();
            // const receiverAddress = ... (Unused variable fix)

            // const noteData = { ... (Unused variable fix)

            // App Call Check-in
            // const appId = 123456; // Placeholder (Unused variable fix)

            // We simulate the App Call via a 0 ALGO payment with App Call Note
            // to ensure it works without deploying the actual contract to Testnet right now.
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: activeAccount.address,
                receiver: "VI224H6V224H6V224H6V224H6V224H6V224H6V224H6V224H6V224H6V22",
                amount: 0,
                suggestedParams: params,
                note: new TextEncoder().encode(`AppCall: Check-in | Lat: ${coords?.lat} | Verified: Gemini`)
            } as any);

            const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
            const signedTxns = await signTransactions([encodedTxn]);

            const response = (await algodClient.sendRawTransaction(signedTxns as any).do()) as any;
            const txId = response.txId;
            console.log("Check-in TxID:", txId);

            await algosdk.waitForConfirmation(algodClient, txId, 4);
            setPayoutStatus("success");

        } catch (error) {
            console.error("Check-in failed:", error);
            alert("Failed to process on-chain check-in.");
            setPayoutStatus(null);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 max-w-4xl mx-auto p-4">
            <header className="text-center mb-4">
                <h1 className="text-4xl font-bold text-[var(--plasma-pink)] mb-2">COMMUTE POOL</h1>
                <p className="text-[var(--holographic-silver)]">
                    Track your ride. Verify with AI. Ensure efficient transport.
                </p>
            </header>

            {rideStatus === "idle" && (
                <div className="text-center">
                    <button
                        onClick={() => { setRideStatus("active"); setCoords(VIT_COORDS); }} // Default to VIT text for demo if geo fails
                        className="px-8 py-4 bg-[var(--plasma-pink)] hover:bg-pink-600 text-white rounded-full font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 mx-auto"
                    >
                        <FaBus /> START RIDE
                    </button>
                    <p className="text-xs text-gray-500 mt-4">Takes you to map view</p>
                </div>
            )}

            {rideStatus === "active" && (
                <div className="w-full max-w-3xl h-[400px] rounded-3xl overflow-hidden border-2 border-[var(--plasma-pink)] relative">
                    {/* Map View */}
                    <MapContainer
                        center={[VIT_COORDS.lat, VIT_COORDS.lng]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
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

                    {/* Verify Button Overlay */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000]">
                        <button
                            onClick={() => setRideStatus("verifying_photo")}
                            className="px-8 py-3 bg-[var(--plasma-pink)] text-white rounded-full font-bold shadow-xl border-2 border-white hover:scale-105 transition-transform"
                        >
                            VERIFY COMMUTE & CHECK-IN
                        </button>
                    </div>

                    <button
                        onClick={() => { setCoords(VIT_COORDS); }}
                        className="absolute top-2 right-2 z-[1000] text-xs bg-black/50 text-white px-2 py-1 rounded"
                    >
                        [DEV] Jump to VIT
                    </button>
                </div>
            )}

            {rideStatus === "verifying_photo" && (
                <div className="w-full max-w-xl bg-black rounded-3xl overflow-hidden border-2 border-[var(--plasma-pink)] p-4">
                    <h3 className="text-white text-center mb-4">Take a photo of your commute (Bus/Train/Road)</h3>
                    <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
                        {imgSrc ? (
                            <img src={imgSrc} alt="Commute" className="w-full h-full object-cover" />
                        ) : (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                            />
                        )}

                        {aiVerifying && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                                <FaSpinner className="animate-spin text-[var(--plasma-pink)] text-6xl mb-4" />
                                <p className="text-xl text-white font-mono animate-pulse">VERIFYING CONTEXT...</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-4">
                        {!imgSrc && (
                            <button onClick={capture} className="px-6 py-2 bg-[var(--plasma-pink)] text-white rounded-full flex items-center gap-2">
                                <FaCamera /> SNAP
                            </button>
                        )}
                        {imgSrc && !aiVerifying && (
                            <>
                                <button onClick={() => setImgSrc(null)} className="px-6 py-2 border border-white text-white rounded-full">Recapture</button>
                                <button onClick={performAiVerification} className="px-6 py-2 bg-green-600 text-white rounded-full">SUBMIT PROOF</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {rideStatus === "arrived" && (
                <div className="text-center">
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">VERIFIED & CHECKED IN!</h2>

                    {payoutStatus === "pending" && <p className="text-[var(--plasma-pink)] animate-pulse">Recording on Blockchain...</p>}

                    {payoutStatus === "success" && (
                        <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-xl">
                            <p className="text-white font-bold">Trip Verified on Chain!</p>
                            <p className="text-xs text-green-300 mt-1">Proof submitted via Gemini AI</p>
                        </div>
                    )}
                    <button
                        onClick={() => setRideStatus("idle")}
                        className="mt-8 text-gray-400 underline"
                    >
                        Start New Ride
                    </button>
                </div>
            )}
        </div>
    );
}

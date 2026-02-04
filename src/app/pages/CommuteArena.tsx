import { useEffect, useState } from "react";
import { FaBus, FaMapMarkerAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";

const VIT_COORDS = { lat: 18.4636, lng: 73.8682 };

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export function CommuteArena() {
    const [_coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [rideStatus, setRideStatus] = useState<"idle" | "active" | "arrived">("idle");
    const [payoutStatus, setPayoutStatus] = useState<"pending" | "success" | null>(null);
    const [walletAddress] = useState("ADDRESS_PLACEHOLDER"); // In real app, get from Context

    useEffect(() => {
        if (rideStatus === "active" && "geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoords({ lat: latitude, lng: longitude });
                    const dist = calculateDistance(latitude, longitude, VIT_COORDS.lat, VIT_COORDS.lng);
                    setDistance(dist);

                    if (dist < 0.5) { // Arrived if < 500m
                        handleArrival();
                    }
                },
                (error) => console.error(error),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [rideStatus]);

    const handleArrival = async () => {
        if (rideStatus !== "active") return;
        setRideStatus("arrived");
        setPayoutStatus("pending");

        try {
            const response = await fetch("http://localhost:8000/api/complete-ride", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress })
            });
            const data = await response.json();
            if (data.txId) {
                setPayoutStatus("success");
            }
        } catch (error) {
            console.error("Payout failed:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 max-w-4xl mx-auto p-4">
            <header className="text-center mb-4">
                <h1 className="text-4xl font-bold text-[var(--plasma-pink)] mb-2">COMMUTE POOL</h1>
                <p className="text-[var(--holographic-silver)]">
                    Decentralized verification for ride-sharing. Get reimbursed upon arrival.
                </p>
            </header>

            <div className="w-full max-w-xl bg-[var(--deep-charcoal)] rounded-3xl p-8 border border-[var(--plasma-pink)] shadow-[0_0_50px_rgba(255,0,100,0.1)] text-center">

                <div className="bg-black/40 p-4 rounded-xl mb-6">
                    <h3 className="text-[var(--plasma-pink)] font-bold mb-2">TARGET: VIT PUNE</h3>
                    <p className="font-mono text-sm text-[var(--holographic-silver)]">{VIT_COORDS.lat}, {VIT_COORDS.lng}</p>
                </div>

                {rideStatus === "idle" && (
                    <button
                        onClick={() => setRideStatus("active")}
                        className="px-8 py-4 bg-[var(--plasma-pink)] hover:bg-pink-600 text-white rounded-full font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 mx-auto"
                    >
                        <FaBus /> START RIDE
                    </button>
                )}

                {rideStatus === "active" && (
                    <div>
                        <FaSpinner className="animate-spin text-4xl text-[var(--plasma-pink)] mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Tracking Location...</h2>
                        {distance !== null && (
                            <p className="text-4xl font-mono text-white mb-4">
                                {distance.toFixed(3)} <span className="text-lg text-[var(--holographic-silver)]">km away</span>
                            </p>
                        )}
                        <p className="text-sm text-[var(--holographic-silver)]">Move closer to destination (0.5km) to trigger payout.</p>
                    </div>
                )}

                {rideStatus === "arrived" && (
                    <div>
                        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">YOU HAVE ARRIVED!</h2>

                        {payoutStatus === "pending" && <p className="text-[var(--plasma-pink)] animate-pulse">Processing Payout...</p>}

                        {payoutStatus === "success" && (
                            <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-xl">
                                <p className="text-white font-bold">REIMBURSEMENT SENT!</p>
                                <p className="text-xs text-green-300 mt-1">Check your Algorand Wallet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
                <div className="bg-black/30 p-4 rounded-xl text-center">
                    <FaMapMarkerAlt className="mx-auto text-[var(--plasma-pink)] mb-2" />
                    <p className="text-xs text-[var(--holographic-silver)]">Live Tracking</p>
                </div>
                <div className="bg-black/30 p-4 rounded-xl text-center">
                    <FaBus className="mx-auto text-[var(--plasma-pink)] mb-2" />
                    <p className="text-xs text-[var(--holographic-silver)]">Carpool Verified</p>
                </div>
            </div>

        </div>
    );
}

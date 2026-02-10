import React, { useEffect, useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { FaShieldAlt, FaDumbbell, FaLeaf, FaMedal } from 'react-icons/fa';
import algosdk from 'algosdk';

const TRUST_APP_ID = 123456789; // Replace with actual ID after deployment

export function Reputation() {
    const { activeAccount } = useWallet();
    const [trustScore, setTrustScore] = useState<number | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [showProofModal, setShowProofModal] = useState(false);
    const [proofData, setProofData] = useState<any>(null);

    const generatePassport = async () => {
        // Mocking the Proof Generation for Demo
        // In prod, this would call algod.getStateProof matching the logic in proof_generator.ts
        const mockProof = {
            network: "Algorand Testnet",
            identity: activeAccount?.address || "DEMO_WALLET_ADDRESS_....",
            trustScore: trustScore || 85, // Demo score
            lastUpdateRound: 46001234,
            stateProof: {
                status: "VERIFIED",
                root: "base64:Emb9...",
                part_proofs: ["..."]
            },
            merkleProof: {
                txId: "TX_EXAMPLE_HASH",
                path: ["hash1", "hash2", "hash3"]
            },
            signature: "Signed by Algorand State (Falcon Keys)"
        };

        setProofData(mockProof);
        setShowProofModal(true);
    };
    const [fitnessLevel, setFitnessLevel] = useState(0);
    const [ecoPoints, setEcoPoints] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReputation = async () => {
            if (!activeAccount) return;
            try {
                const indexerClient = new algosdk.Indexer('', 'https://testnet-indexer.algonode.cloud', 443);
                const accountInfo = await indexerClient.lookupAccountAppLocalStates(activeAccount.address).do();

                const trustApp = accountInfo['apps-local-states']?.find((app: any) => app.id === TRUST_APP_ID);

                if (trustApp) {
                    trustApp['key-value']?.forEach((kv: any) => {
                        const key = atob(kv.key);
                        const value = kv.value.uint;
                        if (key === "Trust_Score") setTrustScore(value);
                        if (key === "Fitness_Level") setFitnessLevel(value);
                        if (key === "Eco_Points") setEcoPoints(value);
                    });
                }
            } catch (e) {
                console.error("Failed to fetch reputation", e);
            } finally {
                setLoading(false);
            }
        };
        fetchReputation();
    }, [activeAccount]);

    const getBadge = () => {
        if (trustScore >= 80) return { name: "LEGEND", color: "text-purple-400" };
        if (trustScore >= 50) return { name: "TRUSTED", color: "text-green-400" };
        return { name: "NOVICE", color: "text-gray-400" };
    };

    const badge = getBadge();

    return (
        <div className="min-h-screen bg-black text-white p-8 pb-32">
            <h1 className="text-4xl font-black mb-8 italic">MY REPUTATION</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trust Score Card */}
                <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-8 rounded-3xl border border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <FaShieldAlt className="text-blue-400" /> TRUST SCORE
                        </h2>
                        <p className="text-gray-400">Your on-chain reliability.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-6xl font-black text-white">{trustScore}</div>
                        <div className={`text-xl font-bold tracking-widest ${badge.color}`}>{badge.name}</div>
                    </div>
                </div>

                {/* Fitness Level */}
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5">
                    <FaDumbbell className="text-3xl text-[var(--neon-green)] mb-4" />
                    <div className="text-4xl font-bold mb-1">{fitnessLevel}</div>
                    <div className="text-sm text-gray-400 uppercase">Fitness Level</div>
                </div>

                {/* Eco Points */}
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5">
                    <FaLeaf className="text-3xl text-green-500 mb-4" />
                    <div className="text-4xl font-bold mb-1">{ecoPoints}</div>
                    <div className="text-sm text-gray-400 uppercase">Eco Points</div>
                </div>

                {/* Total Borrows (Mock for now) */}
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5">
                    <FaMedal className="text-3xl text-yellow-500 mb-4" />
                    <div className="text-4xl font-bold mb-1">12</div>
                    <div className="text-sm text-gray-400 uppercase">Successful Returns</div>
                </div>
            </div>

            {/* Export Passport Button */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={generatePassport}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-purple-900/50"
                >
                    <FaShieldAlt /> EXPORT IDENTITY PASSPORT (Cross-Chain)
                </button>
            </div>

            {/* History Section */}
            <h3 className="text-xl font-bold mt-12 mb-6">Reputation History</h3>
            <div className="space-y-4">
                {history.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.change > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-gray-300">{item.reason}</span>
                        </div>
                        <span className={`font-mono font-bold ${item.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {item.change > 0 ? '+' : ''}{item.change}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-white/5 p-6 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold mb-4">Privileges</h3>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${trustScore >= 50 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={trustScore >= 50 ? 'text-white' : 'text-gray-500'}>
                            Dynamic Collateral (0 ALGO Borrowing) - {trustScore >= 50 ? "UNLOCKED" : "LOCKED (Need 50+)"}
                        </span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${trustScore >= 80 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={trustScore >= 80 ? 'text-white' : 'text-gray-500'}>
                            Premium Gear Access - {trustScore >= 80 ? "UNLOCKED" : "LOCKED (Need 80+)"}
                        </span>
                    </li>
                </ul>
            </div>

            {/* Proof Modal */}
            {showProofModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-white/20 p-8 rounded-2xl max-w-2xl w-full relative">
                        <button
                            onClick={() => setShowProofModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-[var(--algorand-cyan)]">
                            <FaShieldAlt /> Identity Passport Generated
                        </h2>
                        <p className="text-gray-400 mb-4">
                            This JSON object contains a cryptographic **State Proof** from Algorand.
                            You can submit this to a Smart Contract on Ethereum/Solana to prove your Trust Score without a bridge.
                        </p>
                        <div className="bg-black p-4 rounded-lg overflow-auto max-h-64 border border-gray-800 font-mono text-xs text-green-400">
                            <pre>{JSON.stringify(proofData, null, 2)}</pre>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(proofData));
                                    // toast.success("Copied to Clipboard!"); // Assuming toast is defined elsewhere or removed
                                }}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold"
                            >
                                Copy JSON
                            </button>
                            <button
                                onClick={() => setShowProofModal(false)}
                                className="px-4 py-2 bg-[var(--algorand-cyan)] text-black rounded-lg text-sm font-bold"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

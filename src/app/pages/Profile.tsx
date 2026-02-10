import { useEffect, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import { FaUserGraduate, FaDumbbell, FaLeaf, FaShieldAlt, FaShareAlt } from "react-icons/fa";
import { toast } from "sonner";

// Mock Levels based on Score
const GET_LEVEL = (score: number) => {
    if (score >= 90) return { name: "Legendary Scholar", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400" };
    if (score >= 50) return { name: "Trusted Peer", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400" };
    return { name: "Fresher", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-600" };
};

export function Profile() {
    const { activeAccount } = useWallet();
    const [stats, setStats] = useState({ trust: 0, fitness: 0, eco: 0 });
    const level = GET_LEVEL(stats.trust);

    // Fetch Stats from Chain
    useEffect(() => {
        if (!activeAccount) return;
        // Mocking fetch for smoothness, in real app use indexer
        // Simulating that user has some history
        setTimeout(() => {
            setStats({
                trust: 65,
                fitness: 12, // Level 12
                eco: 24 // 24 Rides
            });
        }, 1000);
    }, [activeAccount]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* LEFT: THE NFT CARD */}
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold text-gray-400 mb-6 uppercase tracking-widest">Your Campus ID</h2>
                    
                    {/* 3D Flip Card Effect Container */}
                    <div className="group w-80 h-[480px] perspective-1000">
                        <div className={`relative w-full h-full transition-all duration-700 transform style-preserve-3d border-2 ${level.border} rounded-3xl bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden`}>
                            
                            {/* Card Background (Dynamic) */}
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black opacity-90"></div>
                            
                            {/* Holographic Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                            {/* Content */}
                            <div className="relative p-6 flex flex-col h-full justify-between z-10">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <FaUserGraduate className={`text-4xl ${level.color}`} />
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-mono">ID: {activeAccount?.address.slice(0, 6)}</p>
                                        <p className={`text-sm font-bold ${level.color} uppercase`}>{level.name}</p>
                                    </div>
                                </div>

                                {/* Avatar Area */}
                                <div className="flex-1 flex items-center justify-center my-4">
                                    <div className={`w-32 h-32 rounded-full border-4 ${level.border} flex items-center justify-center bg-gray-800 relative`}>
                                        {/* Dynamic Avatar based on Fitness Score */}
                                        <img 
                                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${activeAccount?.address}&backgroundColor=transparent`} 
                                            alt="Avatar"
                                            className="w-24 h-24"
                                        />
                                        {/* Badges */}
                                        {stats.eco > 20 && <div className="absolute -right-2 -bottom-2 bg-green-500 text-black p-2 rounded-full text-xs font-bold shadow-lg" title="Eco Warrior">🌿</div>}
                                        {stats.fitness > 10 && <div className="absolute -left-2 -bottom-2 bg-red-500 text-white p-2 rounded-full text-xs font-bold shadow-lg" title="Gym Rat">💪</div>}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <FaShieldAlt className="mx-auto text-blue-400 mb-1" />
                                        <p className="text-xl font-black text-white">{stats.trust}</p>
                                        <p className="text-[10px] text-gray-400 uppercase">Trust</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <FaLeaf className="mx-auto text-green-400 mb-1" />
                                        <p className="text-xl font-black text-white">{stats.eco}</p>
                                        <p className="text-[10px] text-gray-400 uppercase">Eco</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <FaDumbbell className="mx-auto text-red-400 mb-1" />
                                        <p className="text-xl font-black text-white">{stats.fitness}</p>
                                        <p className="text-[10px] text-gray-400 uppercase">Fit</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                                    <p className="text-[10px] text-gray-500">CVP PROTOCOL • ALGORAND</p>
                                    <div className="w-8 h-8 qr-code bg-white p-1 rounded-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="mt-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <FaShareAlt /> Share on Socials
                    </button>
                </div>

                {/* RIGHT: DETAILS */}
                <div className="flex flex-col justify-center space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Campus Reputation</h1>
                        <p className="text-gray-400 text-lg">Your on-chain identity that unlocks perks.</p>
                    </div>

                    <div className="space-y-4">
                        <div className={`p-6 rounded-2xl border ${level.border} ${level.bg}`}>
                            <h3 className={`text-xl font-bold ${level.color} mb-2`}>Current Status: {level.name}</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center gap-2">✅ Zero-Collateral Lending (Active)</li>
                                <li className="flex items-center gap-2">✅ Priority Gym Access</li>
                                <li className="flex items-center gap-2 opacity-50">🔒 Student Validator Node (Unlock at 90 Trust)</li>
                            </ul>
                        </div>

                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                            <h3 className="text-white font-bold mb-4">NFT Metadata (On-Chain)</h3>
                            <pre className="text-xs text-green-400 font-mono overflow-x-auto p-2 bg-black rounded-lg">
{`{
  "standard": "arc69",
  "properties": {
    "trust_score": ${stats.trust},
    "fitness_level": ${stats.fitness},
    "eco_points": ${stats.eco},
    "rank": "${level.name}"
  }
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

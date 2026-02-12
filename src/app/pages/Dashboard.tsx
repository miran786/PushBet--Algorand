import { Link } from "react-router";
import { FaDumbbell, FaBroom, FaHandHoldingHeart, FaBus, FaStore } from "react-icons/fa";

export function Dashboard() {
    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--algorand-cyan)] to-[var(--electric-volt)] bg-clip-text text-transparent mb-2">
                    CAMPUS VITALITY PROTOCOL
                </h1>
                <p className="text-[var(--holographic-silver)] text-lg">
                    Decentralized verification for a better campus life.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fitness Arena */}
                <Link to="/fitness" className="group relative overflow-hidden rounded-2xl bg-[var(--deep-charcoal)] border border-[var(--algorand-cyan)]/20 hover:border-[var(--algorand-cyan)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] transform hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--algorand-cyan)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-[var(--algorand-cyan)]/20 text-[var(--algorand-cyan)]">
                                <FaDumbbell size={32} />
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                LIVE
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[var(--algorand-cyan)] transition-colors">
                            Fitness Arena
                        </h2>
                        <p className="text-[var(--holographic-silver)]">
                            Compete in pushup battles verified by AI. Stake ALGO, win rewards.
                        </p>
                    </div>
                </Link>

                {/* Civic Sense */}
                <Link to="/civic" className="group relative overflow-hidden rounded-2xl bg-[var(--deep-charcoal)] border border-[var(--neon-purple)]/20 hover:border-[var(--neon-purple)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(180,0,255,0.2)] transform hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-purple)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-[var(--neon-purple)]/20 text-[var(--neon-purple)]">
                                <FaBroom size={32} />
                            </div>

                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[var(--neon-purple)] transition-colors">
                            Civic Sense
                        </h2>
                        <p className="text-[var(--holographic-silver)]">
                            Keep the campus clean. Snap a photo, get verified by Vision AI, earn tokens.
                        </p>
                    </div>
                </Link>

                {/* Asset Lending */}
                <Link to="/asset" className="group relative overflow-hidden rounded-2xl bg-[var(--deep-charcoal)] border border-[var(--electric-volt)]/20 hover:border-[var(--electric-volt)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,230,0,0.2)] transform hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--electric-volt)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-[var(--electric-volt)]/20 text-[var(--electric-volt)]">
                                <FaHandHoldingHeart size={32} />
                            </div>

                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[var(--electric-volt)] transition-colors">
                            Asset Lending
                        </h2>
                        <p className="text-[var(--holographic-silver)]">
                            Borrow equipment with QR + Smart Contract collateral. No loss, no fraud.
                        </p>
                    </div>
                </Link>

                {/* Commute Pool */}
                <Link to="/commute" className="group relative overflow-hidden rounded-2xl bg-[var(--deep-charcoal)] border border-[var(--plasma-pink)]/20 hover:border-[var(--plasma-pink)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,100,0.2)] transform hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--plasma-pink)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-[var(--plasma-pink)]/20 text-[var(--plasma-pink)]">
                                <FaBus size={32} />
                            </div>

                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[var(--plasma-pink)] transition-colors">
                            Commute Pool
                        </h2>
                        <p className="text-[var(--holographic-silver)]">
                            Split rides. Geo-fenced auto-payouts when you reach the campus.
                        </p>
                    </div>
                </Link>

                {/* Marketplace */}
                <Link to="/marketplace" className="group relative overflow-hidden rounded-2xl bg-[var(--deep-charcoal)] border border-orange-500/20 hover:border-orange-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,165,0,0.2)] transform hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-orange-500/20 text-orange-500">
                                <FaStore size={32} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                            Marketplace
                        </h2>
                        <p className="text-[var(--holographic-silver)]">
                            Describe any need. AI builds the contract. Algorand pays on proof.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

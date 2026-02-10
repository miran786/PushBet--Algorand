import React, { useEffect, useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { FaCheckCircle, FaTimesCircle, FaGavel } from 'react-icons/fa';
import { toast } from "sonner";

export function ValidatorNode() {
    const { activeAccount } = useWallet();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignments = async () => {
        if (!activeAccount) return;
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8000/api/civic/validator/assignments?walletAddress=${activeAccount.address}`);
            const data = await res.json();
            setAssignments(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [activeAccount]);

    const handleVote = async (submissionId: string, vote: 'clean' | 'messy') => {
        try {
            const res = await fetch('http://localhost:8000/api/civic/validator/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionId,
                    walletAddress: activeAccount?.address,
                    vote
                })
            });
            const data = await res.json();
            toast.success(vote === 'clean' ? "Voted Clean! (+1 Trust)" : "Voted Messy");

            // Remove from list
            setAssignments(prev => prev.filter(a => a._id !== submissionId));

        } catch (e) {
            toast.error("Vote failed");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 pb-32">
            <header className="mb-8">
                <h1 className="text-4xl font-black italic flex items-center gap-3">
                    <FaGavel className="text-[var(--algorand-cyan)]" /> VALIDATOR NODE
                </h1>
                <p className="text-gray-400">Review pending claims. Earn $TRUST for honest consensus.</p>
            </header>

            {loading ? (
                <div>Loading assignments...</div>
            ) : assignments.length === 0 ? (
                <div className="bg-gray-900/50 p-12 rounded-3xl text-center border border-white/5">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="text-gray-600 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-300">No Assignments</h2>
                    <p className="text-gray-500">You're all caught up! Check back later for more verification tasks.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((assignment) => (
                        <div key={assignment._id} className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden p-4">
                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                                <img src={assignment.imageUrl} alt="Claim" className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-[var(--algorand-cyan)]">
                                    AI Conf: {(assignment.aiConfidence * 100).toFixed(0)}%
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleVote(assignment._id, 'clean')}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <FaCheckCircle /> CLEAN
                                </button>
                                <button
                                    onClick={() => handleVote(assignment._id, 'messy')}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <FaTimesCircle /> MESSY
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

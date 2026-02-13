import { useState, useEffect } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import { toast } from "sonner";
import { FaRobot, FaBrain, FaLock, FaCheckCircle, FaTimes, FaCamera, FaCoins, FaClock, FaArrowRight } from "react-icons/fa";
import { MarketplaceChat } from "../components/MarketplaceChat";

const API = "http://localhost:8000/api/marketplace";

const CATEGORY_MAP: Record<string, { icon: string; color: string }> = {
    lost_item: { icon: "🔑", color: "text-red-400" },
    notes: { icon: "📚", color: "text-blue-400" },
    errand: { icon: "🏃", color: "text-green-400" },
    tutoring: { icon: "🎓", color: "text-purple-400" },
    transport: { icon: "🚗", color: "text-yellow-400" },
    food: { icon: "🍕", color: "text-orange-400" },
    electronics: { icon: "💻", color: "text-cyan-400" },
    other: { icon: "⚡", color: "text-gray-400" },
    general: { icon: "⚡", color: "text-gray-400" },
};

interface Need {
    _id: string;
    requesterWallet: string;
    description: string;
    reward: number;
    status: string;
    category: string;
    aiTerms: string;
    claimedBy: string | null;
    createdAt: string;
    expiresAt: string;
}

export function Marketplace() {
    const { activeAccount, signTransactions } = useWallet();
    const [activeTab, setActiveTab] = useState<"browse" | "post">("browse");
    const [needs, setNeeds] = useState<Need[]>([]);

    // Post a Need state
    const [needDescription, setNeedDescription] = useState("");
    const [needReward, setNeedReward] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [aiResponse, setAiResponse] = useState<{ category: string; terms: string } | null>(null);
    const [postStep, setPostStep] = useState<"describe" | "review" | "done">("describe");

    // Fulfill state
    const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
    const [proofDescription, setProofDescription] = useState("");
    const [proofImage, setProofImage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ verified: boolean; confidence: number; reason: string } | null>(null);

    // Fetch needs
    const fetchNeeds = async () => {
        try {
            const res = await fetch(`${API}/needs`);
            const data = await res.json();
            if (data.success) setNeeds(data.needs);
        } catch (err) {
            console.error("Failed to fetch needs:", err);
        }
    };

    useEffect(() => {
        fetchNeeds();
    }, []);

    // Post a new need
    const handlePostNeed = async () => {
        if (!activeAccount) return toast.error("Connect your wallet first!");
        if (!needDescription.trim()) return toast.error("Describe what you need!");

        setIsPosting(true);
        try {
            // 1. Payment Transaction (Deposit Reward)
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();
            const rewardMicroAlgos = Math.floor((parseFloat(needReward) || 1) * 1000000);

            // House Wallet for Escrow
            const HOUSE_WALLET = "BSAWKZW5UMSYL7JGGVHT72RN7WMEEAV5KXWATHVZDEQ67EHWFYN6QB5Z4I";

            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: activeAccount.address,
                receiver: HOUSE_WALLET,
                amount: rewardMicroAlgos,
                note: new TextEncoder().encode(`AI Marketplace Bounty: ${needDescription.substring(0, 20)}...`),
                suggestedParams: params
            });

            const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
            toast.info("Please sign the transaction to deposit the reward.");
            const signedTxns = await signTransactions([encodedTxn]);
            const filteredSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);

            const response = await algodClient.sendRawTransaction(filteredSignedTxns).do();
            const txId = response.txid;
            toast.info("Transaction sent! Waiting for confirmation...");
            await algosdk.waitForConfirmation(algodClient, txId, 4);

            // 2. Create Need in Backend
            const res = await fetch(`${API}/needs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description: needDescription,
                    reward: parseFloat(needReward) || 1,
                    requesterWallet: activeAccount.address,
                    escrowTxId: txId // Send TxID to backend
                }),
            });
            const data = await res.json();
            if (data.success) {
                setAiResponse({ category: data.need.category, terms: data.need.aiTerms });
                setPostStep("review");
                toast.success("AI analyzed your need! Reward deposited.");
            } else {
                toast.error(data.message || "Failed to post need");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to post need (Transaction or Server Error).");
        } finally {
            setIsPosting(false);
        }
    };

    const confirmPost = () => {
        setPostStep("done");
        toast.success("Need posted to the marketplace!");
        fetchNeeds();
        // Reset after delay
        setTimeout(() => {
            setPostStep("describe");
            setNeedDescription("");
            setNeedReward("");
            setAiResponse(null);
        }, 3000);
    };

    // Claim a need
    const handleClaim = async (need: Need) => {
        if (!activeAccount) return toast.error("Connect your wallet first!");
        if (need.requesterWallet === activeAccount.address) return toast.error("Can't claim your own need!");

        try {
            const res = await fetch(`${API}/needs/${need._id}/claim`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ claimerWallet: activeAccount.address }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Need claimed! Submit proof to earn the reward.");
                setSelectedNeed({ ...need, status: "claimed", claimedBy: activeAccount.address });
                fetchNeeds();
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Server error.");
        }
    };

    // Submit proof
    const handleSubmitProof = async () => {
        if (!selectedNeed || !activeAccount || !proofDescription.trim()) return;

        setIsSubmitting(true);
        setVerificationResult(null);
        try {
            const res = await fetch(`${API}/needs/${selectedNeed._id}/submit-proof`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    claimerWallet: activeAccount.address,
                    proofDescription,
                    proofImage,
                }),
            });
            const data = await res.json();
            setVerificationResult({
                verified: data.verified,
                confidence: data.confidence,
                reason: data.reason,
            });
            if (data.verified) {
                toast.success("Proof verified! Reward released! 🎉");
                fetchNeeds();
            } else {
                toast.error("Proof rejected.");
            }
        } catch {
            toast.error("Verification failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Image upload handler
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setProofImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    // Time remaining
    const getTimeRemaining = (expiresAt: string) => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return "Expired";
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${mins}m`;
    };

    const cat = (c: string) => CATEGORY_MAP[c] || CATEGORY_MAP.general;

    return (
        <div className="text-white p-4 max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-black italic flex items-center gap-3">
                    <FaBrain className="text-[var(--neon-purple)]" /> AI MARKETPLACE
                </h1>
                <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mt-4 max-w-4xl leading-relaxed italic border-l-4 border-pink-500 pl-6 py-4 bg-white/5 rounded-r-xl shadow-lg backdrop-blur-sm">
                    "You can contract anything—sky is the limit. AI builds the contract. Algorand pays on proof."
                </p>

                {/* Tabs */}
                <div className="flex gap-2 mt-6">
                    <button
                        onClick={() => setActiveTab("browse")}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "browse"
                            ? "bg-[var(--neon-purple)] text-white shadow-lg shadow-purple-500/20"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                    >
                        🔍 Browse Needs
                    </button>
                    <button
                        onClick={() => setActiveTab("post")}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "post"
                            ? "bg-[var(--electric-volt)] text-black shadow-lg shadow-yellow-500/20"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                    >
                        ✨ Post a Need
                    </button>
                </div>
            </header>

            {/* ═══════════════ POST A NEED TAB ═══════════════ */}
            {activeTab === "post" && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        {/* Chat-style header */}
                        <div className="p-5 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-b border-white/10 flex items-center gap-3">
                            <div className="p-3 bg-[var(--neon-purple)] rounded-xl text-white">
                                <FaRobot className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">AI Contract Builder</h3>
                                <p className="text-[10px] text-purple-300 uppercase font-black tracking-widest">
                                    Powered by Gemini × Algorand
                                </p>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Step 1: Describe */}
                            {postStep === "describe" && (
                                <>
                                    <MarketplaceChat
                                        onContractReady={(need) => {
                                            setNeedDescription(need.description);
                                            setNeedReward(need.reward.toString());
                                            toast.success("Contract terms finalized! Review and Pay.");
                                        }}
                                    />

                                    {/* Confirmation Actions */}
                                    {needDescription && needReward && (
                                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-fade-in">
                                            <h4 className="text-green-400 font-bold mb-2">Contract Ready to Sign</h4>
                                            <p className="text-sm text-gray-300 mb-4">{needDescription} ({needReward} ALGO)</p>
                                            <button
                                                onClick={handlePostNeed}
                                                disabled={isPosting}
                                                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isPosting ? <div className="animate-spin text-xl">⏳</div> : <FaBrain />}
                                                SIGN & DEPOSIT {needReward} ALGO
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Step 2: Review AI Terms */}
                            {postStep === "review" && aiResponse && (
                                <>
                                    <div className="bg-gray-800/50 rounded-2xl p-4 border border-white/5">
                                        <p className="text-gray-300 text-sm">
                                            <FaRobot className="inline mr-2 text-purple-400" />
                                            I've analyzed your request and built the smart contract terms:
                                        </p>
                                    </div>

                                    {/* Your Need */}
                                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Your Need</p>
                                        <p className="text-white">{needDescription}</p>
                                    </div>

                                    {/* Category Badge */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{cat(aiResponse.category).icon}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${cat(aiResponse.category).color} border-current/20 bg-current/5`}>
                                            {aiResponse.category.replace("_", " ")}
                                        </span>
                                    </div>

                                    {/* AI Contract Terms */}
                                    <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-5 border border-purple-500/30">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FaLock className="text-purple-400" />
                                            <h4 className="text-sm font-black text-purple-300 uppercase tracking-wider">AI Smart Contract Terms</h4>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{aiResponse.terms}</p>
                                    </div>

                                    {/* Reward */}
                                    <div className="flex items-center justify-between bg-black/30 rounded-xl p-4 border border-yellow-500/20">
                                        <span className="text-gray-400 text-sm font-bold">Reward Locked:</span>
                                        <span className="text-2xl font-black text-[var(--electric-volt)]">
                                            {needReward || "1"} <span className="text-sm">ALGO</span>
                                        </span>
                                    </div>

                                    <button
                                        onClick={confirmPost}
                                        className="w-full py-4 bg-[var(--electric-volt)] text-black font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                                    >
                                        <FaLock /> POST TO MARKETPLACE
                                    </button>
                                </>
                            )}

                            {/* Step 3: Done */}
                            {postStep === "done" && (
                                <div className="text-center py-8">
                                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4 animate-bounce" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Need Posted!</h3>
                                    <p className="text-gray-400">Your need is now live on the AI Marketplace.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* ═══════════════ BROWSE NEEDS TAB ═══════════════ */}
            {
                activeTab === "browse" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-500">{needs.length} active need{needs.length !== 1 ? "s" : ""}</p>
                            <button onClick={fetchNeeds} className="text-xs bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-400">
                                Refresh
                            </button>
                        </div>

                        {needs.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                <FaRobot className="text-5xl mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-bold">No open needs yet.</p>
                                <p className="text-sm mt-1">Be the first to post one!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {needs.map((need) => (
                                    <div
                                        key={need._id}
                                        className="group bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/5"
                                    >
                                        {/* Category & Timer */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{cat(need.category).icon}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${cat(need.category).color}`}>
                                                    {need.category.replace("_", " ")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <FaClock />
                                                {getTimeRemaining(need.expiresAt)}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-white font-medium text-sm mb-3 leading-relaxed line-clamp-3">
                                            {need.description}
                                        </p>

                                        {/* AI Terms (collapsible) */}
                                        <details className="mb-4">
                                            <summary className="text-[10px] text-purple-400 uppercase font-black tracking-wider cursor-pointer hover:text-purple-300 transition-colors">
                                                AI Contract Terms ▸
                                            </summary>
                                            <p className="text-xs text-gray-400 mt-2 leading-relaxed bg-black/30 rounded-lg p-3 border border-purple-500/10">
                                                {need.aiTerms}
                                            </p>
                                        </details>

                                        {/* Reward & Requester */}
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-black">Reward</p>
                                                <p className="text-xl font-black text-[var(--electric-volt)]">
                                                    {need.reward} <span className="text-xs text-gray-500">ALGO</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-500 uppercase font-black">Posted by</p>
                                                <p className="text-[10px] font-mono text-gray-400">
                                                    {need.requesterWallet.slice(0, 6)}...{need.requesterWallet.slice(-4)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {need.status === "open" ? (
                                            <button
                                                onClick={() => handleClaim(need)}
                                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
                                            >
                                                ACCEPT & FULFILL <FaArrowRight />
                                            </button>
                                        ) : need.status === "claimed" && need.claimedBy === activeAccount?.address ? (
                                            <button
                                                onClick={() => {
                                                    setSelectedNeed(need);
                                                    setVerificationResult(null);
                                                    setProofDescription("");
                                                    setProofImage("");
                                                }}
                                                className="w-full py-3 bg-[var(--electric-volt)] text-black font-bold rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                                            >
                                                SUBMIT PROOF <FaCamera />
                                            </button>
                                        ) : need.status === "claimed" ? (
                                            <div className="w-full py-3 bg-gray-800 text-gray-500 font-bold rounded-xl text-center text-sm">
                                                Claimed by another student
                                            </div>
                                        ) : (
                                            <div className="w-full py-3 bg-green-900/30 text-green-400 font-bold rounded-xl text-center text-sm border border-green-500/20">
                                                ✅ Completed
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {/* ═══════════════ PROOF SUBMISSION MODAL ═══════════════ */}
            {
                selectedNeed && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="w-full max-w-lg bg-gray-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="p-5 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-b border-white/10 flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500 rounded-lg text-white">
                                        <FaBrain />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">Submit Proof</h3>
                                        <p className="text-[10px] text-purple-300 uppercase font-black tracking-widest">
                                            AI Verification Oracle
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedNeed(null); setVerificationResult(null); }}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {!verificationResult ? (
                                    <>
                                        {/* Original Need */}
                                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Original Need</p>
                                            <p className="text-white text-sm">{selectedNeed.description}</p>
                                        </div>

                                        {/* Required Proof */}
                                        <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                                            <p className="text-[10px] text-purple-400 uppercase font-black mb-1 flex items-center gap-1">
                                                <FaLock /> Required Proof
                                            </p>
                                            <p className="text-gray-300 text-sm">{selectedNeed.aiTerms}</p>
                                        </div>

                                        {/* Proof Description */}
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-2 uppercase font-black tracking-wider">
                                                Your Proof Description
                                            </label>
                                            <textarea
                                                value={proofDescription}
                                                onChange={(e) => setProofDescription(e.target.value)}
                                                placeholder="Describe how you fulfilled this need..."
                                                rows={3}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all resize-none"
                                            />
                                        </div>

                                        {/* Photo Upload */}
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-2 uppercase font-black tracking-wider">
                                                Proof Photo (optional)
                                            </label>
                                            <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-purple-500 transition-colors">
                                                <FaCamera className="text-gray-500" />
                                                <span className="text-sm text-gray-500">
                                                    {proofImage ? "✅ Photo attached" : "Click to upload photo"}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                            {proofImage && (
                                                <img src={proofImage} alt="proof" className="mt-2 w-full h-32 object-cover rounded-lg border border-white/10" />
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={handleSubmitProof}
                                            disabled={isSubmitting || !proofDescription.trim()}
                                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    AI Verifying Proof...
                                                </>
                                            ) : (
                                                <>
                                                    <FaBrain /> SUBMIT FOR AI VERIFICATION
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    /* Verification Result */
                                    <div className="text-center py-6">
                                        {verificationResult.verified ? (
                                            <>
                                                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4 animate-bounce" />
                                                <h3 className="text-2xl font-bold text-white mb-2">PROOF VERIFIED ✅</h3>
                                                <p className="text-green-400 font-mono mb-4">
                                                    Confidence: {(verificationResult.confidence * 100).toFixed(1)}%
                                                </p>
                                                <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/20 mb-4">
                                                    <p className="text-sm text-green-300">{verificationResult.reason}</p>
                                                </div>
                                                <div className="bg-[var(--electric-volt)]/10 rounded-xl p-4 border border-yellow-500/30">
                                                    <p className="text-[var(--electric-volt)] font-bold text-lg">
                                                        💰 {selectedNeed.reward} ALGO Released!
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <FaTimes className="text-red-500 text-6xl mx-auto mb-4" />
                                                <h3 className="text-2xl font-bold text-white mb-2">PROOF REJECTED ❌</h3>
                                                <p className="text-red-400 font-mono mb-4">
                                                    Confidence: {(verificationResult.confidence * 100).toFixed(1)}%
                                                </p>
                                                <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/20 mb-4">
                                                    <p className="text-sm text-red-300">{verificationResult.reason}</p>
                                                </div>
                                                <button
                                                    onClick={() => setVerificationResult(null)}
                                                    className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors font-bold"
                                                >
                                                    Try Again
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

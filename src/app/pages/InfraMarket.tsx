import { useState } from "react";
import { FaBuilding, FaVoteYea, FaCoins, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";

export function InfraMarket() {
    const { activeAccount, signTransactions } = useWallet();
    const [proposals, setProposals] = useState([
        {
            id: 1,
            title: "New Coffee Machine (Canteen)",
            description: "High-quality espresso machine for the student center.",
            target: 500,
            raised: 120,
            image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800",
            nftId: 0 // Mock NFT ID
        },
        {
            id: 2,
            title: "Ergonomic Benches (Garden)",
            description: "Comfortable seating for the campus garden area.",
            target: 2000,
            raised: 450,
            image: "https://images.unsplash.com/photo-1562664348-2182b3712081?w=800",
            nftId: 0
        }
    ]);

    const handleFund = async (id: number) => {
        if (!activeAccount) {
            toast.error("Connect Wallet to Fund");
            return;
        }

        try {
            // Mock Funding Transaction
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();

            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: activeAccount.address,
                receiver: activeAccount.address, // Self-send for demo/mock
                amount: 1000, // 0.001 ALGO demo
                note: new TextEncoder().encode(`Fund Proposal ${id}`),
                suggestedParams: params
            });

            const signedTxn = await signTransactions([algosdk.encodeUnsignedTransaction(txn)]);
            await algodClient.sendRawTransaction(signedTxn).do();

            toast.success("Funding Successful! You received a Supporter NFT.");

            setProposals(prev => prev.map(p =>
                p.id === id ? { ...p, raised: p.raised + 10 } : p
            ));

        } catch (e) {
            console.error(e);
            toast.error("Funding failed");
        }
    };

    const handleUseService = (id: number) => {
        // Mock Check for NFT
        toast.success("Access Granted! Dispensing Item...");
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 pb-32">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-black italic text-[var(--electric-volt)] mb-2">CAMPUS INFRASTRUCTURE DAO</h1>
                <p className="text-gray-400">Vote with your wallet. Upgrade your campus.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {proposals.map((prop) => (
                    <div key={prop.id} className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 hover:border-[var(--electric-volt)] transition-all">
                        <div className="h-48 overflow-hidden relative">
                            <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 backdrop-blur-sm flex justify-between items-center">
                                <div className="text-[var(--electric-volt)] font-bold flex items-center gap-2">
                                    <FaCoins /> {prop.raised} / {prop.target} ALGO
                                </div>
                                <div className="text-white text-xs font-bold bg-green-600 px-2 py-1 rounded">ACTIVE</div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-2">{prop.title}</h2>
                            <p className="text-gray-400 mb-6 h-12">{prop.description}</p>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                                <div
                                    className="bg-[var(--electric-volt)] h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${(prop.raised / prop.target) * 100}%` }}
                                ></div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleFund(prop.id)}
                                    className="flex-1 bg-[var(--electric-volt)] text-black font-bold py-3 rounded-xl hover:bg-yellow-400 flex items-center justify-center gap-2"
                                >
                                    <FaVoteYea /> FUND (10 ALGO)
                                </button>
                                <button
                                    onClick={() => handleUseService(prop.id)}
                                    className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 flex items-center justify-center gap-2 border border-gray-700"
                                >
                                    <FaCheckCircle /> USE SERVICE
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Create New Prompt */}
                <div className="bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed flex flex-col items-center justify-center p-8 text-center hover:bg-gray-900/80 transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-[var(--electric-volt)] transition-colors">
                        <FaBuilding className="text-2xl text-gray-400 group-hover:text-black" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300">Propose Infrastructure</h3>
                    <p className="text-gray-500 mt-2">Have an idea? Create a proposal and gather funding from peers.</p>
                </div>
            </div>
        </div>
    );
}

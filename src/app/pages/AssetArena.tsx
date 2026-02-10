import { useState, useRef, useCallback, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { FaQrcode, FaBoxOpen, FaCheckCircle, FaSpinner, FaCamera, FaUserShield, FaArrowLeft } from "react-icons/fa";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import { toast } from "sonner";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export function AssetArena() {
    const { activeAccount, signTransactions } = useWallet();
    const [mode, setMode] = useState<"borrower" | "lender">("borrower");
    // Force Rebuild Identifier: v2

    // Borrower State
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [borrowStatus, setBorrowStatus] = useState<"idle" | "scanning" | "confirming" | "success">("idle");
    const [txId, setTxId] = useState<string | null>(null);

    // Lender State
    const [lenderStep, setLenderStep] = useState<"idle" | "verifying" | "confirmed">("idle");
    const [verifiedItem, setVerifiedItem] = useState<string | null>(null);
    const webcamRef = useRef<Webcam>(null);
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [predictions, setPredictions] = useState<cocoSsd.DetectedObject[]>([]);

    // Smart Contract State
    const [appId, setAppId] = useState<string>("");
    const [trustAppId, setTrustAppId] = useState<string>("123456789"); // Default Demo ID
    const [collateralEnabled, setCollateralEnabled] = useState(true);
    const [trustScore, setTrustScore] = useState(0);
    const [isTrusted, setIsTrusted] = useState(false);

    // Fetch Trust Score
    useEffect(() => {
        const fetchTrust = async () => {
            if (!activeAccount || !trustAppId) return;
            try {
                const indexerClient = new algosdk.Indexer('', 'https://testnet-indexer.algonode.cloud', 443);
                const accountInfo = await indexerClient.lookupAccountAppLocalStates(activeAccount.address).do();
                const trustApp = accountInfo['apps-local-states']?.find((app: any) => app.id === parseInt(trustAppId));

                if (trustApp) {
                    trustApp['key-value']?.forEach((kv: any) => {
                        const key = atob(kv.key);
                        if (key === "Trust_Score") {
                            const score = kv.value.uint;
                            setTrustScore(score);
                            setIsTrusted(score >= 50);
                            if (score >= 50) setCollateralEnabled(false); // Auto-disable collateral
                        }
                    });
                }
            } catch (e) {
                console.error("Failed to fetch Trust Score", e);
            }
        };
        fetchTrust();
    }, [activeAccount, trustAppId]);

    // Load AI Model
    useEffect(() => {
        const loadModel = async () => {
            const m = await cocoSsd.load();
            setModel(m);
        };
        loadModel();
    }, []);

    // Handle QR Scan
    const handleScan = (result: any, error: any) => {
        if (!!result) {
            setScanResult(result?.text);
            setBorrowStatus("confirming");
        }
        if (!!error) {
            // console.info(error);
        }
    };

    // Opt-In to App
    const handleOptIn = async () => {
        if (!activeAccount || !appId) {
            toast.error("Connect Wallet & Enter App ID");
            return;
        }
        try {
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();

            const txn = algosdk.makeApplicationOptInTxnFromObject({
                sender: activeAccount.address,
                appIndex: parseInt(appId),
                suggestedParams: params
            });

            const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
            const signedTxns = await signTransactions([encodedTxn]);
            const filteredSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);

            await algodClient.sendRawTransaction(filteredSignedTxns).do();
            toast.success("Opt-In Successful!");
        } catch (e) {
            console.error(e);
            toast.error("Opt-In Failed");
        }
    };

    const initiateBorrow = async () => {
        if (!scanResult || !appId) return;
        if (!activeAccount) {
            toast.error("Please connect your wallet first");
            return;
        }

        setProcessing(true);

        try {
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();
            const appAddr = algosdk.getApplicationAddress(parseInt(appId));

            const txns = [];

            // 1. Conditional Collateral Payment
            // Only require 5 ALGO if Not Trusted (Score < 50)
            if (!isTrusted) {
                const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                    sender: activeAccount.address,
                    receiver: appAddr,
                    amount: 5000000, // 5 ALGO
                    suggestedParams: params
                });
                txns.push(payTxn);
            } else {
                toast.success("Trust Score >= 50: 0 Collateral Required! 🛡️");
            }

            // 2. App Call (Borrow)
            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: activeAccount.address,
                appIndex: parseInt(appId),
                appArgs: [new TextEncoder().encode("borrow"), new TextEncoder().encode(scanResult)],
                suggestedParams: params
            });
            txns.push(appCallTxn);

            // Group if needed
            if (txns.length > 1) {
                algosdk.assignGroupID(txns);
            }

            const encodedTxns = txns.map(t => algosdk.encodeUnsignedTransaction(t));
            const signedTxns = await signTransactions(encodedTxns);
            const filteredSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);

            const response = await algodClient.sendRawTransaction(filteredSignedTxns).do();
            const txid = response.txid;
            setTxId(txid);

            await algosdk.waitForConfirmation(algodClient, txid, 4);

            toast.success("Item Borrowed Successfully!");
            setBorrowStatus("success");

        } catch (error) {
            console.error("Borrow failed:", error);
            toast.error("Transaction failed.");
        } finally {
            setProcessing(false);
        }
    };

    // Admin Function: Confirm Return
    const confirmReturn = async () => {
        if (!activeAccount || !appId) return;
        const borrowerAddr = prompt("Enter Borrower Address:"); // In real app, scan QR of borrower
        if (!borrowerAddr) return;

        try {
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
            const params = await algodClient.getTransactionParams().do();
            // Increase fee for inner txn
            params.fee = BigInt(2000);
            params.flatFee = true;

            const txn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: activeAccount.address,
                appIndex: parseInt(appId),
                appArgs: [new TextEncoder().encode("return"), algosdk.decodeAddress(borrowerAddr).publicKey],
                accounts: [borrowerAddr],
                suggestedParams: params
            });

            const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
            const signedTxns = await signTransactions([encodedTxn]);
            const filteredSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);

            await algodClient.sendRawTransaction(filteredSignedTxns).do();
            toast.success("Return Confirmed! Collateral Refunded.");
            setLenderStep("idle");
            setVerifiedItem(null);
        } catch (e) {
            console.error(e);
            toast.error("Failed to Confirm Return");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 max-w-4xl mx-auto p-4">
            <header className="text-center mb-4 relative w-full">
                <h1 className="text-4xl font-bold text-[var(--electric-volt)] mb-2">ASSET ARENA</h1>
                <p className="text-[var(--holographic-silver)]">
                    Borrow equipment instantly. Smart Contract collateral ensures return.
                </p>

                {/* Mode Switcher */}
                <div className="absolute top-0 right-0">
                    <button
                        onClick={() => setMode(mode === "borrower" ? "lender" : "borrower")}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-gray-700 hover:border-[var(--electric-volt)] text-sm font-bold text-white transition-all"
                    >
                        {mode === "borrower" ? <FaUserShield /> : <FaArrowLeft />}
                        {mode === "borrower" ? "Lender Mode" : "Back to Borrower"}
                    </button>
                </div>

                <div className="flex items-center gap-2 justify-center mt-4">
                    <input
                        type="text"
                        placeholder="App ID"
                        className="bg-gray-800 text-white p-2 rounded border border-gray-700 w-32 text-center"
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                    />
                    <button onClick={handleOptIn} className="bg-blue-600 px-3 py-2 rounded text-white text-sm font-bold">
                        Opt-In
                    </button>
                </div>
            </header>

            {/* LENDER MODE */}
            {mode === "lender" ? (
                <div className="w-full max-w-2xl bg-[var(--deep-charcoal)] border border-[var(--algorand-cyan)]/30 rounded-3xl p-8 text-center shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                        <FaUserShield className="text-[var(--algorand-cyan)]" />
                        LENDER DASHBOARD
                    </h2>

                    {lenderStep === "idle" && (
                        <div className="space-y-6">
                            <p className="text-gray-400">Scan items to verify their condition before return.</p>
                            <button
                                onClick={() => setLenderStep("verifying")}
                                className="px-8 py-4 bg-[var(--algorand-cyan)] text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
                            >
                                <FaCamera /> SCAN ITEM FOR RETURN
                            </button>
                        </div>
                    )}

                    {lenderStep === "verifying" && (
                        <div className="space-y-4">
                            <h3 className="text-white font-bold">Point Camera at Item</h3>
                            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-[var(--algorand-cyan)]">
                                <Webcam
                                    ref={webcamRef}
                                    className="w-full h-full object-cover"
                                    videoConstraints={{ facingMode: "environment" }}
                                />
                                {/* Bounding Boxes Overlay */}
                                {predictions.length > 0 && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {predictions.map((p, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    position: 'absolute',
                                                    left: `${p.bbox[0]}px`,
                                                    top: `${p.bbox[1]}px`,
                                                    width: `${p.bbox[2]}px`,
                                                    height: `${p.bbox[3]}px`,
                                                    border: '2px solid #00D4FF',
                                                    backgroundColor: 'rgba(0, 212, 255, 0.1)'
                                                }}
                                            >
                                                <span className="bg-[var(--algorand-cyan)] text-black text-xs px-1 font-bold">
                                                    {p.class} {(p.score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-[var(--algorand-cyan)] animate-pulse">
                                    Scanning...
                                </div>
                            </div>
                            <button
                                onClick={() => setLenderStep("idle")}
                                className="text-gray-500 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {lenderStep === "confirmed" && (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <FaCheckCircle className="text-green-500 text-4xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Verification Complete</h3>
                                <p className="text-[var(--algorand-cyan)] font-mono mt-2">Item: {verifiedItem?.toUpperCase()}</p>
                            </div>

                            <button
                                onClick={confirmReturn}
                                className="w-full py-4 bg-[var(--electric-volt)] text-black font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition-all"
                            >
                                PROCESS RETURN ON-CHAIN
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* BORROWER MODE */
                <div className="relative w-full max-w-md aspect-square bg-black rounded-3xl overflow-hidden border-2 border-[var(--electric-volt)] shadow-[0_0_50px_rgba(255,230,0,0.2)]">
                    {borrowStatus === "idle" || borrowStatus === "scanning" ? (
                        <div className="h-full relative">
                            <QrReader
                                onResult={handleScan}
                                constraints={{ facingMode: "environment" }}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay Grid */}
                            <div className="absolute inset-0 border-2 border-[var(--electric-volt)]/50 m-8 rounded-lg animate-pulse pointer-events-none" />
                        </div>
                    ) : (
                        <div className="h-full bg-[var(--deep-charcoal)] flex flex-col items-center justify-center p-8 text-center">
                            {borrowStatus === "confirming" && (
                                <>
                                    <FaBoxOpen className="text-[var(--electric-volt)] text-6xl mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Item Scanned</h3>
                                    <p className="font-mono text-[var(--algorand-cyan)] text-xl mb-8">{scanResult}</p>

                                    <div className={`p-4 border rounded-xl mb-6 w-full ${isTrusted ? 'bg-green-900/20 border-green-500' : 'bg-gray-800 border-gray-700'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-300">Trust Score</span>
                                            <span className={`font-bold ${isTrusted ? 'text-green-400' : 'text-gray-400'}`}>{trustScore} / 100</span>
                                        </div>

                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className={isTrusted ? "text-gray-500 line-through" : "text-gray-300"}>Collateral (5 ALGO)</span>
                                            {isTrusted ? (
                                                <FaCheckCircle className="text-green-500 text-xl" />
                                            ) : (
                                                <span className="text-yellow-500 text-sm font-bold">REQUIRED</span>
                                            )}
                                        </label>
                                        <p className={`text-xs mt-2 text-left ${isTrusted ? 'text-green-400' : 'text-gray-500'}`}>
                                            {isTrusted ? "✨ Collateral Waived (Trusted User)" : "⚠️ Low Trust Score. Collateral Required."}
                                        </p>
                                    </div>

                                    {processing ? (
                                        <FaSpinner className="animate-spin text-3xl text-white" />
                                    ) : (
                                        <button
                                            onClick={initiateBorrow}
                                            className="px-8 py-3 bg-[var(--electric-volt)] hover:bg-yellow-400 text-black font-bold rounded-full shadow-lg transition-all"
                                        >
                                            CONFIRM & BORROW
                                        </button>
                                    )}
                                </>
                            )}

                            {borrowStatus === "success" && (
                                <>
                                    <FaCheckCircle className="text-green-500 text-6xl mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-2">BORROWED!</h3>
                                    <p className="text-[var(--holographic-silver)] mb-6">You have successfully borrowed this item.</p>
                                    <div className="text-left bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 break-all">
                                        TxID: {txId}
                                    </div>
                                    <button
                                        onClick={() => { setBorrowStatus("idle"); setScanResult(null); }}
                                        className="mt-8 text-white underline hover:text-[var(--electric-volt)]"
                                    >
                                        Borrow Another Item
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {mode === "borrower" && borrowStatus === "idle" && (
                <button
                    onClick={() => setBorrowStatus("scanning")}
                    className="flex items-center gap-2 px-8 py-4 bg-[var(--electric-volt)] hover:bg-yellow-400 text-black rounded-full font-bold text-lg shadow-lg transition-all"
                >
                    <FaQrcode /> SCAN QR CODE
                </button>
            )}
        </div>
    );
}

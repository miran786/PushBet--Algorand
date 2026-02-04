import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { FaQrcode, FaBoxOpen, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";

export function AssetArena() {
    const { activeAccount, signTransactions } = useWallet();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [borrowStatus, setBorrowStatus] = useState<"idle" | "scanning" | "confirming" | "success">("idle");
    const [txId, setTxId] = useState<string | null>(null);

    const handleScan = (result: any, _error: any) => {
        if (result && !scanResult) {
            setScanResult(result?.text);
            setBorrowStatus("confirming");
        }
    };

    const initiateBorrow = async () => {
        if (!scanResult) return;

        if (!activeAccount) {
            alert("Please connect your wallet first (top right)");
            return;
        }

        setProcessing(true);

        try {
            const senderAddress = activeAccount.address;

            // 2. Construct Transaction (5 ALGO Deposit)
            const algodToken = '';
            const algodServer = 'https://testnet-api.algonode.cloud';
            const algodPort = 443;
            const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

            const params = await algodClient.getTransactionParams().do();

            // Send to Admin/App address (Placeholder)
            const receiverAddress = "YOUR_ADMIN_WALLET_ADDRESS_HERE"; // TODO: Fetch from config
            const amount = 5000000; // 5 ALGO in microAlgos

            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: senderAddress,
                to: receiverAddress,
                amount: amount,
                suggestedParams: params,
                note: new TextEncoder().encode(`Borrow Item: ${scanResult}`)
            } as any);

            // 3. Sign Group (Single txn here) using useWallet hook
            // useWallet requires encoding the txn to base64 or passing the object. 
            // The library expects an array of byte arrays (Uint8Array) for signing usually, 
            // but the `signTransactions` helper takes specific encoded objects.
            // Actually, `signTransactions` in @txnlab/use-wallet takes `txn: string` (in base64) or `txn: Transaction`.
            // Let's pass the encoded transaction.

            const encodedTxn = algosdk.encodeUnsignedTransaction(txn);

            // The hook expects an array of SendTransactionFrom (which describes the signers) or just encoded txns?
            // Checking documentation pattern: usually signTransactions([ { txn: encoded... } ])

            const signedTxns = await signTransactions([encodedTxn]);

            // 4. Submit
            // The hook returns the signed blobs (Uint8Array[]). We send them.
            const response = await algodClient.sendRawTransaction(signedTxns).do();
            const txid = response.txid;
            setTxId(txid);

            // 5. Notify Backend
            await fetch("http://localhost:8000/api/borrow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: scanResult,
                    borrower: senderAddress,
                    depositTxId: txId
                })
            });

            setBorrowStatus("success");

        } catch (error) {
            console.error("Borrow failed:", error);
            alert("Transaction or Borrow processing failed.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 max-w-4xl mx-auto p-4">
            <header className="text-center mb-4">
                <h1 className="text-4xl font-bold text-[var(--electric-volt)] mb-2">ASSET ARENA</h1>
                <p className="text-[var(--holographic-silver)]">
                    Borrow equipment instantly. Smart Contract collateral ensures return.
                </p>
            </header>

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
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl mb-6">
                                    <p className="text-yellow-200 text-sm">Security Deposit required: <span className="font-bold">5 ALGO</span></p>
                                </div>
                                {processing ? (
                                    <FaSpinner className="animate-spin text-3xl text-white" />
                                ) : (
                                    <button
                                        onClick={initiateBorrow}
                                        className="px-8 py-3 bg-[var(--electric-volt)] hover:bg-yellow-400 text-black font-bold rounded-full shadow-lg transition-all"
                                    >
                                        CONFIRM & DEPOSIT
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

            {borrowStatus === "idle" && (
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

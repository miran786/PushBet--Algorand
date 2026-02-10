import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { FaShoppingCart, FaTags, FaStore } from 'react-icons/fa';
import { toast } from "sonner";

// Replace with verified App ID after deployment
const MARKET_APP_ID = 0;

export function Marketplace() {
    const { activeAccount, signTransactions } = useWallet();
    const [activeListings, setActiveListings] = useState<any[]>([]);
    const [listAssetId, setListAssetId] = useState("");
    const [listPrice, setListPrice] = useState("");
    const [appId, setAppId] = useState(MARKET_APP_ID.toString());

    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
    const indexerClient = new algosdk.Indexer('', 'https://testnet-indexer.algonode.cloud', 443);

    // Fetch Listings from Boxes
    const fetchListings = async () => {
        if (!appId || appId === "0") return;
        try {
            const appInfo = await algodClient.getApplicationBoxes(parseInt(appId)).do();
            const boxes = appInfo.boxes;

            const listings = await Promise.all(boxes.map(async (box: any) => {
                const boxName = box.name; // Base64 encoded asset ID
                const assetId = algosdk.decodeUint64(boxName, 'safe');

                const boxValue = await algodClient.getApplicationBoxByName(parseInt(appId), boxName).do();
                const valueBytes = boxValue.value;

                // Parse: [Seller (32)][Price (8)]
                const sellerBytes = valueBytes.slice(0, 32);
                const priceBytes = valueBytes.slice(32, 40);

                const seller = algosdk.encodeAddress(sellerBytes);
                const price = algosdk.decodeUint64(priceBytes, 'safe'); // microAlgos

                // Fetch Asset Info for UI
                const assetInfo = await indexerClient.lookupAssetByID(assetId).do();

                return {
                    assetId,
                    seller,
                    price: algosdk.microalgosToAlgos(price),
                    micros: price,
                    name: assetInfo.asset.params.name,
                    unitName: assetInfo.asset.params['unit-name']
                };
            }));

            setActiveListings(listings);
        } catch (e) {
            console.error("Failed to fetch listings", e);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [appId]);

    const handleList = async () => {
        if (!activeAccount || !listAssetId || !listPrice || !appId) return;

        try {
            const params = await algodClient.getTransactionParams().do();
            const appAddr = algosdk.getApplicationAddress(parseInt(appId));

            // 1. Asset Transfer (1 Unit to App)
            const axferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                sender: activeAccount.address,
                receiver: appAddr,
                amount: 1,
                assetIndex: parseInt(listAssetId),
                suggestedParams: params
            });

            // 2. App Call (List)
            // Args: [list, asset_id, price_micros]
            const priceMicros = algosdk.algosToMicroalgos(parseFloat(listPrice));
            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: activeAccount.address,
                appIndex: parseInt(appId),
                appArgs: [
                    new TextEncoder().encode("list"),
                    algosdk.encodeUint64(parseInt(listAssetId)),
                    algosdk.encodeUint64(priceMicros)
                ],
                boxes: [{ appIndex: parseInt(appId), name: algosdk.encodeUint64(parseInt(listAssetId)) }],
                suggestedParams: params
            });

            const txns = [axferTxn, appCallTxn];
            algosdk.assignGroupID(txns);

            const encodedTxns = txns.map(t => algosdk.encodeUnsignedTransaction(t));
            const signedTxns = await signTransactions(encodedTxns);
            const filtered = signedTxns.filter((t): t is Uint8Array => t !== null);

            await algodClient.sendRawTransaction(filtered).do();
            toast.success("Item Listed!");
            fetchListings();
        } catch (e) {
            console.error(e);
            toast.error("Listing Failed. Ensure App is opted into asset first (Manual step for demo).");
        }
    };

    const handleBuy = async (listing: any) => {
        if (!activeAccount || !appId) return;

        try {
            const params = await algodClient.getTransactionParams().do();
            // Increase fee for inner txn
            params.fee = BigInt(2000);
            params.flatFee = true;

            // 1. Payment to Seller
            const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: activeAccount.address,
                receiver: listing.seller,
                amount: listing.micros,
                suggestedParams: params
            });

            // 2. App Call (Buy)
            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: activeAccount.address,
                appIndex: parseInt(appId),
                appArgs: [
                    new TextEncoder().encode("buy"),
                    algosdk.encodeUint64(listing.assetId)
                ],
                boxes: [{ appIndex: parseInt(appId), name: algosdk.encodeUint64(listing.assetId) }],
                assets: [listing.assetId], // Foreign Asset for Inner Txn
                suggestedParams: params
            });

            const txns = [payTxn, appCallTxn];
            algosdk.assignGroupID(txns);

            const encodedTxns = txns.map(t => algosdk.encodeUnsignedTransaction(t));
            const signedTxns = await signTransactions(encodedTxns);
            const filtered = signedTxns.filter((t): t is Uint8Array => t !== null);

            await algodClient.sendRawTransaction(filtered).do();
            toast.success(`Bought ${listing.name}!`);
            fetchListings();

        } catch (e) {
            console.error(e);
            toast.error("Buy failed");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black italic flex items-center gap-3">
                        <FaStore className="text-[var(--electric-volt)]" /> MARKETPLACE
                    </h1>
                    <p className="text-gray-400">Trustless NFT Trading via Atomic Swaps.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="App ID"
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                        className="bg-gray-800 p-2 rounded text-white border border-gray-700 w-32"
                    />
                    <button onClick={fetchListings} className="bg-gray-700 px-4 rounded hover:bg-gray-600">Refresh</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LIST FORM */}
                <div className="bg-gray-900/80 p-6 rounded-2xl border border-white/10 h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaTags /> List Item
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Asset ID</label>
                            <input
                                type="number"
                                className="w-full bg-black p-3 rounded-lg border border-gray-700 focus:border-[var(--electric-volt)] outline-none"
                                value={listAssetId}
                                onChange={(e) => setListAssetId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Price (ALGO)</label>
                            <input
                                type="number"
                                className="w-full bg-black p-3 rounded-lg border border-gray-700 focus:border-[var(--electric-volt)] outline-none"
                                value={listPrice}
                                onChange={(e) => setListPrice(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleList}
                            className="w-full py-3 bg-[var(--electric-volt)] text-black font-bold rounded-lg hover:bg-yellow-400 transition-all"
                        >
                            LIST FOR SALE
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                            * App must be opted into the Asset before listing.
                        </p>
                    </div>
                </div>

                {/* LISTINGS GRID */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeListings.length === 0 ? (
                        <div className="col-span-2 text-center py-20 text-gray-500">
                            No active listings found.
                        </div>
                    ) : activeListings.map((item) => (
                        <div key={item.assetId} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">{item.unitName}</span>
                                </div>
                                <p className="text-xs text-gray-400 font-mono mb-4">Seller: {item.seller.slice(0, 8)}...</p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-2xl font-bold text-[var(--algorand-cyan)]">{item.price} ALGO</span>
                                <button
                                    onClick={() => handleBuy(item)}
                                    className="px-6 py-2 bg-[var(--algorand-cyan)] text-black font-bold rounded-full hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <FaShoppingCart /> BUY
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { FaShoppingCart, FaTags, FaStore } from 'react-icons/fa';
import { toast } from "sonner";

// Replace with verified App ID after deployment
const MARKET_APP_ID = 755297353;

export function Marketplace() {
    const { activeAccount, signTransactions } = useWallet();
    const [activeListings, setActiveListings] = useState<any[]>([]);
    const [appId, setAppId] = useState(MARKET_APP_ID.toString());

    // Mint & List State
    const [newItemName, setNewItemName] = useState("");
    const [newItemUnit, setNewItemUnit] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemImage, setNewItemImage] = useState(""); // URL
    const [isMinting, setIsMinting] = useState(false);

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

            if (listings.length === 0) {
                // Mock Data for Demo
                const mockListings = [
                    {
                        assetId: 123456,
                        seller: activeAccount?.address || "MOCK_SELLER_ADDRESS",
                        price: 50,
                        micros: 50000000,
                        name: "Calculus Textbook",
                        unitName: "MATH101"
                    },
                    {
                        assetId: 789012,
                        seller: "7XW...SEQ",
                        price: 15,
                        micros: 15000000,
                        name: "Gym Pass (1 Month)",
                        unitName: "GYM_1M"
                    }
                ];
                setActiveListings(mockListings);
            } else {
                setActiveListings(listings);
            }
        } catch (e) {
            console.error("Failed to fetch listings", e);
            // Mock Data on Error too
            const mockListings = [
                {
                    assetId: 123456,
                    seller: activeAccount?.address || "MOCK_SELLER_ADDRESS",
                    price: 50,
                    micros: 50000000,
                    name: "Calculus Textbook",
                    unitName: "MATH101"
                },
                {
                    assetId: 789012,
                    seller: "7XW...SEQ",
                    price: 15,
                    micros: 15000000,
                    name: "Gym Pass (1 Month)",
                    unitName: "GYM_1M"
                }
            ];
            setActiveListings(mockListings);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [appId]);

    const handleMintAndList = async () => {
        if (!activeAccount || !newItemName || !newItemUnit || !newItemPrice || !appId) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setIsMinting(true);
            const params = await algodClient.getTransactionParams().do();

            // 1. Asset Creation (Mint)
            const note = new TextEncoder().encode(JSON.stringify({
                standard: "arc69",
                properties: {
                    image: newItemImage || "https://placehold.co/400"
                }
            }));

            const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
                from: activeAccount.address,
                total: 1,
                decimals: 0,
                defaultFrozen: false,
                manager: activeAccount.address,
                reserve: activeAccount.address,
                freeze: activeAccount.address,
                clawback: activeAccount.address,
                unitName: newItemUnit,
                assetName: newItemName,
                assetURL: newItemImage || "https://placehold.co/400",
                note: note,
                suggestedParams: params
            });

            // Sign & Send Creation Txn independently first to get ID
            const encodedCreation = algosdk.encodeUnsignedTransaction(assetCreateTxn);
            const signedCreation = await signTransactions([encodedCreation]);
            const filteredCreation = signedCreation.filter((t): t is Uint8Array => t !== null);

            const { txId } = await algodClient.sendRawTransaction(filteredCreation).do();
            toast.info("Minting Asset... Please wait.");

            const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
            const assetIndex = result['asset-index'];
            toast.success(`Asset Minted! ID: ${assetIndex}`);

            // 2. List Item (Transfer to App + App Call)
            const appAddr = algosdk.getApplicationAddress(parseInt(appId));

            // Update params for next group
            const listParams = await algodClient.getTransactionParams().do();

            const axferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                sender: activeAccount.address,
                receiver: appAddr,
                amount: 1,
                assetIndex: assetIndex,
                suggestedParams: listParams
            });

            const priceMicros = algosdk.algosToMicroalgos(parseFloat(newItemPrice));
            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: activeAccount.address,
                appIndex: parseInt(appId),
                appArgs: [
                    new TextEncoder().encode("list"),
                    algosdk.encodeUint64(assetIndex),
                    algosdk.encodeUint64(priceMicros)
                ],
                boxes: [{ appIndex: parseInt(appId), name: algosdk.encodeUint64(assetIndex) }],
                suggestedParams: listParams
            });

            const txns = [axferTxn, appCallTxn];
            algosdk.assignGroupID(txns);

            const encodedTxns = txns.map(t => algosdk.encodeUnsignedTransaction(t));
            const signedTxns = await signTransactions(encodedTxns);
            const filteredTxns = signedTxns.filter((t): t is Uint8Array => t !== null);

            await algodClient.sendRawTransaction(filteredTxns).do();
            toast.success("Item Listed Successfully!");

            // Cleanup
            setNewItemName("");
            setNewItemUnit("");
            setNewItemPrice("");
            setNewItemImage("");
            fetchListings();

        } catch (e: any) {
            console.error(e);
            if (e.message && e.message.includes("Request Pending")) {
                toast.error("Wallet Request Pending. Check your Pera Wallet App.");
            } else {
                toast.error("Mint & List Failed. App might need to opt-in (Manual).");
            }
        } finally {
            setIsMinting(false);
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

        } catch (e: any) {
            console.error(e);
            if (e.message && e.message.includes("Request Pending")) {
                toast.error("Wallet Request Pending. Check your Pera Wallet App.");
            } else if (listing.assetId === 123456 || listing.assetId === 789012) {
                // Creating specific catch for mock items
                toast.success(`Bought ${listing.name}! (Demo Mode)`);
                // Remove from list to simulate purchase
                setActiveListings(prev => prev.filter(item => item.assetId !== listing.assetId));
            } else {
                toast.error("Buy failed");
            }
        }
    };

    return (
        <div className="text-white p-4">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black italic flex items-center gap-3 text-white">
                        <FaStore className="text-[var(--electric-volt)]" /> MARKETPLACE
                    </h1>
                    <p className="text-gray-400">Trustless NFT Trading via Atomic Swaps.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchListings} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 font-bold">Refresh Listings</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LIST FORM */}
                <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 h-fit shadow-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaTags /> Mint & List New Item
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Item Name</label>
                            <input
                                type="text"
                                className="w-full bg-black p-3 rounded-lg border border-gray-700 focus:border-[var(--electric-volt)] outline-none"
                                placeholder="e.g. Calculus Textbook"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Unit Name (Max 8 chars)</label>
                                <input
                                    type="text"
                                    maxLength={8}
                                    className="w-full bg-black p-3 rounded-lg border border-gray-700 focus:border-[var(--electric-volt)] outline-none"
                                    placeholder="e.g. MATH101"
                                    value={newItemUnit}
                                    onChange={(e) => setNewItemUnit(e.target.value.toUpperCase())}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Price (ALGO)</label>
                                <input
                                    type="number"
                                    className="w-full bg-black p-3 rounded-lg border border-gray-700 focus:border-[var(--electric-volt)] outline-none"
                                    placeholder="0.00"
                                    value={newItemPrice}
                                    onChange={(e) => setNewItemPrice(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Image URL (Optional)</label>
                            <input
                                type="text"
                                className="w-full bg-black p-3 rounded-lg border border-gray-700 focus:border-[var(--electric-volt)] outline-none"
                                placeholder="https://..."
                                value={newItemImage}
                                onChange={(e) => setNewItemImage(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleMintAndList}
                            disabled={isMinting}
                            className="w-full py-3 bg-[var(--electric-volt)] text-black font-bold rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-50"
                        >
                            {isMinting ? "MINTING..." : "MINT & LIST ITEM"}
                        </button>
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

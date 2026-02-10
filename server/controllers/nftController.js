const algosdk = require("algosdk");
require("dotenv").config();

// Mint a "Carbon Credit" Asset
const mintCarbonNFT = async (req, res) => {
    const { walletAddress, co2Saved } = req.body;

    if (!walletAddress || !co2Saved) {
        return res.status(400).json({ message: "Missing data" });
    }

    console.log(`Minting Carbon Credit NFT for ${walletAddress} (CO2: ${co2Saved}kg)`);

    try {
        const algodToken = '';
        const algodServer = 'https://testnet-api.algonode.cloud';
        const algodPort = 443;
        const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

        const mnemonic = process.env.REFEREE_MNEMONIC;
        if (!mnemonic) {
            throw new Error("REFEREE_MNEMONIC not set in .env");
        }
        const adminAccount = algosdk.mnemonicToSecretKey(mnemonic);

        const params = await algodClient.getTransactionParams().do();

        // Create the Asset (NFT)
        // Note: In real world, we'd pin metadata to IPFS. Here we use a simple object.
        const note = new TextEncoder().encode(JSON.stringify({
            standard: "arc69",
            description: "Carbon Credit Badge - Level 1",
            properties: {
                co2_saved: co2Saved,
                tier: "Eco-Warrior"
            }
        }));

        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
            from: adminAccount.addr,
            total: 1,
            decimals: 0,
            defaultFrozen: false,
            manager: adminAccount.addr,
            reserve: adminAccount.addr,
            freeze: undefined,
            clawback: undefined,
            unitName: "CO2-CRED",
            assetName: "Green Commuter Badge",
            assetURL: "https://example.com/badge.png", // Placeholder
            note: note,
            suggestedParams: params,
        });

        const signedTxn = txn.signTxn(adminAccount.sk);
        const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

        console.log(`NFT Mint Transaction: ${txId}`);
        // Wait for confirmation to get Asset Index? For speed we might just return txId.

        // In a real app, we would then TRANSFER this asset to the user.
        // But the user needs to opt-in first. 
        // For this Hackathon Demo, we will just MINT it from the House Wallet and tell the user "Badge Minted for you! (Check House Wallet)"
        // OR we just assume this represents the "Allocation" of the credit.

        res.status(200).json({
            message: "Green Commuter NFT Minted!",
            txId: txId,
            assetName: "Green Commuter Badge"
        });

    } catch (error) {
        console.error("NFT Minting failed:", error);
        res.status(500).json({ message: "NFT Minting failed" });
    }
};

module.exports = {
    mintCarbonNFT
};

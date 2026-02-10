import algosdk from 'algosdk';

const MARKET_APP_ID = 755297353;
const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;

const INDEXER_SERVER = 'https://testnet-indexer.algonode.cloud';
const INDEXER_PORT = 443;

async function verifyMarketplace() {
    console.log(`Starting Marketplace Verification for App ID: ${MARKET_APP_ID}`);

    const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
    const indexerClient = new algosdk.Indexer(ALGOD_TOKEN, INDEXER_SERVER, INDEXER_PORT);

    try {
        console.log("1. Fetching Application Boxes...");
        const appInfo = await algodClient.getApplicationBoxes(MARKET_APP_ID).do();
        const boxes = appInfo.boxes;

        console.log(`✅ Found ${boxes.length} active listings (boxes).`);

        if (boxes.length === 0) {
            console.warn("⚠️ No listings found. This might be expected if the market is empty, but verification of parsing logic cannot proceed.");
            return;
        }

        console.log("2. Verifying Item Details...");

        for (const box of boxes) {
            const boxName = box.name; // Base64 encoded asset ID
            const assetId = algosdk.decodeUint64(boxName, 'safe');

            console.log(`   - Processing Box for Asset ID: ${assetId}`);

            const boxValue = await algodClient.getApplicationBoxByName(MARKET_APP_ID, boxName).do();
            const valueBytes = boxValue.value;

            // Parsing Logic from Marketplace.tsx
            // [Seller (32)][Price (8)]
            if (valueBytes.length !== 40) {
                console.error(`❌ Invalid Box Value Length: ${valueBytes.length} (Expected 40)`);
                continue;
            }

            const sellerBytes = valueBytes.slice(0, 32);
            const priceBytes = valueBytes.slice(32, 40);

            const seller = algosdk.encodeAddress(sellerBytes);
            const priceMicros = algosdk.decodeUint64(priceBytes, 'safe');
            const priceAlgo = algosdk.microalgosToAlgos(priceMicros);

            console.log(`     > Seller: ${seller}`);
            console.log(`     > Price: ${priceAlgo} ALGO (${priceMicros} µAlgo)`);

            // Fetch Asset Info
            try {
                const assetInfo = await indexerClient.lookupAssetByID(assetId).do();
                const name = assetInfo.asset.params.name;
                const unit = assetInfo.asset.params['unit-name'];
                console.log(`     > Asset: ${name} (${unit})`);
                console.log(`✅ Verified Listing: ${name} for ${priceAlgo} ALGO`);
            } catch (err) {
                console.error(`     ❌ Failed to fetch asset info for ID ${assetId}:`, err.message);
            }
        }

        console.log("\n✅ Marketplace Data Fetching Verification Complete!");

    } catch (e: any) {
        console.error("\n❌ Verification Failed:", e.message);
    }
}

verifyMarketplace();

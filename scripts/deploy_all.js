import algosdk from 'algosdk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// dotenv is not needed if running with node --env-file=.env
// import dotenv from 'dotenv';
// dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// Get Account from Mnemonic
const MNEMONIC = process.env.MNEMONIC;
if (!MNEMONIC) {
    console.error("❌ CRTICAL ERROR: MNEMONIC not found in .env file.");
    console.error("Please add MNEMONIC=your_testnet_phrase to a .env file in the root directory.");
    process.exit(1);
}
const deployer = algosdk.mnemonicToSecretKey(MNEMONIC);

async function compilePyTeal(fileName) {
    console.log(`🔨 Compiling ${fileName}...`);
    try {
        const contractsDir = path.join(__dirname, '..', 'contracts');
        // Check python version
        // execSync('python --version', { cwd: contractsDir, stdio: 'inherit' });

        execSync(`python ${fileName}`, { cwd: contractsDir });
        console.log(`✅ ${fileName} compiled to TEAL.`);
    } catch (e) {
        console.error(`❌ Failed to compile ${fileName}.`);
        if (e.stdout) console.log("STDOUT:", e.stdout.toString());
        if (e.stderr) console.error("STDERR:", e.stderr.toString());
        process.exit(1);
    }
}

async function compileTeal(tealFileName) {
    const tealPath = path.join(__dirname, '..', 'contracts', tealFileName);
    const tealSource = fs.readFileSync(tealPath, 'utf8');
    const compiled = await algodClient.compile(tealSource).do();
    return new Uint8Array(Buffer.from(compiled.result, 'base64'));
}

async function deployApp(approvalBin, clearBin, schema, args = []) {
    const params = await algodClient.getTransactionParams().do();

    // Create Application via AppCall (Index 0)
    // Create Application
    const sender = deployer.addr.toString();
    console.log("Using sender:", sender);

    if (!algosdk.isValidAddress(sender)) {
        throw new Error(`Invalid Address format: ${sender}`);
    }

    const txn = algosdk.makeApplicationCreateTxnFromObject({
        sender: sender,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: approvalBin,
        clearProgram: clearBin,
        numLocalInts: schema.localInts,
        numLocalByteSlices: schema.localBytes,
        numGlobalInts: schema.globalInts,
        numGlobalByteSlices: schema.globalBytes,
        appArgs: args
    });

    const signedTxn = txn.signTxn(deployer.sk);
    const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Send Result:", JSON.stringify(sendResult, null, 2));
    const txId = sendResult.txId || sendResult.txid; // Handle case
    console.log(`🚀 Deploying App (TxID: ${txId})...`);

    const result = await algosdk.waitForConfirmation(algodClient, txId, 10);
    // Handle BigInt serialization
    const replacer = (key, value) => typeof value === 'bigint' ? value.toString() : value;
    fs.writeFileSync('deploy_result.json', JSON.stringify(result, replacer, 2));
    console.log("Confirmation Result saved to deploy_result.json");

    // Try to find the App ID property
    // Note: application-index might be BigInt too
    let appId = result['application-index'];
    if (appId === undefined) appId = result['created-application-index'];
    if (appId === undefined) appId = result['applicationIndex'];
    if (appId === undefined) appId = result['createdApplicationIndex'];

    // Convert BigInt id to number/string for return
    if (typeof appId === 'bigint') appId = Number(appId);

    console.log(`✅ App Deployed! ID: ${appId}`);
    return appId;
}

async function main() {
    console.log(`Deploying with account: ${deployer.addr}`);

    // 1. Deploy Trust Score Contract
    console.log("\n--- 1. TRUST SCORE PROTOCOL ---");
    await compilePyTeal('trust_score.py');
    const trustApproval = await compileTeal('trust_score.teal');

    // Simple Clear State (Return 1)
    const clearProgramSource = "#pragma version 6\nint 1\nreturn";
    const clearProgramCompiled = await algodClient.compile(clearProgramSource).do();
    const clearBin = new Uint8Array(Buffer.from(clearProgramCompiled.result, 'base64'));

    // Schema: 3 Local Ints (Trust, Fitness, Eco)
    // Schema: 3 Local Ints (Trust, Fitness, Eco)
    // const trustAppId = await deployApp(trustApproval, clearBin, {
    //     localInts: 3, localBytes: 0, globalInts: 0, globalBytes: 0
    // });
    const trustAppId = 755292569; // Hardcoded from previous success
    console.log(`✅ Trust App ID (Existing): ${trustAppId}`);

    // 2. Deploy Asset Escrow (Updated with Trust App ID)
    console.log("\n--- 2. ASSET ESCROW (LENDING) ---");
    // const escrowPath = path.join(__dirname, '..', 'contracts', 'asset_escrow.py');
    // let escrowContent = fs.readFileSync(escrowPath, 'utf8');

    // Skipping replacement as we manually fixed asset_escrow.py
    // const trustAppIdStr = String(trustAppId);
    // ... logic removed ...

    await compilePyTeal('asset_escrow.py');
    const escrowApproval = await compileTeal('asset_escrow.teal');

    // Schema: 3 Local Ints (Collateral, Time), 1 Local Bytes (Item)
    const escrowAppId = await deployApp(escrowApproval, clearBin, {
        localInts: 3, localBytes: 1, globalInts: 0, globalBytes: 0
    });

    // Reverting not needed

    // 3. Deploy Marketplace
    console.log("\n--- 3. TRUSTLESS MARKETPLACE ---");
    await compilePyTeal('marketplace_contract.py');
    const marketApproval = await compileTeal('marketplace_contract.teal');

    // Schema: Boxes enabled (Requires version >= 8)
    const marketAppId = await deployApp(marketApproval, clearBin, {
        localInts: 0, localBytes: 0, globalInts: 0, globalBytes: 0
    });

    // Fund Marketplace MBR
    // We send 1 ALGO to the app address
    const marketAddr = algosdk.getApplicationAddress(marketAppId);
    const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: deployer.addr,
        to: marketAddr,
        amount: 1000000, // 1 ALGO
        suggestedParams: await algodClient.getTransactionParams().do()
    });
    const signedPay = payTxn.signTxn(deployer.sk);
    await algodClient.sendRawTransaction(signedPay).do();
    console.log(`💰 Funded Marketplace MBR (1 ALGO) -> ${marketAddr}`);

    console.log("\n==================================");
    console.log("DEPLOYMENT COMPLETE");
    console.log("==================================");
    console.log(`TRUST_APP_ID=${trustAppId}`);
    console.log(`ESCROW_APP_ID=${escrowAppId}`);
    console.log(`MARKET_APP_ID=${marketAppId}`);
    console.log("==================================");
    console.log("👉 Update these IDs in your Frontend Constants!");
}

main().catch(e => {
    const errorLog = {
        message: e.message,
        stack: e.stack,
        response: e.response ? e.response.body : null
    };
    fs.writeFileSync('deploy_error.json', JSON.stringify(errorLog, null, 2));
    console.log("❌ Error saved to deploy_error.json");
});

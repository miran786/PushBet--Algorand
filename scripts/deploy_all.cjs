const algosdk = require('algosdk');
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// --- HELPER: Compile TEAL ---
async function compileProgram(client, programSource) {
    const encoder = new TextEncoder();
    const programBytes = encoder.encode(programSource);
    const compileResponse = await client.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, 'base64'));
}

// --- HELPER: Deploy Contract ---
async function deployContract(name, approvalPath, clearStateSource, account, params, schema) {
    console.log(`\n--- Deploying ${name} ---`);
    const approvalSource = fs.readFileSync(path.resolve(__dirname, approvalPath), 'utf8');
    
    const approvalBin = await compileProgram(algodClient, approvalSource);
    const clearBin = await compileProgram(algodClient, clearStateSource);

    const txn = algosdk.makeApplicationCreateTxnFromObject({
        sender: account.addr,
        approvalProgram: approvalBin,
        clearProgram: clearBin,
        numLocalInts: schema.localInts,
        numLocalByteSlices: schema.localBytes,
        numGlobalInts: schema.globalInts,
        numGlobalByteSlices: schema.globalBytes,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
    });

    const signedTxn = txn.signTxn(account.sk);
    const tx = await algodClient.sendRawTransaction(signedTxn).do();
    console.log(`${name} Deploy TxID:`, tx.txid);
    
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txid, 4);
    const appId = confirmedTxn["application-index"];
    console.log(`✅ ${name} Deployed! App ID:`, appId);
    return appId;
}

async function main() {
    // 1. Recover Account
    // Replace this with your funded mnemonic
    const MNEMONIC = "switch also east able item youth moon rigid rice fetch blame skin snack luxury patrol leaf tool symbol blind lottery return elder sponsor absent old";
    const account = algosdk.mnemonicToSecretKey(MNEMONIC);
    console.log("Deployer Address:", account.addr);

    const params = await algodClient.getTransactionParams().do();
    // Upgrade to version 8 to match Marketplace requirements (Box Storage)
    const clearState = "#pragma version 8\nint 1\nreturn";

    try {
        // 2. Deploy Trust Score (Local State Schema: 3 Ints)
        const trustAppId = await deployContract("Trust Score", "../contracts/trust_score.teal", clearState, account, params, {
            localInts: 3, localBytes: 0, globalInts: 0, globalBytes: 0
        });

        // 3. Deploy Commute App (Local: 4 Ints, 4 Bytes)
        const commuteAppId = await deployContract("Commute App", "../contracts/commute_checkin.teal", clearState, account, params, {
            localInts: 4, localBytes: 4, globalInts: 0, globalBytes: 0
        });

        // 4. Deploy Marketplace (Boxes required - App Call logic)
        // Marketplace uses Box Storage, not Global State for listings
        const marketAppId = await deployContract("Marketplace", "../contracts/marketplace_contract.teal", clearState, account, params, {
            localInts: 0, localBytes: 0, globalInts: 0, globalBytes: 0
        });

        console.log("\n--- DEPLOYMENT SUMMARY ---");
        console.log("TRUST_APP_ID:", trustAppId);
        console.log("COMMUTE_APP_ID:", commuteAppId);
        console.log("MARKETPLACE_APP_ID:", marketAppId);
        
        console.log("\n⚠️  Update these IDs in your React Frontend constants!");

    } catch (e) {
        console.error("Deployment Failed:", e);
    }
}

main();

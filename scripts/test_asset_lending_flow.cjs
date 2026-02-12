const algosdk = require('algosdk');
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// --- ACCOUNTS ---
const MNEMONIC = "switch also east able item youth moon rigid rice fetch blame skin snack luxury patrol leaf tool symbol blind lottery return elder sponsor absent old";
const account = algosdk.mnemonicToSecretKey(MNEMONIC);

console.log("USING ACCOUNT:");
console.log("Address:", account.addr);

async function compileProgram(client, programSource) {
    const encoder = new TextEncoder();
    const programBytes = encoder.encode(programSource);
    const compileResponse = await client.compile(programBytes).do();
    const compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, 'base64'));
    return compiledBytes;
}

async function main() {
    console.log("\n--- DEPLOYING ASSET LENDING CONTRACT ---");

    // 1. Compile Contract
    const assetTealPath = path.resolve(__dirname, '../contracts/asset_escrow.teal');
    const assetTeal = fs.readFileSync(assetTealPath, 'utf8');
    const clearState = "#pragma version 8\nint 1\nreturn";

    const approvalBin = await compileProgram(algodClient, assetTeal);
    const clearBin = await compileProgram(algodClient, clearState);

    let params = await algodClient.getTransactionParams().do();

    // 2. Deploy App
    const txn = algosdk.makeApplicationCreateTxnFromObject({
        sender: account.addr,
        approvalProgram: approvalBin,
        clearProgram: clearBin,
        numLocalInts: 4,
        numLocalByteSlices: 4,
        numGlobalInts: 0,
        numGlobalByteSlices: 0,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
    });

    const signedTxn = txn.signTxn(account.sk);
    const tx = await algodClient.sendRawTransaction(signedTxn).do();
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txid, 4);
    const appId = confirmedTxn["application-index"] || confirmedTxn.applicationIndex;
    console.log("✅ Asset Lending App Deployed! App ID:", appId);

    // 3. Opt-In
    console.log("\n--- Opting in ---");
    params = await algodClient.getTransactionParams().do();
    const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
        sender: account.addr,
        appIndex: appId,
        suggestedParams: params
    });
    const signedOptIn = optInTxn.signTxn(account.sk);
    const txOpt = await algodClient.sendRawTransaction(signedOptIn).do();
    await algosdk.waitForConfirmation(algodClient, txOpt.txid, 4);
    console.log("✅ Opt-In Successful");

    console.log("\n🎉 DEPLOYMENT AND OPT-IN TESTS PASSED!");
    console.log("\nNote: Full borrow/return flow testing requires manual UI verification.");
    console.log("Please test the following in the browser:");
    console.log("1. Navigate to Asset Arena");
    console.log("2. Register an item");
    console.log("3. Borrow the item");
    console.log("4. Return the item");
}

main().catch(e => {
    console.error(e);
    fs.writeFileSync('scripts/error.log', e.stack || e.toString());
    process.exit(1);
});

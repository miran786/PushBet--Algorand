import algosdk from 'algosdk';
import * as fs from 'fs';
import * as path from 'path';

// --- CONFIG ---
const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// --- HELPER: Create Account ---
const account = algosdk.generateAccount();
console.log("TEST ACCOUNT GENERATED:");
console.log("Address:", account.addr);
console.log("Mnemonic:", algosdk.secretKeyToMnemonic(account.sk));
console.log("\n⚠️  PLEASE FUND THIS ACCOUNT ON TESTNET DISPENSER: https://bank.testnet.algorand.network/");
console.log("Waiting 15 seconds for funding...");

const delay = ms => new Promise(res => setTimeout(res, ms));

async function waitForBalance(addr) {
    for (let i = 0; i < 30; i++) {
        try {
            const info = await algodClient.accountInformation(addr).do();
            if (info.amount > 0) {
                console.log(`\nFunds received! Balance: ${info.amount} microAlgos`);
                return true;
            }
        } catch (e) {
            // Ignore error
        }
        process.stdout.write(".");
        await delay(2000);
    }
    return false;
}

// --- HELPER: Compile TEAL ---
async function compileProgram(client, programSource) {
    const encoder = new TextEncoder();
    const programBytes = encoder.encode(programSource);
    const compileResponse = await client.compile(programBytes).do();
    const compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, 'base64'));
    return compiledBytes;
}

// --- DEPLOY SCRIPT ---
async function main() {
    console.log("\n--- Verifying Contract Compilation ---");
    const commuteTealPath = path.resolve(__dirname, '../contracts/commute_checkin.teal');
    const commuteTeal = fs.readFileSync(commuteTealPath, 'utf8');
    
    const assetTealPath = path.resolve(__dirname, '../contracts/asset_escrow.teal');
    const assetTeal = fs.readFileSync(assetTealPath, 'utf8');

    // Simple Clear State
    const clearState = "#pragma version 6\nint 1\nreturn";

    try {
        console.log("Compiling Commute Contract...");
        await compileProgram(algodClient, commuteTeal);
        console.log("✅ Commute Contract Compiled Successfully!");

        console.log("Compiling Asset Contract...");
        await compileProgram(algodClient, assetTeal);
        console.log("✅ Asset Contract Compiled Successfully!");
        
        console.log("Compiling Clear State...");
        await compileProgram(algodClient, clearState);
        console.log("✅ Clear State Compiled Successfully!");

    } catch (e) {
        console.error("❌ Compilation Failed:", e);
        process.exit(1);
    }

    console.log("\n🎉 CONTRACTS ARE VALID. Ready for Deployment.");
}

main().catch(console.error);
